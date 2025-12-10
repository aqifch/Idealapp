/**
 * Notification Automation Engine
 * Handles automated notification triggers and processing
 */

import { supabase } from '../config/supabase';
import { toast } from 'sonner';
import { getDefaultTemplate, renderNotificationFromTemplate } from './notificationTemplates';
import { errorLogger } from './errorLogger';

export interface NotificationAutomation {
  id: string;
  name: string;
  description?: string | null;
  trigger_type: 
    | 'order_placed'
    | 'order_status_changed'
    | 'order_confirmed'
    | 'order_preparing'
    | 'order_ready'
    | 'order_completed'
    | 'order_cancelled'
    | 'product_added'
    | 'deal_started'
    | 'deal_ended'
    | 'scheduled'
    | 'product_low_stock'
    | 'user_registered';
  conditions: Record<string, any>;
  template_id?: string | null;
  notification_data: Record<string, any>;
  target_audience: 'all' | 'user' | 'admin' | 'segment';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description?: string | null;
  type: 'promo' | 'announcement' | 'seasonal' | 'product_launch' | 'deal_alert';
  target_audience: 'all' | 'segment' | 'specific';
  audience_segment: Record<string, any>;
  schedule_type: 'immediate' | 'scheduled' | 'recurring';
  scheduled_at?: string | null;
  recurrence_pattern: Record<string, any>;
  notification_data: Record<string, any>;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  sent_count: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all active automations
 */
export const fetchActiveAutomations = async (): Promise<NotificationAutomation[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_automations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching automations:', error);
    return [];
  }
};

/**
 * Fetch automations by trigger type
 */
export const fetchAutomationsByTrigger = async (
  triggerType: NotificationAutomation['trigger_type']
): Promise<NotificationAutomation[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_automations')
      .select('*')
      .eq('trigger_type', triggerType)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching automations by trigger:', error);
    return [];
  }
};

/**
 * Evaluate automation conditions
 */
export const evaluateConditions = (
  conditions: Record<string, any>,
  context: Record<string, any>
): boolean => {
  // Simple condition evaluation
  // Can be extended for complex logic
  
  if (!conditions || Object.keys(conditions).length === 0) {
    return true; // No conditions = always trigger
  }

  for (const [key, value] of Object.entries(conditions)) {
    if (context[key] !== value) {
      return false;
    }
  }

  return true;
};

/**
 * Create notification from automation
 */
