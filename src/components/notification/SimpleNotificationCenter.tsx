import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Plus, 
  Edit2, 
  Trash, 
  Eye, 
  X, 
  Save, 
  Send,
  Zap,
  Megaphone,
  FileText,
  Package,
  Gift,
  Star,
  ShoppingCart,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../config/supabase';

interface SimpleNotificationCenterProps {
  products?: any[];
  deals?: any[];
}

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'reward' | 'delivery' | 'system';
  title: string;
  message: string;
  image_url?: string | null;
  action_url?: string | null;
  product_id?: string | null;
  deal_id?: string | null;
  is_broadcast: boolean;
  target_user_id?: string | null;
  is_read: boolean;
  created_at: string;
}

interface Automation {
  id: string;
  name: string;
  trigger_type: string;
  notification_data: any;
  is_active: boolean;
}

interface Campaign {
  id: string;
  name: string;
  notification_data: any;
  schedule_type: 'immediate' | 'scheduled';
  scheduled_at?: string | null;
  status: string;
}

interface Template {
  id: string;
  name: string;
  type: string;
  title_template: string;
  message_template: string;
  variables: string[];
}

export const SimpleNotificationCenter: React.FC<SimpleNotificationCenterProps> = ({ 
  products = [], 
  deals = [] 
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'automations' | 'campaigns' | 'templates'>('notifications');
  const [loading, setLoading] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    type: 'promo' as Notification['type'],
    title: '',
    message: '',
    image_url: '',
    action_url: '',
    linkedItemType: 'none' as 'none' | 'product' | 'deal',
    selectedItemId: '',
    isBroadcast: false,
  });

  // Automations state
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [automationForm, setAutomationForm] = useState({
    name: '',
    trigger_type: 'order_placed',
    title: '',
    message: '',
    is_active: true,
  });

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    title: '',
    message: '',
    schedule_type: 'immediate' as 'immediate' | 'scheduled',
    scheduled_at: '',
  });

  // Templates state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'order',
    title_template: '',
    message_template: '',
  });

  // Initialize: Load data first, then seed if needed
  useEffect(() => {
    const initialize = async () => {
      // Load data first
      await loadData();
      // Then seed sample data (it will check if data exists and only insert if empty)
      // Don't wait for seeding - it might fail due to RLS, but that's OK
      seedSampleData().catch(err => {
        console.warn('⚠️ Seeding failed (this is OK if data already exists):', err);
      });
      // Reload data after a short delay to show new items if seeding succeeded
      setTimeout(() => {
        loadData();
      }, 1000);
    };
    initialize();
  }, []);

  // Load data on tab change
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'notifications') {
        await loadNotifications();
      } else if (activeTab === 'automations') {
        await loadAutomations();
      } else if (activeTab === 'campaigns') {
        await loadCampaigns();
      } else if (activeTab === 'templates') {
        await loadTemplates();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Seed sample data for demonstration
  const seedSampleData = async () => {
    try {
      // Seed Notifications
      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);

      if (!existingNotifications || existingNotifications.length === 0) {
        const sampleNotifications = [
          {
            type: 'promo',
            title: '🎉 Welcome to IDEAL POINT!',
            message: 'Get 20% off on your first order! Use code: WELCOME20',
            is_broadcast: true,
            target_user_id: null,
            is_read: false,
          },
          {
            type: 'delivery',
            title: '🚚 Fast Delivery Available',
            message: 'Order now and get delivery within 30 minutes in your area!',
            is_broadcast: true,
            target_user_id: null,
            is_read: false,
          },
          {
            type: 'reward',
            title: '⭐ Loyalty Rewards Unlocked',
            message: 'You have earned 50 reward points! Redeem them on your next purchase.',
            is_broadcast: true,
            target_user_id: null,
            is_read: false,
          },
        ];
        await supabase.from('notifications').insert(sampleNotifications);
      }

      // Seed Automations
      const { data: existingAutomations } = await supabase
        .from('notification_automations')
        .select('id')
        .limit(1);

      if (!existingAutomations || existingAutomations.length === 0) {
        const sampleAutomations = [
          {
            name: 'Order Confirmation',
            trigger_type: 'order_confirmed',
            notification_data: {
              title: 'Order Confirmed!',
              message: 'Your order has been confirmed and will be ready soon.',
            },
            is_active: true,
            target_audience: 'all',
          },
          {
            name: 'Order Ready',
            trigger_type: 'order_ready',
            notification_data: {
              title: 'Order is Ready!',
              message: 'Your order is ready for pickup/delivery.',
            },
            is_active: true,
            target_audience: 'all',
          },
          {
            name: 'Order Completed',
            trigger_type: 'order_completed',
            notification_data: {
              title: 'Order Completed!',
              message: 'Thank you for your order. We hope you enjoyed!',
            },
            is_active: true,
            target_audience: 'all',
          },
        ];
        const { error: automationError } = await supabase.from('notification_automations').insert(sampleAutomations);
        if (automationError) {
          console.error('❌ Error adding automations:', automationError);
        } else {
          console.log('✅ 3 Automations added successfully');
        }
      }

      // Seed Campaigns
      const { data: existingCampaigns } = await supabase
        .from('notification_campaigns')
        .select('id')
        .limit(1);

      if (!existingCampaigns || existingCampaigns.length === 0) {
        const sampleCampaigns = [
          {
            name: 'Welcome Campaign',
            type: 'promo',
            notification_data: {
              title: '🎉 Welcome to IDEAL POINT!',
              message: 'Get 20% off on your first order! Use code: WELCOME20',
            },
            schedule_type: 'immediate',
            scheduled_at: null,
            status: 'completed',
            target_audience: 'all',
            sent_count: 0,
          },
          {
            name: 'Fast Delivery Alert',
            type: 'delivery',
            notification_data: {
              title: '🚚 Fast Delivery Available',
              message: 'Order now and get delivery within 30 minutes in your area!',
            },
            schedule_type: 'immediate',
            scheduled_at: null,
            status: 'completed',
            target_audience: 'all',
            sent_count: 0,
          },
          {
            name: 'Loyalty Rewards',
            type: 'reward',
            notification_data: {
              title: '⭐ Loyalty Rewards Unlocked',
              message: 'You have earned 50 reward points! Redeem them on your next purchase.',
            },
            schedule_type: 'immediate',
            scheduled_at: null,
            status: 'completed',
            target_audience: 'all',
            sent_count: 0,
          },
        ];
        const { error: campaignError } = await supabase.from('notification_campaigns').insert(sampleCampaigns);
        if (campaignError) {
          console.error('❌ Error adding campaigns:', campaignError);
        } else {
          console.log('✅ 3 Campaigns added successfully');
        }
      }

      // Seed Templates
      const { data: existingTemplates } = await supabase
        .from('notification_templates')
        .select('id')
        .limit(1);

      if (!existingTemplates || existingTemplates.length === 0) {
        const sampleTemplates = [
          {
            name: 'Order Confirmation Template',
            type: 'order',
            title_template: 'Order #{{orderNumber}} Confirmed!',
            message_template: 'Your order has been confirmed and will be ready in {{estimatedTime}}. Total: Rs {{total}}',
            variables: ['orderNumber', 'estimatedTime', 'total'],
            is_default: true,
          },
          {
            name: 'Order Status Update Template',
            type: 'order',
            title_template: 'Order #{{orderNumber}} Status Updated',
            message_template: 'Your order status has been changed to {{newStatus}}.',
            variables: ['orderNumber', 'newStatus'],
            is_default: true,
          },
          {
            name: 'Welcome Template',
            type: 'promo',
            title_template: 'Welcome {{customerName}}!',
            message_template: 'Thank you for joining IDEAL POINT! Get {{discount}}% off on your first order with code {{couponCode}}.',
            variables: ['customerName', 'discount', 'couponCode'],
            is_default: true,
          },
        ];
        const { error: templateError } = await supabase.from('notification_templates').insert(sampleTemplates);
        if (!templateError) {
          console.log('✅ 3 Templates added successfully');
        } else {
          console.error('❌ Error adding templates:', templateError);
        }
      }
    } catch (error) {
      console.error('Error seeding sample data:', error);
      // Don't show error to user, just log it
    }
  };

  // ========== NOTIFICATIONS ==========
  const loadNotifications = async () => {
    try {
      console.log('🔄 Loading notifications from database...');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error loading notifications:', error);
        throw error;
      }
      
      console.log('✅ Loaded notifications:', data?.length || 0);
      setNotifications(data || []);
    } catch (error: any) {
      console.error('❌ Error loading notifications:', error);
      toast.error(`Failed to load notifications: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCreateNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Title and message are required');
      return;
    }

    try {
      const notificationData: any = {
        type: notificationForm.type,
        title: notificationForm.title,
        message: notificationForm.message,
        image_url: notificationForm.image_url || null,
        action_url: notificationForm.action_url || null,
        product_id: notificationForm.linkedItemType === 'product' ? notificationForm.selectedItemId : null,
        deal_id: notificationForm.linkedItemType === 'deal' ? notificationForm.selectedItemId : null,
        is_broadcast: notificationForm.isBroadcast,
        target_user_id: notificationForm.isBroadcast ? null : null,
        is_read: false,
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) throw error;

      toast.success(notificationForm.isBroadcast ? 'Broadcast sent to all users!' : 'Notification created!');
      setShowNotificationModal(false);
      resetNotificationForm();
      await loadNotifications();
    } catch (error: any) {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification');
    }
  };

  const handleUpdateNotification = async () => {
    if (!selectedNotification) return;

    try {
      const updateData: any = {
        type: notificationForm.type,
        title: notificationForm.title,
        message: notificationForm.message,
        image_url: notificationForm.image_url || null,
        action_url: notificationForm.action_url || null,
        product_id: notificationForm.linkedItemType === 'product' ? notificationForm.selectedItemId : null,
        deal_id: notificationForm.linkedItemType === 'deal' ? notificationForm.selectedItemId : null,
        is_broadcast: notificationForm.isBroadcast,
      };

      const { error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', selectedNotification.id);

      if (error) throw error;

      toast.success('Notification updated!');
      setShowNotificationModal(false);
      resetNotificationForm();
      await loadNotifications();
    } catch (error: any) {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Notification deleted');
      await loadNotifications();
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const resetNotificationForm = () => {
    setNotificationForm({
      type: 'promo',
      title: '',
      message: '',
      image_url: '',
      action_url: '',
      linkedItemType: 'none',
      selectedItemId: '',
      isBroadcast: false,
    });
    setSelectedNotification(null);
  };

  const openEditNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setNotificationForm({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      image_url: notification.image_url || '',
      action_url: notification.action_url || '',
      linkedItemType: notification.product_id ? 'product' : notification.deal_id ? 'deal' : 'none',
      selectedItemId: notification.product_id || notification.deal_id || '',
      isBroadcast: notification.is_broadcast,
    });
    setShowNotificationModal(true);
  };

  // ========== AUTOMATIONS ==========
  const loadAutomations = async () => {
    try {
      console.log('🔄 Loading automations from database...');
      const { data, error } = await supabase
        .from('notification_automations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error loading automations:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        throw error;
      }
      
      console.log('✅ Loaded automations:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('📋 Automation names:', data.map(a => a.name));
      }
      setAutomations(data || []);
    } catch (error: any) {
      console.error('❌ Error loading automations:', error);
      const errorMsg = error.message || error.code || error.hint || 'Unknown error';
      toast.error(`Failed to load automations: ${errorMsg}`);
    }
  };

  const handleCreateAutomation = async () => {
    if (!automationForm.name || !automationForm.title || !automationForm.message) {
      toast.error('Name, title, and message are required');
      return;
    }

    try {
      const automationData = {
        name: automationForm.name,
        trigger_type: automationForm.trigger_type,
        notification_data: {
          title: automationForm.title,
          message: automationForm.message,
        },
        is_active: automationForm.is_active,
        target_audience: 'all',
      };

      const { error } = await supabase
        .from('notification_automations')
        .insert(automationData);

      if (error) throw error;

      toast.success('Automation created!');
      setShowAutomationModal(false);
      resetAutomationForm();
      await loadAutomations();
    } catch (error: any) {
      console.error('Error creating automation:', error);
      toast.error('Failed to create automation');
    }
  };

  const handleUpdateAutomation = async () => {
    if (!selectedAutomation) return;

    if (!automationForm.name || !automationForm.title || !automationForm.message) {
      toast.error('Name, title, and message are required');
      return;
    }

    try {
      const automationData = {
        name: automationForm.name,
        trigger_type: automationForm.trigger_type,
        notification_data: {
          title: automationForm.title,
          message: automationForm.message,
        },
        is_active: automationForm.is_active,
        target_audience: 'all',
      };

      const { error } = await supabase
        .from('notification_automations')
        .update(automationData)
        .eq('id', selectedAutomation.id);

      if (error) throw error;

      toast.success('Automation updated!');
      setShowAutomationModal(false);
      resetAutomationForm();
      await loadAutomations();
    } catch (error: any) {
      console.error('Error updating automation:', error);
      toast.error('Failed to update automation');
    }
  };

  const openEditAutomation = (automation: Automation) => {
    setSelectedAutomation(automation);
    setAutomationForm({
      name: automation.name,
      trigger_type: automation.trigger_type,
      title: automation.notification_data?.title || '',
      message: automation.notification_data?.message || '',
      is_active: automation.is_active,
    });
    setShowAutomationModal(true);
  };

  const handleToggleAutomation = async (automation: Automation) => {
    try {
      const { error } = await supabase
        .from('notification_automations')
        .update({ is_active: !automation.is_active })
        .eq('id', automation.id);

      if (error) throw error;

      await loadAutomations();
    } catch (error: any) {
      console.error('Error toggling automation:', error);
      toast.error('Failed to update automation');
    }
  };

  const handleDeleteAutomation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    try {
      const { error } = await supabase
        .from('notification_automations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Automation deleted');
      await loadAutomations();
    } catch (error: any) {
      console.error('Error deleting automation:', error);
      toast.error('Failed to delete automation');
    }
  };

  const resetAutomationForm = () => {
    setAutomationForm({
      name: '',
      trigger_type: 'order_placed',
      title: '',
      message: '',
      is_active: true,
    });
    setSelectedAutomation(null);
  };

  // ========== CAMPAIGNS ==========
  const loadCampaigns = async () => {
    try {
      console.log('🔄 Loading campaigns from database...');
      const { data, error } = await supabase
        .from('notification_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error loading campaigns:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error);
        
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.error('⚠️ Table notification_campaigns does not exist. Please run migration.');
          toast.error('Table does not exist. Please run database migration.');
          return;
        }
        
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          console.error('⚠️ RLS policy blocking access. Please disable RLS or update policies.');
          toast.error('Access denied by security policy. Please check RLS settings.');
          return;
        }
        
        throw error;
      }
      
      console.log('✅ Loaded campaigns:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('📋 Campaign names:', data.map(c => c.name));
        console.log('📋 Full data:', data);
      } else {
        console.warn('⚠️ No campaigns found. Table might be empty or RLS is blocking.');
      }
      setCampaigns(data || []);
    } catch (error: any) {
      console.error('❌ Error loading campaigns:', error);
      const errorMsg = error.message || error.code || error.hint || 'Unknown error';
      toast.error(`Failed to load campaigns: ${errorMsg}`);
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.title || !campaignForm.message) {
      toast.error('Name, title, and message are required');
      return;
    }

    try {
      const campaignData: any = {
        name: campaignForm.name,
        type: 'promo',
        notification_data: {
          title: campaignForm.title,
          message: campaignForm.message,
        },
        schedule_type: campaignForm.schedule_type,
        scheduled_at: campaignForm.schedule_type === 'scheduled' ? campaignForm.scheduled_at : null,
        status: campaignForm.schedule_type === 'immediate' ? 'active' : 'draft',
        target_audience: 'all',
      };

      const { error } = await supabase
        .from('notification_campaigns')
        .insert(campaignData);

      if (error) throw error;

      toast.success('Campaign created!');
      setShowCampaignModal(false);
      resetCampaignForm();
      await loadCampaigns();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const { error } = await supabase
        .from('notification_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Campaign deleted');
      await loadCampaigns();
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      title: '',
      message: '',
      schedule_type: 'immediate',
      scheduled_at: '',
    });
  };

  // ========== TEMPLATES ==========
  const loadTemplates = async () => {
    try {
      console.log('🔄 Loading templates from database...');
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error loading templates:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error);
        
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.error('⚠️ Table notification_templates does not exist. Please run migration.');
          toast.error('Table does not exist. Please run database migration.');
          return;
        }
        
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          console.error('⚠️ RLS policy blocking access. Please disable RLS or update policies.');
          toast.error('Access denied by security policy. Please check RLS settings.');
          return;
        }
        
        throw error;
      }
      
      console.log('✅ Loaded templates:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('📋 Template names:', data.map(t => t.name));
        console.log('📋 Full data:', data);
      } else {
        console.warn('⚠️ No templates found. Table might be empty or RLS is blocking.');
      }
      setTemplates(data || []);
    } catch (error: any) {
      console.error('❌ Error loading templates:', error);
      const errorMsg = error.message || error.code || error.hint || 'Unknown error';
      toast.error(`Failed to load templates: ${errorMsg}`);
    }
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.title_template || !templateForm.message_template) {
      toast.error('Name, title template, and message template are required');
      return;
    }

    try {
      const variables = extractVariables(templateForm.title_template + ' ' + templateForm.message_template);

      const templateData = {
        name: templateForm.name,
        type: templateForm.type,
        title_template: templateForm.title_template,
        message_template: templateForm.message_template,
        variables,
      };

      const { error } = await supabase
        .from('notification_templates')
        .insert(templateData);

      if (error) throw error;

      toast.success('Template created!');
      setShowTemplateModal(false);
      resetTemplateForm();
      await loadTemplates();
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const variables = extractVariables(templateForm.title_template + ' ' + templateForm.message_template);

      const { error } = await supabase
        .from('notification_templates')
        .update({
          name: templateForm.name,
          type: templateForm.type,
          title_template: templateForm.title_template,
          message_template: templateForm.message_template,
          variables,
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      toast.success('Template updated!');
      setShowTemplateModal(false);
      resetTemplateForm();
      await loadTemplates();
    } catch (error: any) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Template deleted');
      await loadTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      type: 'order',
      title_template: '',
      message_template: '',
    });
    setSelectedTemplate(null);
  };

  const openEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      title_template: template.title_template,
      message_template: template.message_template,
    });
    setShowTemplateModal(true);
  };

  // ========== RENDER ==========
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-5 h-5 text-orange-600" />;
      case 'promo': return <Gift className="w-5 h-5 text-amber-600" />;
      case 'reward': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'delivery': return <ShoppingCart className="w-5 h-5 text-green-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Notifications</h2>
          <p className="text-gray-600 mt-1">Manage notifications, automations, campaigns, and templates</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1">
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('automations')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'automations'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Zap className="w-5 h-5" />
            Automations
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'campaigns'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Megaphone className="w-5 h-5" />
            Campaigns
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            Templates
          </motion.button>
        </div>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <motion.button
                  onClick={() => {
                    resetNotificationForm();
                    setShowNotificationModal(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  New Notification
                </motion.button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              {getTypeIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900">{notification.title}</h4>
                                {notification.is_broadcast && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">BROADCAST</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="uppercase">{notification.type}</span>
                                <span>•</span>
                                <span>{new Date(notification.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditNotification(notification)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-bold">No notifications yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Automations Tab */}
          {activeTab === 'automations' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <motion.button
                  onClick={() => {
                    resetAutomationForm();
                    setShowAutomationModal(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  New Automation
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {automations.map((automation) => (
                  <div key={automation.id} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{automation.name}</h4>
                        <p className="text-xs text-gray-500 capitalize">{automation.trigger_type.replace('_', ' ')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleAutomation(automation)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          automation.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {automation.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditAutomation(automation)}
                        className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg font-bold text-sm hover:bg-purple-100 flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAutomation(automation.id)}
                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100 flex items-center justify-center gap-1"
                      >
                        <Trash className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {automations.length === 0 && (
                  <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">No automations yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <motion.button
                  onClick={() => {
                    resetCampaignForm();
                    setShowCampaignModal(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  New Campaign
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{campaign.name}</h4>
                        <p className="text-xs text-gray-500 capitalize">{campaign.schedule_type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100"
                    >
                      <Trash className="w-4 h-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                ))}

                {campaigns.length === 0 && (
                  <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">No campaigns yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <motion.button
                  onClick={() => {
                    resetTemplateForm();
                    setShowTemplateModal(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  New Template
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white rounded-xl p-4 border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-xs text-gray-500 uppercase mb-2">{template.type}</p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.message_template}</p>
                    {template.variables && template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.variables.map((v, i) => (
                          <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditTemplate(template)}
                        className="flex-1 px-3 py-2 bg-amber-50 text-amber-600 rounded-lg font-bold text-sm hover:bg-amber-100"
                      >
                        <Edit2 className="w-4 h-4 inline mr-1" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {templates.length === 0 && (
                  <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-200">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">No templates yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Notification Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowNotificationModal(false);
                resetNotificationForm();
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900">
                      {selectedNotification ? 'Edit Notification' : 'Create Notification'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowNotificationModal(false);
                        resetNotificationForm();
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Type</label>
                    <select
                      value={notificationForm.type}
                      onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400"
                    >
                      <option value="order">Order</option>
                      <option value="promo">Promo</option>
                      <option value="reward">Reward</option>
                      <option value="delivery">Delivery</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                      placeholder="Notification title"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Message *</label>
                    <textarea
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                      placeholder="Notification message"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Image URL (Optional)</label>
                    <input
                      type="text"
                      value={notificationForm.image_url}
                      onChange={(e) => setNotificationForm({ ...notificationForm, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Link to Item (Optional)</label>
                    <select
                      value={notificationForm.linkedItemType}
                      onChange={(e) => setNotificationForm({ ...notificationForm, linkedItemType: e.target.value as any, selectedItemId: '' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 mb-3"
                    >
                      <option value="none">No Link</option>
                      <option value="product">Link to Product</option>
                      <option value="deal">Link to Deal</option>
                    </select>

                    {notificationForm.linkedItemType === 'product' && (
                      <select
                        value={notificationForm.selectedItemId}
                        onChange={(e) => setNotificationForm({ ...notificationForm, selectedItemId: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400"
                      >
                        <option value="">Select product...</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    )}

                    {notificationForm.linkedItemType === 'deal' && (
                      <select
                        value={notificationForm.selectedItemId}
                        onChange={(e) => setNotificationForm({ ...notificationForm, selectedItemId: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400"
                      >
                        <option value="">Select deal...</option>
                        {deals.map(deal => (
                          <option key={deal.id} value={deal.id}>{deal.title}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationForm.isBroadcast}
                        onChange={(e) => setNotificationForm({ ...notificationForm, isBroadcast: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <span className="font-bold text-gray-700">Broadcast to all users</span>
                    </label>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotificationModal(false);
                      resetNotificationForm();
                    }}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={selectedNotification ? handleUpdateNotification : handleCreateNotification}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    {selectedNotification ? 'Update' : 'Create'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Automation Modal */}
      <AnimatePresence>
        {showAutomationModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAutomationModal(false);
                resetAutomationForm();
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-black text-gray-900">
                    {selectedAutomation ? 'Edit Automation' : 'Create Automation'}
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={automationForm.name}
                      onChange={(e) => setAutomationForm({ ...automationForm, name: e.target.value })}
                      placeholder="e.g., Order Confirmation"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Trigger *</label>
                    <select
                      value={automationForm.trigger_type}
                      onChange={(e) => setAutomationForm({ ...automationForm, trigger_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-purple-400"
                    >
                      <option value="order_placed">Order Placed</option>
                      <option value="order_confirmed">Order Confirmed</option>
                      <option value="order_preparing">Order Preparing</option>
                      <option value="order_ready">Order Ready</option>
                      <option value="order_completed">Order Completed</option>
                      <option value="order_cancelled">Order Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={automationForm.title}
                      onChange={(e) => setAutomationForm({ ...automationForm, title: e.target.value })}
                      placeholder="Notification title"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Message *</label>
                    <textarea
                      value={automationForm.message}
                      onChange={(e) => setAutomationForm({ ...automationForm, message: e.target.value })}
                      placeholder="Notification message"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-purple-400 resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAutomationModal(false);
                      resetAutomationForm();
                    }}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (selectedAutomation) {
                        handleUpdateAutomation();
                      } else {
                        handleCreateAutomation();
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
                  >
                    {selectedAutomation ? 'Update' : 'Create'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Campaign Modal */}
      <AnimatePresence>
        {showCampaignModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCampaignModal(false);
                resetCampaignForm();
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-black text-gray-900">Create Campaign</h3>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                      placeholder="e.g., Summer Sale"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={campaignForm.title}
                      onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                      placeholder="Campaign title"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Message *</label>
                    <textarea
                      value={campaignForm.message}
                      onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
                      placeholder="Campaign message"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Schedule</label>
                    <select
                      value={campaignForm.schedule_type}
                      onChange={(e) => setCampaignForm({ ...campaignForm, schedule_type: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400"
                    >
                      <option value="immediate">Send Immediately</option>
                      <option value="scheduled">Schedule for Later</option>
                    </select>
                  </div>

                  {campaignForm.schedule_type === 'scheduled' && (
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Scheduled Date & Time *</label>
                      <input
                        type="datetime-local"
                        value={campaignForm.scheduled_at}
                        onChange={(e) => setCampaignForm({ ...campaignForm, scheduled_at: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400"
                      />
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCampaignModal(false);
                      resetCampaignForm();
                    }}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCampaign}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowTemplateModal(false);
                resetTemplateForm();
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-black text-gray-900">
                    {selectedTemplate ? 'Edit Template' : 'Create Template'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Use {'{{variable}}'} for dynamic content</p>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      placeholder="e.g., Order Confirmation"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Type *</label>
                    <select
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-amber-400"
                    >
                      <option value="order">Order</option>
                      <option value="promo">Promo</option>
                      <option value="reward">Reward</option>
                      <option value="delivery">Delivery</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Title Template *</label>
                    <input
                      type="text"
                      value={templateForm.title_template}
                      onChange={(e) => setTemplateForm({ ...templateForm, title_template: e.target.value })}
                      placeholder="e.g., Order #{{orderNumber}} Confirmed!"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-amber-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use {'{{variableName}}'} for dynamic values</p>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Message Template *</label>
                    <textarea
                      value={templateForm.message_template}
                      onChange={(e) => setTemplateForm({ ...templateForm, message_template: e.target.value })}
                      placeholder="e.g., Your order will be ready in {{estimatedTime}}"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  {extractVariables(templateForm.title_template + ' ' + templateForm.message_template).length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm font-bold text-gray-700 mb-2">Detected Variables:</p>
                      <div className="flex flex-wrap gap-2">
                        {extractVariables(templateForm.title_template + ' ' + templateForm.message_template).map((v, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateModal(false);
                      resetTemplateForm();
                    }}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
                  >
                    {selectedTemplate ? 'Update' : 'Create'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

