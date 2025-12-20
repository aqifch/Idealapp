/**
 * Notification Analytics Utilities
 * Calculate metrics, generate reports, and track performance
 */

import { supabase } from '../../config/supabase';
import { AnalyticsData } from '../../components/notification/UnifiedNotificationCenter/types';

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  campaignId?: string;
  automationId?: string;
}

/**
 * Calculate analytics from notification data
 */
export const calculateAnalytics = (notifications: any[]): AnalyticsData => {
  const totalSent = notifications.length;
  const totalOpened = notifications.reduce((sum, n) => sum + (n.opened_count || 0), 0);
  const totalClicked = notifications.reduce((sum, n) => sum + (n.clicked_count || 0), 0);
  
  const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
  const engagementRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

  // Group by type
  const byType: Record<string, any> = {};
  notifications.forEach(n => {
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

  // Group by date
  const byDateMap: Record<string, { sent: number; opened: number; clicked: number }> = {};
  notifications.forEach(n => {
    const date = new Date(n.created_at || n.timestamp).toISOString().split('T')[0];
    if (!byDateMap[date]) {
      byDateMap[date] = { sent: 0, opened: 0, clicked: 0 };
    }
    byDateMap[date].sent += 1;
    byDateMap[date].opened += n.opened_count || 0;
    byDateMap[date].clicked += n.clicked_count || 0;
  });

  const byDate = Object.entries(byDateMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate trends (simplified - would need historical data for real trends)
  const trends = {
    openRateTrend: 0,
    clickRateTrend: 0,
    engagementTrend: 0,
  };

  return {
    totalSent,
    totalOpened,
    totalClicked,
    openRate,
    clickRate,
    engagementRate,
    byType,
    byDate,
    trends,
  };
};

/**
 * Get analytics with filters
 */
export const getAnalytics = async (filters?: AnalyticsFilters): Promise<AnalyticsData> => {
  try {
    let query = supabase
      .from('notifications')
      .select('sent_count, opened_count, clicked_count, type, created_at');

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return calculateAnalytics(data || []);
  } catch (error) {
    console.error('Error fetching analytics:', error);
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
};

/**
 * Export analytics to CSV
 */
export const exportAnalyticsToCSV = (analytics: AnalyticsData): string => {
  const rows: string[] = [];
  
  // Header
  rows.push('Metric,Value');
  
  // Summary
  rows.push(`Total Sent,${analytics.totalSent}`);
  rows.push(`Total Opened,${analytics.totalOpened}`);
  rows.push(`Total Clicked,${analytics.totalClicked}`);
  rows.push(`Open Rate,${analytics.openRate.toFixed(2)}%`);
  rows.push(`Click Rate,${analytics.clickRate.toFixed(2)}%`);
  rows.push(`Engagement Rate,${analytics.engagementRate.toFixed(2)}%`);
  
  rows.push('');
  rows.push('Type,Sent,Opened,Clicked,Open Rate,Click Rate');
  
  // By type
  Object.entries(analytics.byType).forEach(([type, data]) => {
    rows.push(`${type},${data.sent},${data.opened},${data.clicked},${data.openRate.toFixed(2)}%,${data.clickRate.toFixed(2)}%`);
  });
  
  return rows.join('\n');
};

/**
 * Export analytics to JSON
 */
export const exportAnalyticsToJSON = (analytics: AnalyticsData): string => {
  return JSON.stringify(analytics, null, 2);
};