export const createNotificationFromAutomation = async (
  automation: NotificationAutomation,
  context: Record<string, any>,
  targetUserId?: string
): Promise<boolean> => {
  try {
    // Evaluate conditions
    if (!evaluateConditions(automation.conditions, context)) {
      console.log('Automation conditions not met');
      return false;
    }

    let title: string;
    let message: string;
    let image_url: string | null = null;
    let action_url: string | null = null;

    // Use template if available
    if (automation.template_id) {
      const rendered = await renderNotificationFromTemplate(
        automation.template_id,
        context
      );
      
      if (rendered) {
        title = rendered.title;
        message = rendered.message;
        image_url = rendered.image_url || null;
        action_url = rendered.action_url || null;
      } else {
        // Fallback to notification_data
        title = automation.notification_data.title || 'Notification';
        message = automation.notification_data.message || '';
      }
    } else {
      // Use notification_data directly
      title = automation.notification_data.title || 'Notification';
      message = automation.notification_data.message || '';
      image_url = automation.notification_data.image_url || null;
      action_url = automation.notification_data.action_url || null;
      
      // Render placeholders in notification_data if present
      if (title && (title.includes('{{') || title.includes('{{'))) {
        const { renderTemplate } = await import('./notificationTemplates');
        const renderedTitle = renderTemplate(title, context);
        if (renderedTitle && renderedTitle !== title) {
          title = renderedTitle;
        }
      }
      if (message && (message.includes('{{') || message.includes('{{'))) {
        const { renderTemplate } = await import('./notificationTemplates');
        const renderedMessage = renderTemplate(message, context);
        if (renderedMessage && renderedMessage !== message) {
          message = renderedMessage;
        }
      }
      
      // If notification_data is empty, use default messages based on trigger
      if (!title || title === 'Notification' || !message) {
        const defaultMessages: Record<string, { title: string; message: string }> = {
          'order_placed': {
            title: `Order ${context.orderNumber || ''} Placed!`,
            message: `Your order has been placed successfully. Total: Rs ${context.total || 0}`
          },
          'order_confirmed': {
            title: `Order ${context.orderNumber || ''} Confirmed!`,
            message: `Your order has been confirmed and will be ready in ${context.estimatedTime || '30-45 minutes'}`
          },
          'order_status_changed': {
            title: `Order ${context.orderNumber || ''} Status Updated`,
            message: `Your order status has been changed to ${context.newStatus || context.status || 'updated'}`
          },
          'order_preparing': {
            title: `Order ${context.orderNumber || ''} is Being Prepared`,
            message: `We're preparing your order now!`
          },
          'order_ready': {
            title: `Order ${context.orderNumber || ''} is Ready!`,
            message: `Your order is ready for pickup/delivery!`
          },
          'order_completed': {
            title: `Order ${context.orderNumber || ''} Completed!`,
            message: `Thank you for your order!`
          },
          'order_cancelled': {
            title: `Order ${context.orderNumber || ''} Cancelled`,
            message: `Your order has been cancelled.`
          }
        };
        
        const defaultMsg = defaultMessages[automation.trigger_type];
        if (defaultMsg) {
          title = defaultMsg.title;
          message = defaultMsg.message;
        }
      }
    }

    // Determine notification type from trigger
    const typeMap: Record<string, string> = {
      'order_placed': 'order',
      'order_status_changed': 'order',
      'order_confirmed': 'order',
      'order_preparing': 'order',
      'order_ready': 'order',
      'order_completed': 'order',
      'order_cancelled': 'order',
      'product_added': 'promo',
      'deal_started': 'promo',
      'deal_ended': 'promo',
      'user_registered': 'system',
      'product_low_stock': 'system',
    };

    const notificationType = typeMap[automation.trigger_type] || 'system';
    
    // Ensure placeholders are rendered before creating notification
    if (title && (title.includes('{{') || title.includes('{{'))) {
      const { renderTemplate } = await import('./notificationTemplates');
      const renderedTitle = renderTemplate(title, context);
      if (renderedTitle && renderedTitle !== title) {
        title = renderedTitle;
        console.log('✅ Rendered title:', title);
      }
    }
    if (message && (message.includes('{{') || message.includes('{{'))) {
      const { renderTemplate } = await import('./notificationTemplates');
      const renderedMessage = renderTemplate(message, context);
      if (renderedMessage && renderedMessage !== message) {
        message = renderedMessage;
        console.log('✅ Rendered message:', message);
      }
    }
    
    // Log for debugging
    console.log('🔔 Creating notification:', {
      automation: automation.name,
      trigger: automation.trigger_type,
      type: notificationType,
      title,
      message,
      targetUserId,
      targetAudience: automation.target_audience,
      context: context
    });

    // Create notification
    const notificationData: any = {
      type: notificationType,
      title,
      message,
      image_url,
      action_url,
      is_broadcast: automation.target_audience === 'all',
      automation_id: automation.id,
      metadata: context,
    };

    // Add target user if not broadcast
    if (automation.target_audience === 'user' && targetUserId) {
      notificationData.target_user_id = targetUserId;
      notificationData.is_broadcast = false;
    } else if (automation.target_audience === 'all') {
      notificationData.is_broadcast = true;
      notificationData.target_user_id = null;
    } else if (targetUserId) {
      // Default to user if userId provided
      notificationData.target_user_id = targetUserId;
      notificationData.is_broadcast = false;
    }

    // Add product/deal IDs if in context
    if (context.productId) {
      notificationData.product_id = context.productId;
    }
    if (context.dealId) {
      notificationData.deal_id = context.dealId;
    }

    // Create notification directly in Supabase database (bypass Edge Function to avoid KV store errors)
    console.log('📤 Creating notification directly in Supabase database:', {
      type: notificationType,
      title,
      message,
      automation: automation.name
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'notificationAutomation.ts:createNotificationFromAutomation:directDB',message:'Creating notification directly in database',data:{automation:automation.name,trigger:automation.trigger_type,type:notificationType},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Prepare notification data for Supabase
    const dbNotificationData: any = {
      type: notificationType,
      title,
      message,
      image_url: image_url || null,
      action_url: action_url || null,
      is_broadcast: automation.target_audience === 'all',
      is_read: false,
      automation_id: automation.id,
      metadata: context,
    };
    
    // Add target user if not broadcast
    if (automation.target_audience === 'user' && targetUserId) {
      dbNotificationData.target_user_id = targetUserId;
      dbNotificationData.is_broadcast = false;
    } else if (automation.target_audience === 'all') {
      dbNotificationData.is_broadcast = true;
      dbNotificationData.target_user_id = null;
    } else if (targetUserId) {
      dbNotificationData.target_user_id = targetUserId;
      dbNotificationData.is_broadcast = false;
    }
    
    // Add product/deal IDs if in context
    if (context.productId) {
      dbNotificationData.product_id = context.productId;
    }
    if (context.dealId) {
      dbNotificationData.deal_id = context.dealId;
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(dbNotificationData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw error;
    }
    
    console.log('✅ Notification created in Supabase database:', data.id);
    
    // Trigger refresh event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    }, 500);
    
    return true;
  } catch (error: any) {
    console.error('Error creating notification from automation (outer):', error);
    return false;
  }
};

/**
 * Trigger automation by type
 */
export const triggerAutomation = async (
  triggerType: NotificationAutomation['trigger_type'],
  context: Record<string, any>,
  targetUserId?: string
): Promise<void> => {
  try {
    const automations = await fetchAutomationsByTrigger(triggerType);
    
    if (automations.length === 0) {
      console.log(`⚠️ No active automations found for trigger: ${triggerType}`);
      console.log(`💡 Creating notification directly without automation...`);
      
      // Fallback: Create notification directly if no automation exists
      try {
        const { getFunctionUrl, getPublicAnonKey } = await import('../config/supabase');
        
        // Default notification messages based on trigger type
        const defaultMessages: Record<string, { title: string; message: string }> = {
          'order_placed': {
            title: `Order ${context.orderNumber || ''} Placed!`,
            message: `Your order has been placed successfully. Total: Rs ${context.total || 0}`
          },
          'order_confirmed': {
            title: `Order ${context.orderNumber || ''} Confirmed!`,
            message: `Your order has been confirmed and will be ready in ${context.estimatedTime || '30-45 minutes'}`
          },
          'order_status_changed': {
            title: `Order ${context.orderNumber || ''} Status Updated`,
            message: `Your order status has been changed to ${context.newStatus || context.status || 'updated'}`
          },
          'order_preparing': {
            title: `Order ${context.orderNumber || ''} is Being Prepared`,
            message: `We're preparing your order now!`
          },
          'order_ready': {
            title: `Order ${context.orderNumber || ''} is Ready!`,
            message: `Your order is ready for pickup/delivery!`
          },
          'order_completed': {
            title: `Order ${context.orderNumber || ''} Completed!`,
            message: `Thank you for your order!`
          },
          'order_cancelled': {
            title: `Order ${context.orderNumber || ''} Cancelled`,
            message: `Your order has been cancelled.`
          }
        };
        
        const defaultMsg = defaultMessages[triggerType] || {
          title: 'Order Update',
          message: `Your order ${context.orderNumber || ''} has been updated.`
        };
        
        // Get current user if targetUserId not provided
        let finalTargetUserId = targetUserId;
        if (!finalTargetUserId) {
          try {
            const { supabase } = await import('../config/supabase');
            const { data: { user } } = await supabase.auth.getUser();
            finalTargetUserId = user?.id || 'all';
          } catch (err) {
            finalTargetUserId = 'all';
          }
        }
        
        console.log('📤 Creating notification directly in database (no automation):', {
          type: triggerType.includes('order') ? 'order' : 'system',
          title: defaultMsg.title,
          message: defaultMsg.message,
          targetUserId: finalTargetUserId
        });
        
        // Create notification directly in Supabase database (bypass Edge Function)
        try {
          const { supabase } = await import('../config/supabase');
          
          const dbNotificationData: any = {
            type: triggerType.includes('order') ? 'order' : 'system',
            title: defaultMsg.title,
            message: defaultMsg.message,
            is_broadcast: !finalTargetUserId || finalTargetUserId === 'all',
            metadata: context,
            is_read: false,
          };
          
          if (finalTargetUserId && finalTargetUserId !== 'all') {
            dbNotificationData.target_user_id = finalTargetUserId;
            dbNotificationData.is_broadcast = false;
          }
          
          const { data, error } = await supabase
            .from('notifications')
            .insert(dbNotificationData)
            .select()
            .single();
          
          if (error) {
            console.error('❌ Database insert error:', error);
            throw error;
          }
          
          console.log('✅ Notification created in Supabase database:', data.id);
          
          // Trigger refresh event
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refreshNotifications'));
          }, 500);
        } catch (dbError: any) {
          console.error('❌ Failed to create notification in database:', dbError);
          // Don't show error toast - fail silently to avoid user disruption
        }
      } catch (fallbackError: any) {
        console.error('Error creating notification directly:', fallbackError);
      }
      return;
    }

    // Process each automation
    for (const automation of automations) {
      await createNotificationFromAutomation(automation, context, targetUserId);
    }
  } catch (error: any) {
    console.error('Error triggering automation:', error);
  }
};

/**
 * Create automation
 */
export const createAutomation = async (
  automation: Omit<NotificationAutomation, 'id' | 'created_at' | 'updated_at'>
): Promise<NotificationAutomation | null> => {
  try {
    const { data, error } = await supabase
      .from('notification_automations')
      .insert(automation)
      .select()
      .single();

    if (error) throw error;
    toast.success('Automation created successfully');
    return data;
  } catch (error: any) {
    console.error('Error creating automation:', error);
    toast.error('Failed to create automation');
    return null;
  }
};

/**
 * Update automation
 */
export const updateAutomation = async (
  id: string,
  updates: Partial<NotificationAutomation>
): Promise<NotificationAutomation | null> => {
  try {
    const { data, error } = await supabase
      .from('notification_automations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    toast.success('Automation updated successfully');
    return data;
  } catch (error: any) {
    console.error('Error updating automation:', error);
    toast.error('Failed to update automation');
    return null;
  }
};

/**
 * Delete automation
 */
export const deleteAutomation = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notification_automations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Automation deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting automation:', error);
    toast.error('Failed to delete automation');
    return false;
  }
};

