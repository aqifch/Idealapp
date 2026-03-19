import { create } from 'zustand';
import { Notification, NotificationStats } from '../components/notification/UnifiedNotificationCenter/types';
import { unifiedNotificationService } from '../utils/notifications/unifiedNotificationService';
import { localNotifications } from '../utils/notifications/localNotifications';
import { supabase } from '../config/supabase';

interface NotificationState {
    notifications: Notification[];
    stats: NotificationStats | null;
    unreadCount: number;
    isLoading: boolean;
    isInitialized: boolean;
    
    // Actions
    initialize: (userId?: string) => Promise<void>;
    fetchNotifications: () => Promise<void>;
    fetchStats: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    
    // Realtime
    setupRealtimeSubscription: (userId: string) => void;
    handleNewRealtimeNotification: (payload: any) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    stats: null,
    unreadCount: 0,
    isLoading: false,
    isInitialized: false,

    initialize: async (userId?: string) => {
        if (get().isInitialized) return;
        
        set({ isLoading: true });
        
        // Initial load from local storage to be fast
        const localNotifs = userId 
            ? localNotifications.getByUser(userId) 
            : localNotifications.getAll();
            
        const localUnreadCount = localNotifs.filter(n => n.isNew).length;
        
        set({ 
            notifications: localNotifs, 
            unreadCount: localUnreadCount,
            isInitialized: true 
        });

        // Fetch fresh from server
        await get().fetchNotifications();
        await get().fetchStats();
        
        set({ isLoading: false });
        
        // Setup realtime if user is logged in
        if (userId) {
            get().setupRealtimeSubscription(userId);
        }
    },

    fetchNotifications: async () => {
        try {
            const notifs = await unifiedNotificationService.getAllNotifications();
            const unreadCount = notifs.filter(n => n.isNew).length;
            
            set({ notifications: notifs, unreadCount });
            
            // Sync to local
            // Convert back to LocalNotification format for sync
            localNotifications.sync(notifs.map(n => ({
                id: n.id,
                type: n.type as any,
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
                isBroadcast: n.isBroadcast
            })));
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    },
    
    fetchStats: async () => {
        try {
            const stats = await unifiedNotificationService.getStats();
            set({ stats });
        } catch (error) {
            console.error('Failed to fetch notification stats:', error);
        }
    },

    markAsRead: async (notificationId: string) => {
        // Optimistic UI update
        const { notifications, unreadCount } = get();
        const updatedNotifications = notifications.map(n => 
            n.id === notificationId ? { ...n, isNew: false, isRead: true } : n
        );
        
        const isPreviouslyUnread = notifications.find(n => n.id === notificationId)?.isNew;
        const newUnreadCount = Math.max(0, isPreviouslyUnread ? unreadCount - 1 : unreadCount);
        
        set({ notifications: updatedNotifications, unreadCount: newUnreadCount });
        
        // Local update
        localNotifications.markAsRead(notificationId);
        
        // Server update (with offline queueing logic handled inside service)
        await unifiedNotificationService.bulkOperation([notificationId], 'mark_read');
    },
    
    markAllAsRead: async () => {
        const { notifications } = get();
        const updated = notifications.map(n => ({ ...n, isNew: false, isRead: true }));
        set({ notifications: updated, unreadCount: 0 });
        
        const unreadIds = notifications.filter(n => n.isNew).map(n => n.id);
        if (unreadIds.length > 0) {
            await unifiedNotificationService.bulkOperation(unreadIds, 'mark_read');
        }
    },

    deleteNotification: async (notificationId: string) => {
        const { notifications, unreadCount } = get();
        const isUnread = notifications.find(n => n.id === notificationId)?.isNew;
        
        const filtered = notifications.filter(n => n.id !== notificationId);
        const newUnreadCount = Math.max(0, isUnread ? unreadCount - 1 : unreadCount);
        
        set({ notifications: filtered, unreadCount: newUnreadCount });
        
        localNotifications.delete(notificationId);
        await unifiedNotificationService.bulkOperation([notificationId], 'delete');
    },
    
    setupRealtimeSubscription: (userId: string) => {
        // Subscribe to notifications table changes for the specific user or broadcast
        const channel = supabase
            .channel(`notifications:target_user_id=eq.${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `target_user_id=eq.${userId}`
                },
                (payload) => get().handleNewRealtimeNotification(payload.new)
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `is_broadcast=eq.true`
                },
                (payload) => get().handleNewRealtimeNotification(payload.new)
            )
            .subscribe();
            
        // Return cleanup function implicitly bound to lifecycle via useEffect in components if needed
    },
    
    handleNewRealtimeNotification: (payload: any) => {
        // Transform payload to our Notification type
        const newNotif: Notification = {
            id: payload.id,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            timestamp: payload.created_at || new Date().toISOString(),
            isNew: true,
            isRead: false,
            targetUserId: payload.target_user_id,
            actionUrl: payload.action_url,
            imageUrl: payload.image_url,
            productId: payload.product_id,
            dealId: payload.deal_id,
            createdBy: payload.createdBy,
            isBroadcast: payload.is_broadcast,
        };
        
        const currentNotifications = get().notifications;
        // Check if we don't already have it
        if (!currentNotifications.some(n => n.id === newNotif.id)) {
            set(state => ({
                notifications: [newNotif, ...state.notifications].sort((a,b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                ),
                unreadCount: state.unreadCount + 1
            }));
            
            // Add to localStorage
            localNotifications.create(newNotif as any); // Type cast due to id generation
        }
    }
}));
