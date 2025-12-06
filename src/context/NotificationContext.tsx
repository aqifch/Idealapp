import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { localNotifications } from '../utils/localNotifications';

export interface Notification {
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
  icon?: React.ReactNode | null;
  createdBy?: string;
  isBroadcast?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (force?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  const lastFailureTime = useRef<number>(0);
  const RETRY_DELAY = 120000; // 2 minutes

  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || 'guest');
    };
    getUserId();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || 'guest');
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch notifications from server with local fallback
  const fetchNotifications = useCallback(async (force = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    // If in fallback mode and not forced, check if we should retry yet
    if (useLocalFallback && !force) {
      const timeSinceLastFailure = Date.now() - lastFailureTime.current;
      if (timeSinceLastFailure < RETRY_DELAY) {
        // Just refresh from local storage
        const localNotifs = localNotifications.getByUser(userId);
        if (localNotifs.length === 0) {
            localNotifications.seedDemo();
            setNotifications(localNotifications.getByUser(userId));
        } else {
            setNotifications(localNotifs);
        }
        setLoading(false);
        return;
      }
    }
    
    // Try server first
    try {
      const endpoint = userId === 'guest' 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-b09ae082/notifications`
        : `https://${projectId}.supabase.co/functions/v1/make-server-b09ae082/notifications/${userId}`;
      
      console.log(`📡 Fetching notifications from: ${endpoint}`);
      console.log(`📡 Using projectId: ${projectId}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 Response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const serverNotifs = data.notifications || [];
          
          // Merge with local-only notifications
          const localNotifs = localNotifications.getByUser(userId);
          const localOnly = localNotifs.filter(n => n.id.startsWith('local:'));
          
          const merged = [...serverNotifs, ...localOnly].sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          setNotifications(merged);
          setUseLocalFallback(false);
          console.log(`✅ Fetched ${serverNotifs.length} server + ${localOnly.length} local notifications`);
          setLoading(false);
          return;
        }
      }
      
      // If server failed, fall through to local storage
      throw new Error('Server unavailable');
    } catch (error) {
      // Only log full error if not in fallback mode to reduce noise
      if (!useLocalFallback) {
        console.log('ℹ️ Server unavailable, switching to local storage mode');
      }
      
      setUseLocalFallback(true);
      lastFailureTime.current = Date.now();
      
      // Use local storage fallback
      const localNotifs = localNotifications.getByUser(userId);
      
      // Seed demo notifications if empty
      if (localNotifs.length === 0) {
        localNotifications.seedDemo();
        const seededNotifs = localNotifications.getByUser(userId);
        setNotifications(seededNotifs);
        console.log(`✅ Loaded ${seededNotifs.length} demo notifications from local storage`);
      } else {
        setNotifications(localNotifs);
        console.log(`✅ Loaded ${localNotifs.length} notifications from local storage`);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Auto-fetch notifications on mount and userId change
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userId, fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      console.log(`📝 Marking notification as read: ${notificationId}`);
      
      if (useLocalFallback) {
        // Use local storage
        localNotifications.markAsRead(notificationId);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isNew: false, isRead: true } : n
          )
        );
        console.log(`✅ Notification marked as read locally`);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b09ae082/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const data = await response.json();
      console.log(`✅ Notification marked as read:`, data);

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isNew: false, isRead: true } : n
        )
      );
    } catch (error) {
      console.log('ℹ️ Server unavailable (markAsRead), falling back to local');
      setUseLocalFallback(true);
      // Fallback to local
      localNotifications.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isNew: false, isRead: true } : n
        )
      );
    }
  }, [useLocalFallback]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      if (useLocalFallback) {
        // Use local storage
        localNotifications.markAllAsRead(userId);
        setNotifications(prev =>
          prev.map(n => ({ ...n, isNew: false, isRead: true }))
        );
        toast.success('All notifications marked as read');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b09ae082/notifications/user/${userId}/read-all`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isNew: false, isRead: true }))
      );

      toast.success('All notifications marked as read');
    } catch (error) {
      console.log('ℹ️ Server unavailable (markAllAsRead), falling back to local');
      setUseLocalFallback(true);
      // Fallback to local
      localNotifications.markAllAsRead(userId);
      setNotifications(prev =>
        prev.map(n => ({ ...n, isNew: false, isRead: true }))
      );
      toast.success('All notifications marked as read');
    }
  }, [userId, useLocalFallback]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!userId) return;

    try {
      if (useLocalFallback) {
        // Use local storage
        localNotifications.clearAll(userId);
        setNotifications([]);
        toast.success('All notifications cleared');
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b09ae082/notifications/user/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to clear notifications');
      }

      // Update local state
      setNotifications([]);

      toast.success('All notifications cleared');
    } catch (error) {
      console.log('ℹ️ Server unavailable (clearAll), falling back to local');
      setUseLocalFallback(true);
      // Fallback to local
      localNotifications.clearAll(userId);
      setNotifications([]);
      toast.success('All notifications cleared');
    }
  }, [userId, useLocalFallback]);

  // Delete single notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      if (useLocalFallback) {
        // Use local storage
        localNotifications.delete(notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b09ae082/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.log('ℹ️ Server unavailable (deleteNotification), falling back to local');
      setUseLocalFallback(true);
      // Fallback to local
      localNotifications.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  }, [useLocalFallback]);

  const unreadCount = notifications.filter(n => n.isNew).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
