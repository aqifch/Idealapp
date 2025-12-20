// Unified Notification Center Types

export type NotificationType = 'order' | 'promo' | 'reward' | 'delivery' | 'system' | 'info' | 'success' | 'warning' | 'error';

export type WorkflowSection = 'dashboard' | 'compose' | 'automations' | 'campaigns' | 'templates';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isNew: boolean;
  isRead: boolean;
  targetUserId?: string;
  actionUrl?: string | null;
  imageUrl?: string | null;
  productId?: string | null;
  dealId?: string | null;
  createdBy?: string;
  isBroadcast?: boolean;
  // Enterprise fields
  sentCount?: number;
  openedCount?: number;
  clickedCount?: number;
  abTestId?: string | null;
  variantId?: string | null;
  segmentId?: string | null;
  scheduledAt?: string | null;
  timezone?: string | null;
}

export interface NotificationStats {
  total: number;
  new: number;
  read: number;
  byType: {
    order: number;
    promo: number;
    reward: number;
    delivery: number;
    system: number;
  };
  broadcast: number;
  // Enterprise stats
  sent: number;
  opened: number;
  clicked: number;
  engagementRate: number;
  openRate: number;
  clickRate: number;
}

export interface AnalyticsData {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  engagementRate: number;
  byType: Record<NotificationType, {
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  }>;
  byDate: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
  trends: {
    openRateTrend: number; // percentage change
    clickRateTrend: number;
    engagementTrend: number;
  };
}

export interface UserSegment {
  id: string;
  name: string;
  description?: string;
  filters: SegmentFilter[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface ABTest {
  id: string;
  name: string;
  variants: ABTestVariant[];
  splitRatio: number; // e.g., 50 for 50/50 split
  status: 'draft' | 'running' | 'completed';
  winnerId?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface ABTestVariant {
  id: string;
  title: string;
  message: string;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  openRate: number;
  clickRate: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: 'notification' | 'campaign' | 'automation' | 'template' | 'segment';
  entityId: string;
  userId: string;
  userName: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface UnifiedNotificationCenterProps {
  products?: any[];
  deals?: any[];
  users?: any[];
}




