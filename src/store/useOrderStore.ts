import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { fetchOrders, updateOrder as updateOrderInDb, Order } from '../utils/api/orders';
import { toast } from 'sonner';
import { safeParseJSON, safeSaveJSON, isAdminRole } from '../utils/helpers';

const ORDERS_KEY = 'idealpoint_orders';

// H3 Fix: Track active subscription to prevent memory leaks on re-initialize
let activeOrderSubscription: ReturnType<typeof supabase.channel> | null = null;

interface OrderState {
    orders: Order[];
    isInitialized: boolean;
    initialize: () => Promise<void>;
    handleAddOrder: (newOrder: Order) => Promise<void>;
    handleUpdateOrder: (orderId: string, orderData: Partial<Order>) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    isInitialized: false,

    initialize: async () => {
        if (get().isInitialized) return;

        // C5 Fix: Safe JSON parse — no crash on corrupt data
        const initialOrders = safeParseJSON<Order[]>(ORDERS_KEY, []);
        set({ orders: initialOrders, isInitialized: true });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const role = user?.user_metadata?.role || 'customer';
            // D4 Fix: isAdminRole utility instead of repeated array
            const fetchId = isAdminRole(role) ? undefined : user?.id;

            const dbOrders = await fetchOrders(fetchId);

            if (dbOrders.length > 0) {
                set(state => {
                    const merged = [...dbOrders];
                    state.orders.forEach(localOrder => {
                        if (!dbOrders.find(dbOrder => dbOrder.id === localOrder.id)) {
                            merged.push(localOrder);
                        }
                    });
                    safeSaveJSON(ORDERS_KEY, merged);
                    return { orders: merged };
                });
            }
        } catch (error) {
            // H5 Fix: No internal error details to UI
            console.error('[OrderStore] Failed to load orders from DB:', error);
        }

        // H3 Fix: Unsubscribe previous subscription before creating a new one
        if (activeOrderSubscription) {
            activeOrderSubscription.unsubscribe();
        }

        activeOrderSubscription = supabase
            .channel('public:orders')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload) => {
                    const updatedOrder = payload.new as Order;

                    set(state => {
                        const index = state.orders.findIndex(o => o.id === updatedOrder.id);
                        if (index !== -1) {
                            const newOrders = [...state.orders];

                            if (newOrders[index].status !== updatedOrder.status) {
                                // M1 Fix: Removed dead `as unknown as any` hack
                                supabase.auth.getUser().then(({ data: { user } }) => {
                                    const role = user?.user_metadata?.role || 'customer';
                                    if (!isAdminRole(role) && updatedOrder.userId === user?.id) {
                                        toast.success(
                                            `Your order #${updatedOrder.id.substring(0, 5)} is now ${updatedOrder.status.replace('_', ' ')}!`
                                        );
                                    }
                                });
                            }

                            newOrders[index] = { ...newOrders[index], ...updatedOrder };
                            safeSaveJSON(ORDERS_KEY, newOrders);
                            return { orders: newOrders };
                        }
                        return state;
                    });
                }
            )
            .subscribe();
    },

    handleAddOrder: async (newOrder) => {
        set(state => {
            const exists = state.orders.find(o => o.id === newOrder.id);
            const updated = exists
                ? state.orders.map(o => o.id === newOrder.id ? newOrder : o)
                : [newOrder, ...state.orders];
            safeSaveJSON(ORDERS_KEY, updated);
            return { orders: updated };
        });
    },

    handleUpdateOrder: async (orderId, orderData) => {
        const { orders } = get();
        const oldOrder = orders.find(o => o.id === orderId);
        if (!oldOrder) {
            toast.error('Order not found');
            return;
        }

        const updatedOrder = { ...oldOrder, ...orderData };
        set(state => {
            const updated = state.orders.map(o => o.id === orderId ? updatedOrder : o);
            safeSaveJSON(ORDERS_KEY, updated);
            return { orders: updated };
        });

        try {
            const dbUpdatedOrder = await updateOrderInDb(orderId, orderData);
            if (dbUpdatedOrder) {
                set(state => {
                    const updated = state.orders.map(o => o.id === orderId ? dbUpdatedOrder : o);
                    safeSaveJSON(ORDERS_KEY, updated);
                    return { orders: updated };
                });
                toast.success('Order updated successfully');
            }
        } catch (error: any) {
            // H5 Fix: Generic message to user, detail only in console
            console.error('[OrderStore] DB update failed:', error);
            toast.error('Failed to update order. Please try again.');
        }
    }
}));
