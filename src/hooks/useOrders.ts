import { useState, useEffect } from 'react';
import logger from '../utils/logger';
import { supabase } from '../config/supabase';
import { fetchOrders, updateOrder as updateOrderInDb, Order } from '../utils/api/orders';
import { toast } from 'sonner';

/**
 * Custom hook for orders state management with database sync.
 * Handles loading, adding, and updating orders with notification automation.
 */
export function useOrders() {
    const [orders, setOrders] = useState<Order[]>(() => {
        const saved = localStorage.getItem('idealpoint_orders');
        return saved ? JSON.parse(saved) : [];
    });

    // Load orders from database on mount
    useEffect(() => {
        const loadOrders = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                const role = user?.user_metadata?.role || 'customer';
                const hasAdminAccess = ['admin', 'manager', 'staff', 'support'].includes(role);
                const fetchId = hasAdminAccess ? undefined : user?.id;

                const dbOrders = await fetchOrders(fetchId);

                if (dbOrders.length > 0) {
                    setOrders(prevOrders => {
                        const merged = [...dbOrders];
                        prevOrders.forEach(localOrder => {
                            if (!dbOrders.find(dbOrder => dbOrder.id === localOrder.id)) {
                                merged.push(localOrder);
                            }
                        });
                        return merged;
                    });
                    logger.log('✅ Orders loaded from database:', dbOrders.length);
                }
            } catch (error) {
                console.error('Error loading orders from database:', error);
            }
        };

        loadOrders();
    }, []);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('idealpoint_orders', JSON.stringify(orders));
    }, [orders]);

    const handleAddOrder = async (newOrder: Order) => {
        setOrders(prevOrders => {
            const exists = prevOrders.find(o => o.id === newOrder.id);
            if (exists) {
                return prevOrders.map(o => o.id === newOrder.id ? newOrder : o);
            }
            return [newOrder, ...prevOrders];
        });
    };

    const handleUpdateOrder = async (orderId: string, orderData: Partial<Order>) => {
        const oldOrder = orders.find(o => o.id === orderId);
        if (!oldOrder) {
            console.error('Order not found:', orderId);
            toast.error('Order not found');
            return;
        }

        // Update local state immediately
        const updatedOrder = { ...oldOrder, ...orderData };
        const updatedOrders = orders.map(order =>
            order.id === orderId ? updatedOrder : order
        );
        setOrders(updatedOrders);

        // Update in database
        let dbUpdatedOrder: Order | null = null;
        try {
            logger.log('🔄 Updating order in database:', orderId, orderData);
            dbUpdatedOrder = await updateOrderInDb(orderId, orderData);
            if (dbUpdatedOrder) {
                setOrders(prevOrders =>
                    prevOrders.map(o => o.id === orderId ? dbUpdatedOrder! : o)
                );
                logger.log('✅ Order updated in database:', orderId, 'Status:', dbUpdatedOrder.status);
                toast.success('Order updated successfully');
            } else {
                logger.warn('⚠️ Order update returned null');
                toast.error('Failed to update order in database');
            }
        } catch (error: any) {
            console.error('❌ Error updating order in database:', error);
            toast.error(`Failed to update order: ${error.message || 'Unknown error'}`);
        }

        // Trigger order status change automation
        const oldStatus = oldOrder.status;
        const newStatus = orderData.status || updatedOrder.status || oldStatus;

        if (oldStatus !== newStatus && newStatus) {
            const orderNumber = oldOrder.orderNumber || updatedOrder.orderNumber || orderId;
            const orderTotal = updatedOrder.total || oldOrder.total || 0;

            logger.log(`🔄 Order status changed: ${oldStatus} → ${newStatus} (Order: ${orderNumber})`);

            // Get customer user ID
            let customerUserId: string | undefined = undefined;
            if (dbUpdatedOrder?.userId) {
                customerUserId = dbUpdatedOrder.userId;
            } else if (updatedOrder.userId) {
                customerUserId = updatedOrder.userId;
            } else if (oldOrder.userId) {
                customerUserId = oldOrder.userId;
            } else {
                try {
                    const { supabase } = await import('../config/supabase');
                    const { data: { user } } = await supabase.auth.getUser();
                    customerUserId = user?.id;
                } catch (err) {
                    logger.warn('Could not get user ID from session');
                }
            }

            logger.log('🔔 Triggering notifications for order:', orderId, 'Status change:', `${oldStatus} → ${newStatus}`, 'User:', customerUserId || 'all');

            try {
                const { triggerAutomation } = await import('../utils/notifications/notificationAutomation');

                await triggerAutomation('order_status_changed', {
                    orderNumber,
                    orderId,
                    oldStatus,
                    newStatus,
                    status: newStatus,
                    total: orderTotal,
                    customerName: updatedOrder.customerName || oldOrder.customerName,
                }, customerUserId);

                if (newStatus === 'confirmed' && oldStatus !== 'confirmed') {
                    await triggerAutomation('order_confirmed', {
                        orderNumber, orderId, total: orderTotal,
                        estimatedTime: '30-45 minutes',
                        customerName: updatedOrder.customerName || oldOrder.customerName,
                    }, customerUserId);
                } else if (newStatus === 'preparing' && oldStatus !== 'preparing') {
                    await triggerAutomation('order_preparing', {
                        orderNumber, orderId, total: orderTotal,
                    }, customerUserId);
                } else if (newStatus === 'ready' && oldStatus !== 'ready') {
                    await triggerAutomation('order_ready', {
                        orderNumber, orderId, total: orderTotal,
                    }, customerUserId);
                } else if (newStatus === 'completed' && oldStatus !== 'completed') {
                    await triggerAutomation('order_completed', {
                        orderNumber, orderId, total: orderTotal,
                    }, customerUserId);
                } else if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
                    await triggerAutomation('order_cancelled', {
                        orderNumber, orderId, total: orderTotal,
                    }, customerUserId);
                }

                logger.log('✅ Notifications triggered successfully for status change:', `${oldStatus} → ${newStatus}`);

                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('refreshNotifications'));
                    logger.log('🔄 Notification refresh event dispatched');
                }, 1000);
            } catch (error: any) {
                console.error('❌ Error triggering status change automation:', error);
                toast.error(`Order updated but notification failed: ${error.message || 'Unknown error'}`);
            }
        }
    };

    return { orders, handleAddOrder, handleUpdateOrder };
}
