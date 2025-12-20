// Local storage fallback for notifications when server is unavailable

export interface LocalNotification {
  id: string;
  type: 'order' | 'promo' | 'reward' | 'delivery' | 'system';
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
}

const STORAGE_KEY = 'idealpoint_notifications';

export const localNotifications = {
  // Get all notifications
  getAll: (): LocalNotification[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading local notifications:', error);
      return [];
    }
  },

  // Get notifications for specific user
  getByUser: (userId: string): LocalNotification[] => {
    const all = localNotifications.getAll();
    return all.filter(n => 
      n.targetUserId === userId || 
      n.targetUserId === 'all' || 
      !n.targetUserId
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // Create notification
  create: (notification: Omit<LocalNotification, 'id' | 'timestamp' | 'isNew' | 'isRead'>): LocalNotification => {
    const all = localNotifications.getAll();
    const newNotification: LocalNotification = {
      ...notification,
      id: `local:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isNew: true,
      isRead: false,
    };
    all.push(newNotification);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return newNotification;
  },

  // Update notification
  update: (id: string, updates: Partial<LocalNotification>): boolean => {
    const all = localNotifications.getAll();
    const index = all.findIndex(n => n.id === id);
    if (index === -1) return false;
    
    all[index] = { ...all[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  },

  // Mark as read
  markAsRead: (id: string): boolean => {
    return localNotifications.update(id, { isNew: false, isRead: true });
  },

  // Mark all as read for user
  markAllAsRead: (userId: string): boolean => {
    const all = localNotifications.getAll();
    const updated = all.map(n => {
      if (n.targetUserId === userId || n.targetUserId === 'all' || !n.targetUserId) {
        return { ...n, isNew: false, isRead: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  },

  // Delete notification
  delete: (id: string): boolean => {
    const all = localNotifications.getAll();
    const filtered = all.filter(n => n.id !== id);
    if (filtered.length === all.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Clear all for user
  clearAll: (userId: string): boolean => {
    const all = localNotifications.getAll();
    const filtered = all.filter(n => 
      n.targetUserId !== userId && 
      n.targetUserId !== 'all' && 
      n.targetUserId !== undefined
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Get stats
  getStats: () => {
    const all = localNotifications.getAll();
    return {
      total: all.length,
      new: all.filter(n => n.isNew).length,
      read: all.filter(n => n.isRead).length,
      byType: {
        order: all.filter(n => n.type === 'order').length,
        promo: all.filter(n => n.type === 'promo').length,
        reward: all.filter(n => n.type === 'reward').length,
        delivery: all.filter(n => n.type === 'delivery').length,
        system: all.filter(n => n.type === 'system').length,
      },
      broadcast: all.filter(n => n.isBroadcast).length,
    };
  },

  // Seed some demo notifications
  // NOTE: Edit these notifications here to change what new users see
  seedDemo: () => {
    const existing = localNotifications.getAll();
    if (existing.length > 0) return; // Already has notifications

    const demoNotifications: Omit<LocalNotification, 'id' | 'timestamp' | 'isNew' | 'isRead'>[] = [
      {
        type: 'promo',
        title: '🎉 Welcome to IDEAL POINT!', // EDIT: Change title here
        message: 'Get 20% off on your first order! Use code: WELCOME20', // EDIT: Change message here
        targetUserId: 'all',
        createdBy: 'system',
        isBroadcast: true,
      },
      {
        type: 'delivery',
        title: '🚚 Fast Delivery Available', // EDIT: Change title here
        message: 'Order now and get delivery within 30 minutes in your area!', // EDIT: Change message here
        targetUserId: 'all',
        createdBy: 'system',
      },
      {
        type: 'reward',
        title: '⭐ Loyalty Rewards Unlocked', // EDIT: Change title here
        message: 'You have earned 50 reward points! Redeem them on your next purchase.', // EDIT: Change message here
        targetUserId: 'all',
        createdBy: 'system',
      },
    ];

    demoNotifications.forEach(notif => localNotifications.create(notif));
    console.log('✅ Demo notifications seeded');
  },

  // Sync server notifications to local storage
  sync: (notifications: LocalNotification[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      return true;
    } catch (error) {
      console.error('Error syncing notifications:', error);
      return false;
    }
  },
};
