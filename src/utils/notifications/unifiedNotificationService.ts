/**
 * Unified Notification Service
 * Centralized service layer for all notification operations
 */

import { supabase } from '../../config/supabase';
import { getFunctionUrl, getPublicAnonKey } from '../../config/supabase';
import { localNotifications } from './localNotifications';
import { Notification, NotificationStats, AnalyticsData, NotificationType } from '../../components/notification/UnifiedNotificationCenter/types';

const getNotifUrl = (path: string = 'notifications') => {
  return import.meta.env.VITE_SUPABASE_NOTIF_URL 
    ? `${import.meta.env.VITE_SUPABASE_NOTIF_URL}/${path.replace('notifications/', '')}`
    : getFunctionUrl(path);
};

// Queue for offline bulk operations
const OFFLINE_QUEUE_KEY = 'ideal_notif_offline_queue';

class UnifiedNotificationService {
  constructor() {
    this.setupOfflineSync();
  }

  private setupOfflineSync() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.processOfflineQueue.bind(this));
    }
  }

  private async processOfflineQueue() {
    try {
      const queueStr = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!queueStr) return;
      
      const queue: { ids: string[], operation: string }[] = JSON.parse(queueStr);
      if (queue.length === 0) return;
      
      console.log('Processing offline notification queue...', queue.length, 'operations');
      
      const failedQueue: { ids: string[], operation: string }[] = [];
      
      for (const item of queue) {
        try {
          const success = await this.bulkOperation(item.ids, item.operation as any, true);
          if (!success) {
            failedQueue.push(item);
          }
        } catch (e) {
          failedQueue.push(item);
        }
      }
      
      if (failedQueue.length > 0) {
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failedQueue));
      } else {
        localStorage.removeItem(OFFLINE_QUEUE_KEY);
      }
    } catch (e) {
      console.error('Failed to process offline queue', e);
    }
  }
  /**
   * Get all notifications (all types)
   */
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const { getAuthToken } = await import('../../config/supabase');
      const token = await getAuthToken();
      const response = await fetch(
        getNotifUrl('notifications'),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return (data.notifications || []).map(this.mapNotification);
        }
      }

      // Fallback to local storage
      const localNotifs = localNotifications.getAll();
      return localNotifs.map(this.mapLocalNotification);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      const localNotifs = localNotifications.getAll();
      return localNotifs.map(this.mapLocalNotification);
    }
  }

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStats> {
    try {
      const { getAuthToken } = await import('../../config/supabase');
      const token = await getAuthToken();
      const response = await fetch(
        getNotifUrl('notifications/stats'),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          return this.mapStats(data.stats);
        }
      }

      // Fallback to local stats
      const localStats = localNotifications.getStats();
      return this.mapLocalStats(localStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      const localStats = localNotifications.getStats();
      return this.mapLocalStats(localStats);
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      // Try to fetch from database
      const { data, error } = await supabase
        .from('notifications')
        .select('sent_count, opened_count, clicked_count, type, created_at');

      if (error) throw error;

      return this.calculateAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return default analytics
      return this.getDefaultAnalytics();
    }
  }

  /**
   * Bulk operation on notifications
   */
  async bulkOperation(
    notificationIds: string[],
    operation: 'delete' | 'mark_read' | 'mark_unread' | 'archive',
    isProcessingQueue: boolean = false
  ): Promise<boolean> {
    try {
      // If offline, add to queue
      if (!navigator.onLine && !isProcessingQueue) {
        this.addToOfflineQueue(notificationIds, operation);
        return true; // Optimistic return
      }

      const response = await fetch(
        getNotifUrl('notifications/bulk'),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: notificationIds, operation }),
        }
      );

      if (!response.ok && !isProcessingQueue) {
        this.addToOfflineQueue(notificationIds, operation);
      }
      return response.ok;
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      if (!isProcessingQueue) {
        this.addToOfflineQueue(notificationIds, operation);
      }
      return false; // Retried later
    }
  }

  private addToOfflineQueue(ids: string[], operation: string) {
    try {
      const queueStr = localStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue = queueStr ? JSON.parse(queueStr) : [];
      queue.push({ ids, operation });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log('Added notification operation to offline queue');
    } catch (e) {
      console.error('Failed to add to offline queue', e);
    }
  }

  /**
   * Create notification with A/B test
   */
  async createWithABTest(
    variants: Array<{ title: string; message: string }>,
    splitRatio: number = 50
  ): Promise<string | null> {
    try {
      const response = await fetch(
        getNotifUrl('notifications/ab-test'),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ variants, splitRatio }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.abTestId || null;
      }
      return null;
    } catch (error) {
      console.error('Error creating A/B test:', error);
      return null;
    }
  }

  /**
   * Schedule notification
   */
  async scheduleNotification(
    notification: Partial<Notification>,
    scheduledAt: string,
    timezone: string = 'UTC'
  ): Promise<boolean> {
    try {
      const response = await fetch(
        getNotifUrl('notifications'),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...notification,
            scheduled_at: scheduledAt,
            timezone,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }

  /**
   * Segment users
   */
  async segmentUsers(filters: any[]): Promise<string[]> {
    try {
      // Build query based on filters
      let query = supabase.from('users').select('id');

      // Apply filters (simplified - would need more complex logic)
      filters.forEach(filter => {
        if (filter.field && filter.operator && filter.value !== undefined) {
          // Apply filter logic
        }
      });

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((u: any) => u.id);
    } catch (error) {
      console.error('Error segmenting users:', error);
      return [];
    }
  }

  // Helper methods
  private mapNotification(n: any): Notification {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp || n.created_at,
      isNew: n.isNew !== undefined ? n.isNew : !n.is_read,
      isRead: n.isRead !== undefined ? n.isRead : n.is_read || false,
      targetUserId: n.targetUserId || n.target_user_id,
      actionUrl: n.actionUrl || n.action_url,
      imageUrl: n.imageUrl || n.image_url,
      productId: n.productId || n.product_id,
      dealId: n.dealId || n.deal_id,
      createdBy: n.createdBy || 'admin',
      isBroadcast: n.isBroadcast !== undefined ? n.isBroadcast : n.is_broadcast || false,
      sentCount: n.sent_count,
      openedCount: n.opened_count,
      clickedCount: n.clicked_count,
      abTestId: n.ab_test_id,
      variantId: n.variant_id,
      segmentId: n.segment_id,
      scheduledAt: n.scheduled_at,
      timezone: n.timezone,
    };
  }

  private mapLocalNotification(n: any): Notification {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp,
      isNew: n.isNew,
      isRead: n.isRead,
      targetUserId: n.targetUserId,
      actionUrl: n.actionUrl,
      imageUrl: n.imageUrl,
      productId: n.productId,
      dealId: n.dealId,
      createdBy: n.createdBy,
      isBroadcast: n.isBroadcast,
    };
  }

  private mapStats(s: any): NotificationStats {
    return {
      total: s.total || 0,
      new: s.new || 0,
      read: s.read || 0,
      byType: s.byType || {
        order: 0,
        promo: 0,
        reward: 0,
        delivery: 0,
        system: 0,
      },
      broadcast: s.broadcast || 0,
      sent: s.sent || 0,
      opened: s.opened || 0,
      clicked: s.clicked || 0,
      engagementRate: s.engagementRate || 0,
      openRate: s.openRate || 0,
      clickRate: s.clickRate || 0,
    };
  }

  private mapLocalStats(s: any): NotificationStats {
    return {
      total: s.total || 0,
      new: s.new || 0,
      read: s.read || 0,
      byType: s.byType || {
        order: 0,
        promo: 0,
        reward: 0,
        delivery: 0,
        system: 0,
      },
      broadcast: s.broadcast || 0,
      sent: s.total || 0,
      opened: 0,
      clicked: 0,
      engagementRate: 0,
      openRate: 0,
      clickRate: 0,
    };
  }

  private calculateAnalytics(data: any[]): AnalyticsData {
    const totalSent = data.length;
    const totalOpened = data.reduce((sum, n) => sum + (n.opened_count || 0), 0);
    const totalClicked = data.reduce((sum, n) => sum + (n.clicked_count || 0), 0);
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
    const engagementRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

    // Group by type
    const byType: Record<string, any> = {};
    data.forEach(n => {
      const type = n.type || 'system';
      if (!byType[type]) {
        byType[type] = { sent: 0, opened: 0, clicked: 0 };
      }
      byType[type].sent += 1;
      byType[type].opened += n.opened_count || 0;
      byType[type].clicked += n.clicked_count || 0;
    });

    // Calculate rates per type
    Object.keys(byType).forEach(type => {
      const typeData = byType[type];
      typeData.openRate = typeData.sent > 0 ? (typeData.opened / typeData.sent) * 100 : 0;
      typeData.clickRate = typeData.opened > 0 ? (typeData.clicked / typeData.opened) * 100 : 0;
    });

    return {
      totalSent,
      totalOpened,
      totalClicked,
      openRate,
      clickRate,
      engagementRate,
      byType,
      byDate: [],
      trends: {
        openRateTrend: 0,
        clickRateTrend: 0,
        engagementTrend: 0,
      },
    };
  }

  private getDefaultAnalytics(): AnalyticsData {
    return {
      totalSent: 0,
      totalOpened: 0,
      totalClicked: 0,
      openRate: 0,
      clickRate: 0,
      engagementRate: 0,
      byType: {} as Record<NotificationType, any>,
      byDate: [],
      trends: {
        openRateTrend: 0,
        clickRateTrend: 0,
        engagementTrend: 0,
      },
    };
  }
}

export const unifiedNotificationService = new UnifiedNotificationService();




