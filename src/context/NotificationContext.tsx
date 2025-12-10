import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getProjectId, getPublicAnonKey, getFunctionUrl } from '../config/supabase';
import { supabase } from '../config/supabase';
import { toast } from 'sonner';
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
      const projectId = getProjectId();
      
      // Always use user-specific endpoint if userId is available, otherwise use all notifications
      const endpoint = userId && userId !== 'guest'
        ? getFunctionUrl(`make-server-b09ae082/notifications/${userId}`)
        : getFunctionUrl('make-server-b09ae082/notifications');
      
      console.log(`📡 Fetching notifications from: ${endpoint}`);
      console.log(`📡 User ID: ${userId}`);
      console.log(`📡 Using projectId: ${projectId}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getPublicAnonKey()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 Response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`📡 Response data:`, data);
        
        if (data.success) {
          const serverNotifs = data.notifications || [];
          
          // If server returned empty array, try direct database fetch as fallback
          if (serverNotifs.length === 0 && userId && userId !== 'guest') {
            console.log('⚠️ Server returned empty notifications, trying direct database fetch...');
            try {
              const { data: dbData, error: dbError } = await supabase
                .from('notifications')
                .select('*')
                .or(`target_user_id.eq.${userId},is_broadcast.eq.true`)
                .order('created_at', { ascending: false });
              
              if (!dbError && dbData && dbData.length > 0) {
                console.log(`✅ Fetched ${dbData.length} notifications directly from database`);
                const mappedDbNotifs = dbData.map((n: any) => ({
                  id: `notification:${n.id}`,
                  type: n.type,
                  title: n.title,
                  message: n.message,
                  timestamp: n.created_at,
                  isNew: !n.is_read,
                  isRead: n.is_read || false,
                  targetUserId: n.target_user_id || 'all',
                  actionUrl: n.action_url,
                  imageUrl: n.image_url,
                  productId: n.product_id,
                  dealId: n.deal_id,
                  isBroadcast: n.is_broadcast || false,
                }));
                
                const localNotifs = localNotifications.getByUser(userId);
                const localOnly = localNotifs.filter(n => n.id.startsWith('local:'));
                const merged = [...mappedDbNotifs, ...localOnly].sort((a: any, b: any) => 
                  new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
                );
                
                setNotifications(merged);
                setUseLocalFallback(false);
                console.log(`✅ Fetched ${mappedDbNotifs.length} database + ${localOnly.length} local notifications`);
                setLoading(false);
                return;
              }
            } catch (dbFetchError) {
              console.warn('⚠️ Direct database fetch also failed:', dbFetchError);
            }
          }
          
          // Map server notifications to match local format
          const mappedNotifs = serverNotifs.map((n: any) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            timestamp: n.timestamp || n.created_at,
            isNew: n.isNew !== undefined ? n.isNew : true,
            isRead: n.isRead !== undefined ? n.isRead : false,
            targetUserId: n.targetUserId || n.target_user_id,
            actionUrl: n.actionUrl || n.action_url,
            imageUrl: n.imageUrl || n.image_url,
            productId: n.productId || n.product_id,
            dealId: n.dealId || n.deal_id,
            isBroadcast: n.targetUserId === 'all' || n.isBroadcast,
          }));
          
          // Merge with local-only notifications
          const localNotifs = localNotifications.getByUser(userId);
          const localOnly = localNotifs.filter(n => n.id.startsWith('local:'));
          
          const merged = [...mappedNotifs, ...localOnly].sort((a: any, b: any) => 
            new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
          );

          setNotifications(merged);
          setUseLocalFallback(false);
          console.log(`✅ Fetched ${mappedNotifs.length} server + ${localOnly.length} local notifications`);
          setLoading(false);
          return;
        } else {
          console.warn('⚠️ Server returned success:false:', data);
        }
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('❌ Server response error:', response.status, errorText);
      }
      
      // If server failed, try direct database fetch before falling to local storage
      if (userId && userId !== 'guest') {
        console.log('⚠️ Server failed, trying direct database fetch...');
        try {
          const { data: dbData, error: dbError } = await supabase
            .from('notifications')
            .select('*')
            .or(`target_user_id.eq.${userId},is_broadcast.eq.true`)
            .order('created_at', { ascending: false });
          
          if (!dbError && dbData && dbData.length > 0) {
            console.log(`✅ Fetched ${dbData.length} notifications directly from database`);
            const mappedDbNotifs = dbData.map((n: any) => ({
              id: `notification:${n.id}`,
              type: n.type,
              title: n.title,
              message: n.message,
              timestamp: n.created_at,
              isNew: !n.is_read,
              isRead: n.is_read || false,
              targetUserId: n.target_user_id || 'all',
              actionUrl: n.action_url,
              imageUrl: n.image_url,
              productId: n.product_id,
              dealId: n.deal_id,
              isBroadcast: n.is_broadcast || false,
            }));
            
            const localNotifs = localNotifications.getByUser(userId);
            const localOnly = localNotifs.filter(n => n.id.startsWith('local:'));
            const merged = [...mappedDbNotifs, ...localOnly].sort((a: any, b: any) => 
              new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
            );
            
            setNotifications(merged);
            setUseLocalFallback(false);
            console.log(`✅ Fetched ${mappedDbNotifs.length} database + ${localOnly.length} local notifications`);
            setLoading(false);
            return;
          }
        } catch (dbFetchError) {
          console.warn('⚠️ Direct database fetch failed:', dbFetchError);
        }
      }
      
      // If everything failed, fall through to local storage
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

  // Listen for refresh events (e.g., after order status change)
  useEffect(() => {
    const handleRefresh = () => {
      fetchNotifications(true); // Force refresh
    };

    window.addEventListener('refreshNotifications', handleRefresh);
    return () => window.removeEventListener('refreshNotifications', handleRefresh);
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Extract database ID (remove "notification:" prefix if present)
      const dbId = notificationId.replace("notification:", "");
      console.log(`📝 Marking notification as read: ${notificationId} (DB ID: ${dbId})`);
      
      // Try direct database update first (more reliable)
      const { data: updatedData, error: dbError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', dbId)
        .select()
        .single();
      
      if (!dbError && updatedData) {
        console.log(`✅ Notification marked as read in database: ${dbId}`);
        // Also update local storage
        localNotifications.markAsRead(notificationId);
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isNew: false, isRead: true } : n
          )
        );
        return;
      }
      
      // Log the error for debugging
      console.error('❌ Direct DB update error:', dbError);
      console.log('⚠️ Direct DB update failed, trying Edge Function...');
      
      // If direct DB fails, try Edge Function
      const response = await fetch(
        getFunctionUrl(`make-server-b09ae082/notifications/${notificationId}/read`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Notification marked as read via Edge Function:`, data);
        // Also update local storage
        localNotifications.markAsRead(notificationId);
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isNew: false, isRead: true } : n
          )
        );
        return;
      }
      
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('❌ Edge Function update error:', response.status, errorText);
      throw new Error(`Failed to mark notification as read: ${errorText}`);
    } catch (error: any) {
      console.error('❌ Both database and server failed (markAsRead):', error);
      // Fallback to local storage only
      localNotifications.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isNew: false, isRead: true } : n
        )
      );
      toast.warning('Notification marked as read locally (may revert on refresh)');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      console.log(`📝 Marking all notifications as read for user: ${userId}`);
      
      // Try direct database update first (more reliable)
      const { data: updatedData, error: dbError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .or(`target_user_id.eq.${userId},is_broadcast.eq.true`)
        .select();
      
      if (!dbError) {
        const updatedCount = updatedData?.length || 0;
        console.log(`✅ Marked ${updatedCount} notifications as read in database`);
        // Also update local storage
        localNotifications.markAllAsRead(userId);
        // Update local state
        setNotifications(prev =>
          prev.map(n => ({ ...n, isNew: false, isRead: true }))
        );
        toast.success(`All notifications marked as read (${updatedCount} updated)`);
        return;
      }
      
      // Log the error for debugging
      console.error('❌ Direct DB update error:', dbError);
      console.log('⚠️ Direct DB update failed, trying Edge Function...');
      
      // If direct DB fails, try Edge Function
      const response = await fetch(
        getFunctionUrl(`make-server-b09ae082/notifications/user/${userId}/read-all`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        console.log(`✅ All notifications marked as read via Edge Function`);
        // Also update local storage
        localNotifications.markAllAsRead(userId);
        // Update local state
        setNotifications(prev =>
          prev.map(n => ({ ...n, isNew: false, isRead: true }))
        );
        toast.success('All notifications marked as read');
        return;
      }
      
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('❌ Edge Function update error:', response.status, errorText);
      throw new Error(`Failed to mark all notifications as read: ${errorText}`);
    } catch (error: any) {
      console.error('❌ Both database and server failed (markAllAsRead):', error);
      // Fallback to local storage only
      localNotifications.markAllAsRead(userId);
      setNotifications(prev =>
        prev.map(n => ({ ...n, isNew: false, isRead: true }))
      );
      toast.success('All notifications marked as read (local only - may revert on refresh)');
    }
  }, [userId]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!userId) return;

    try {
      // Try direct database deletion first (more reliable)
      console.log(`🗑️ Clearing all notifications for user: ${userId}`);
      
      const { data: deletedData, error: dbError } = await supabase
        .from('notifications')
        .delete()
        .or(`target_user_id.eq.${userId},is_broadcast.eq.true`)
        .select();
      
      if (!dbError) {
        const deletedCount = deletedData?.length || 0;
        console.log(`✅ Cleared ${deletedCount} notifications from database for user: ${userId}`);
        // Also clear local storage
        localNotifications.clearAll(userId);
        setNotifications([]);
        toast.success(`All notifications cleared (${deletedCount} deleted)`);
        return;
      }
      
      // Log the error for debugging
      console.error('❌ Direct DB delete error:', dbError);
      console.log('⚠️ Direct DB delete failed, trying Edge Function...');
      
      // If direct DB fails, try Edge Function
      const response = await fetch(
        getFunctionUrl(`make-server-b09ae082/notifications/user/${userId}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const count = result.count || 0;
        console.log(`✅ Cleared ${count} notifications via Edge Function`);
        // Also clear local storage
        localNotifications.clearAll(userId);
        setNotifications([]);
        toast.success(`All notifications cleared (${count} deleted)`);
        return;
      }
      
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('❌ Edge Function delete error:', response.status, errorText);
      throw new Error(`Failed to clear notifications: ${errorText}`);
    } catch (error: any) {
      console.error('❌ Both database and server failed (clearAll):', error);
      // Fallback to local storage only
      localNotifications.clearAll(userId);
      setNotifications([]);
      toast.success('All notifications cleared (local only - refresh may restore them)');
    }
  }, [userId]);

  // Delete single notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      // Extract database ID (remove "notification:" prefix if present)
      const dbId = notificationId.replace("notification:", "");
      console.log(`🗑️ Deleting notification: ${notificationId} (DB ID: ${dbId})`);
      
      // Try direct database deletion first (more reliable)
      const { data: deletedData, error: dbError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', dbId)
        .select();
      
      if (!dbError) {
        console.log(`✅ Deleted notification from database: ${dbId}`);
        // Also delete from local storage
        localNotifications.delete(notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        return;
      }
      
      // Log the error for debugging
      console.error('❌ Direct DB delete error:', dbError);
      console.log('⚠️ Direct DB delete failed, trying Edge Function...');
      
      // If direct DB fails, try Edge Function
      const response = await fetch(
        getFunctionUrl(`make-server-b09ae082/notifications/${notificationId}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        console.log(`✅ Deleted notification via Edge Function: ${notificationId}`);
        // Also delete from local storage
        localNotifications.delete(notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        return;
      }
      
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('❌ Edge Function delete error:', response.status, errorText);
      throw new Error(`Failed to delete notification: ${errorText}`);
    } catch (error: any) {
      console.error('❌ Both database and server failed (deleteNotification):', error);
      // Fallback to local storage only
      localNotifications.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.warning('Notification removed locally (may reappear on refresh)');
    }
  }, []);

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
