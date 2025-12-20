/**
 * Notification Segmentation Utilities
 * User segmentation logic and segment management
 */

import { supabase } from '../../config/supabase';
import { UserSegment, SegmentFilter } from '../../components/notification/UnifiedNotificationCenter/types';

/**
 * Build segment query from filters
 */
export const buildSegmentQuery = (filters: SegmentFilter[]): string => {
  // This would build a complex SQL query based on filters
  // Simplified version for now
  const conditions: string[] = [];
  
  filters.forEach(filter => {
    switch (filter.operator) {
      case 'equals':
        conditions.push(`${filter.field} = '${filter.value}'`);
        break;
      case 'not_equals':
        conditions.push(`${filter.field} != '${filter.value}'`);
        break;
      case 'contains':
        conditions.push(`${filter.field} ILIKE '%${filter.value}%'`);
        break;
      case 'greater_than':
        conditions.push(`${filter.field} > ${filter.value}`);
        break;
      case 'less_than':
        conditions.push(`${filter.field} < ${filter.value}`);
        break;
      case 'in':
        const values = Array.isArray(filter.value) ? filter.value : [filter.value];
        conditions.push(`${filter.field} IN (${values.map(v => `'${v}'`).join(', ')})`);
        break;
    }
  });
  
  return conditions.join(' AND ');
};

/**
 * Get user count for segment
 */
export const getSegmentUserCount = async (filters: SegmentFilter[]): Promise<number> => {
  try {
    // Simplified - would need proper query building
    let query = supabase.from('users').select('id', { count: 'exact', head: true });
    
    // Apply filters (simplified)
    const { count, error } = await query;
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting segment user count:', error);
    return 0;
  }
};

/**
 * Get user IDs for segment
 */
export const getSegmentUserIds = async (filters: SegmentFilter[]): Promise<string[]> => {
  try {
    let query = supabase.from('users').select('id');
    
    // Apply filters (simplified)
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []).map((u: any) => u.id);
  } catch (error) {
    console.error('Error getting segment user IDs:', error);
    return [];
  }
};

/**
 * Save segment
 */
export const saveSegment = async (segment: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt' | 'userCount'>): Promise<UserSegment | null> => {
  try {
    const userCount = await getSegmentUserCount(segment.filters);
    
    const { data, error } = await supabase
      .from('notification_segments')
      .insert({
        name: segment.name,
        description: segment.description,
        filters: segment.filters,
        user_count: userCount,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as UserSegment;
  } catch (error) {
    console.error('Error saving segment:', error);
    return null;
  }
};

/**
 * Get all segments
 */
export const getSegments = async (): Promise<UserSegment[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_segments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      filters: s.filters,
      userCount: s.user_count || 0,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));
  } catch (error) {
    console.error('Error getting segments:', error);
    return [];
  }
};




