/**
 * Orders Management
 * Handles order creation, updates, and database integration
 */

import { supabase } from '../../config/supabase';
import { toast } from 'sonner';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  customization?: any;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryAddress: string;
  orderType: 'delivery' | 'pickup';
  customerName: string;
  customerPhone: string;
  instructions?: string;
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  createdAt?: string;
  updatedAt?: string;
  date?: string;
  time?: string;
}

/**
 * Create new order in Supabase
 */
export const createOrder = async (order: Order): Promise<Order | null> => {
  try {
    // Get current user if available
    const { data: { user } } = await supabase.auth.getUser();
    
    // Prepare order data for database (matching actual schema)
    const orderData = {
      id: order.id,
      order_number: order.orderNumber.replace('#', ''),
      user_id: user?.id || null,
      status: order.status,
      items: order.items,
      total_amount: order.total,
      delivery_fee: order.deliveryFee || 0,
      tax_amount: order.tax || 0,
      customer_details: {
        name: order.customerName,
        phone: order.customerPhone,
      },
      delivery_address: order.orderType === 'pickup' 
        ? { type: 'pickup', address: 'Store Pickup' }
        : { type: 'delivery', address: order.deliveryAddress },
      payment_method: order.paymentMethod || 'cash',
      notes: order.instructions || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      // Don't throw error, just log it - order should still work locally
      toast.error('Order created but failed to save to database');
      return order;
    }

    // Map database response back to Order format
    const customerDetails = data.customer_details || {};
    const deliveryAddr = data.delivery_address || {};
    const isPickup = deliveryAddr.type === 'pickup' || !deliveryAddr.address;
    
    const savedOrder: Order = {
      id: data.id,
      orderNumber: `#${data.order_number}`,
      userId: data.user_id,
      status: data.status,
      items: data.items || [],
      subtotal: (data.total_amount || 0) - (data.delivery_fee || 0) - (data.tax_amount || 0),
      deliveryFee: data.delivery_fee || 0,
      tax: data.tax_amount || 0,
      total: data.total_amount || 0,
      deliveryAddress: isPickup ? 'Store Pickup' : (deliveryAddr.address || ''),
      orderType: isPickup ? 'pickup' : 'delivery',
      customerName: customerDetails.name || '',
      customerPhone: customerDetails.phone || '',
      instructions: data.notes || undefined,
      paymentMethod: data.payment_method || 'cash',
      paymentStatus: 'pending',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      date: new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: new Date(data.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    console.log('✅ Order saved to Supabase:', savedOrder.id);
    return savedOrder;
  } catch (error: any) {
    console.error('Error creating order:', error);
    toast.error('Failed to save order to database');
    // Return original order even if database save fails
    return order;
  }
};

/**
 * Update order in Supabase
 */
export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order | null> => {
  try {
    // Prepare update data (matching actual schema)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status) updateData.status = updates.status;
    if (updates.items) updateData.items = updates.items;
    if (updates.total !== undefined) updateData.total_amount = updates.total;
    if (updates.deliveryFee !== undefined) updateData.delivery_fee = updates.deliveryFee;
    if (updates.tax !== undefined) updateData.tax_amount = updates.tax;
    if (updates.deliveryAddress || updates.orderType) {
      const isPickup = updates.orderType === 'pickup' || (!updates.deliveryAddress || updates.deliveryAddress === 'Store Pickup');
      updateData.delivery_address = isPickup 
        ? { type: 'pickup', address: 'Store Pickup' }
        : { type: 'delivery', address: updates.deliveryAddress || '' };
    }
    if (updates.customerName || updates.customerPhone) {
      updateData.customer_details = {
        name: updates.customerName,
        phone: updates.customerPhone,
      };
    }
    if (updates.instructions !== undefined) updateData.notes = updates.instructions;
    if (updates.paymentMethod) updateData.payment_method = updates.paymentMethod;

    console.log('🔄 Updating order in database:', orderId, 'Data:', updateData);
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('⚠️ User not authenticated, order update may fail due to RLS');
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating order:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      // Check if it's an RLS error
      if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
        console.error('❌ RLS Policy Error - User may not have permission to update orders');
        toast.error('Permission denied: Unable to update order. Please check user permissions.');
      } else {
        toast.error(`Failed to update order: ${error.message || 'Unknown error'}`);
      }
      return null;
    }
    
    if (!data) {
      console.error('❌ No data returned from update');
      toast.error('Order update returned no data');
      return null;
    }
    
    console.log('✅ Order update successful, received data:', data);
    console.log('✅ Updated status:', data.status);

    // Map database response back to Order format
    const customerDetails = data.customer_details || {};
    const deliveryAddr = data.delivery_address || {};
    const isPickup = deliveryAddr.type === 'pickup' || !deliveryAddr.address;
    
    const updatedOrder: Order = {
      id: data.id,
      orderNumber: `#${data.order_number}`,
      userId: data.user_id,
      status: data.status,
      items: data.items || [],
      subtotal: (data.total_amount || 0) - (data.delivery_fee || 0) - (data.tax_amount || 0),
      deliveryFee: data.delivery_fee || 0,
      tax: data.tax_amount || 0,
      total: data.total_amount || 0,
      deliveryAddress: isPickup ? 'Store Pickup' : (deliveryAddr.address || ''),
      orderType: isPickup ? 'pickup' : 'delivery',
      customerName: customerDetails.name || '',
      customerPhone: customerDetails.phone || '',
      instructions: data.notes || undefined,
      paymentMethod: data.payment_method || 'cash',
      paymentStatus: 'pending',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      date: new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: new Date(data.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    console.log('✅ Order updated in Supabase:', orderId);
    return updatedOrder;
  } catch (error: any) {
    console.error('Error updating order:', error);
    toast.error('Failed to update order in database');
    return null;
  }
};

/**
 * Fetch orders from Supabase
 */
export const fetchOrders = async (userId?: string): Promise<Order[]> => {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    // Map database response to Order format
    const orders: Order[] = (data || []).map((item: any) => {
      const customerDetails = item.customer_details || {};
      const deliveryAddr = item.delivery_address || {};
      const isPickup = deliveryAddr.type === 'pickup' || !deliveryAddr.address;
      
      return {
        id: item.id,
        orderNumber: `#${item.order_number}`,
        userId: item.user_id,
        status: item.status,
        items: item.items || [],
        subtotal: (item.total_amount || 0) - (item.delivery_fee || 0) - (item.tax_amount || 0),
        deliveryFee: item.delivery_fee || 0,
        tax: item.tax_amount || 0,
        total: item.total_amount || 0,
        deliveryAddress: isPickup ? 'Store Pickup' : (deliveryAddr.address || ''),
        orderType: isPickup ? 'pickup' : 'delivery',
        customerName: customerDetails.name || '',
        customerPhone: customerDetails.phone || '',
        instructions: item.notes || undefined,
        paymentMethod: item.payment_method || 'cash',
        paymentStatus: 'pending',
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        date: new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
    });

    return orders;
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

/**
 * Delete order from Supabase
 */
export const deleteOrder = async (orderId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order from database');
      return false;
    }

    console.log('✅ Order deleted from Supabase:', orderId);
    return true;
  } catch (error: any) {
    console.error('Error deleting order:', error);
    toast.error('Failed to delete order from database');
    return false;
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    // Map database response to Order format
    const customerDetails = data.customer_details || {};
    const deliveryAddr = data.delivery_address || {};
    const isPickup = deliveryAddr.type === 'pickup' || !deliveryAddr.address;
    
    const order: Order = {
      id: data.id,
      orderNumber: `#${data.order_number}`,
      userId: data.user_id,
      status: data.status,
      items: data.items || [],
      subtotal: (data.total_amount || 0) - (data.delivery_fee || 0) - (data.tax_amount || 0),
      deliveryFee: data.delivery_fee || 0,
      tax: data.tax_amount || 0,
      total: data.total_amount || 0,
      deliveryAddress: isPickup ? 'Store Pickup' : (deliveryAddr.address || ''),
      orderType: isPickup ? 'pickup' : 'delivery',
      customerName: customerDetails.name || '',
      customerPhone: customerDetails.phone || '',
      instructions: data.notes || undefined,
      paymentMethod: data.payment_method || 'cash',
      paymentStatus: 'pending',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      date: new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: new Date(data.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    return order;
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return null;
  }
};


