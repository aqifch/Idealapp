/**
 * Notification Template Management
 * Handles template creation, rendering, and variable substitution
 */

import { supabase } from '../config/supabase';
import { toast } from 'sonner';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'order' | 'promo' | 'reward' | 'delivery' | 'system' | 'marketing';
  title_template: string;
  message_template: string;
  variables: string[];
  image_url?: string | null;
  action_url?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Render template with variables
 */
export const renderTemplate = (
  template: string | null | undefined,
  variables: Record<string, any> | null | undefined
): string => {
  if (!template || typeof template !== 'string') {
    return '';
  }
  
  if (!variables || typeof variables !== 'object') {
    return template;
  }
  
  try {
    let rendered = template;
    
    // Replace all {{variable}} with actual values
    const keys = Object.keys(variables || {});
    keys.forEach(key => {
      if (key && typeof key === 'string') {
        try {
          const regex = new RegExp(`\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
          const value = variables[key];
          rendered = rendered.replace(regex, value != null ? String(value) : '');
        } catch (err) {
          console.warn(`Error replacing variable ${key}:`, err);
        }
      }
    });
    
    return rendered;
  } catch (err) {
    console.error('Error rendering template:', err);
    return template;
  }
};

/**
 * Fetch all templates from Supabase
 */
export const fetchTemplates = async (): Promise<NotificationTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    toast.error('Failed to fetch templates');
    return [];
  }
};

/**
 * Fetch template by ID
 */
export const fetchTemplateById = async (id: string): Promise<NotificationTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching template:', error);
    return null;
  }
};

/**
 * Create new template
 */
export const createTemplate = async (
  template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<NotificationTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('notification_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    toast.success('Template created successfully');
    return data;
  } catch (error: any) {
    console.error('Error creating template:', error);
    toast.error('Failed to create template');
    return null;
  }
};

/**
 * Update template
 */
export const updateTemplate = async (
  id: string,
  updates: Partial<NotificationTemplate>
): Promise<NotificationTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('notification_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    toast.success('Template updated successfully');
    return data;
  } catch (error: any) {
    console.error('Error updating template:', error);
    toast.error('Failed to update template');
    return null;
  }
};

/**
 * Delete template
 */
export const deleteTemplate = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notification_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success('Template deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting template:', error);
    toast.error('Failed to delete template');
    return false;
  }
};

/**
 * Get default template by type
 */
export const getDefaultTemplate = async (
  type: NotificationTemplate['type']
): Promise<NotificationTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('type', type)
      .eq('is_default', true)
      .single();

    if (error) {
      // If no default, get any template of this type
      const { data: fallback } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('type', type)
        .limit(1)
        .single();
      
      return fallback;
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching default template:', error);
    return null;
  }
};

/**
 * Render notification from template
 */
export const renderNotificationFromTemplate = async (
  templateId: string,
  variables: Record<string, any>
): Promise<{ title: string; message: string; image_url?: string; action_url?: string } | null> => {
  const template = await fetchTemplateById(templateId);
  if (!template) return null;

  return {
    title: renderTemplate(template.title_template, variables),
    message: renderTemplate(template.message_template, variables),
    image_url: template.image_url || undefined,
    action_url: template.action_url || undefined,
  };
};