/**
 * Fetch all campaigns
 */
export const fetchCampaigns = async (): Promise<NotificationCampaign[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
};

/**
 * Create campaign
 */
export const createCampaign = async (
  campaign: Omit<NotificationCampaign, 'id' | 'created_at' | 'updated_at' | 'sent_count'>
): Promise<NotificationCampaign | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('notification_campaigns')
      .insert({
        ...campaign,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    toast.success('Campaign created successfully');
    return data;
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    toast.error('Failed to create campaign');
    return null;
  }
};

/**
 * Process scheduled campaigns
 */
export const processScheduledCampaigns = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();
    
    const { data: campaigns, error } = await supabase
      .from('notification_campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now);

    if (error) throw error;

    for (const campaign of campaigns || []) {
      // Send campaign notifications
      await sendCampaignNotifications(campaign);
      
      // Update campaign status
      await supabase
        .from('notification_campaigns')
        .update({ status: 'completed' })
        .eq('id', campaign.id);
    }
  } catch (error: any) {
    console.error('Error processing scheduled campaigns:', error);
  }
};

/**
 * Send campaign notifications
 */
export const sendCampaignNotifications = async (campaign: NotificationCampaign): Promise<void> => {
  try {
    const notificationData = campaign.notification_data;
    
    // Create broadcast notification
    const { error } = await supabase
      .from('notifications')
      .insert({
        type: campaign.type === 'promo' ? 'promo' : 'system',
        title: notificationData.title || campaign.name,
        message: notificationData.message || '',
        image_url: notificationData.image_url || null,
        action_url: notificationData.action_url || null,
        is_broadcast: true,
        campaign_id: campaign.id,
        product_id: notificationData.product_id || null,
        deal_id: notificationData.deal_id || null,
      });

    if (error) throw error;

    console.log(`✅ Campaign notification sent: ${campaign.name}`);

    // Update sent count
    await supabase
      .from('notification_campaigns')
      .update({ sent_count: campaign.sent_count + 1 })
      .eq('id', campaign.id);

    // Trigger refresh event so users see the notification immediately
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }, 500);
    }
  } catch (error: any) {
    console.error('Error sending campaign notifications:', error);
    throw error; // Re-throw so caller can handle it
  }
};

