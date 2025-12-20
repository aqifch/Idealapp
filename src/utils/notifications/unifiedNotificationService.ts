/**
 * Unified Notification Service
 * Centralized service layer for all notification operations
 */

import { supabase } from '../../config/supabase';
import { getFunctionUrl, getPublicAnonKey } from '../../config/supabase';
import { localNotifications } from './localNotifications';
import { Notification, NotificationStats, AnalyticsData } from '../../components/notification/UnifiedNotificationCenter/types';

class UnifiedNotificationService {
  /**
   * Get all notifications (all types)
   */
  async getAllNotifications(): Promise<Notification[]> {
    try {
      const response = await fetch(
        getFunctionUrl('make-server-b09ae082/notifications'),
        {
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
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
      const response = await fetch(
        getFunctionUrl('make-server-b09ae082/notifications/stats'),
        {
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
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
    operation: 'delete' | 'mark_read' | 'mark_unread' | 'archive'
  ): Promise<boolean> {
    try {
      const response = await fetch(
        getFunctionUrl('make-server-b09ae082/notifications/bulk'),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: notificationIds, operation }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      return false;
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
        getFunctionUrl('make-server-b09ae082/notifications/ab-test'),
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
        getFunctionUrl('make-server-b09ae082/notifications'),
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
      byType: {},
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




