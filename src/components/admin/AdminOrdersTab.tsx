import React, { useState } from "react";
import logger from '../../utils/logger';
import { motion, AnimatePresence } from "motion/react";
import {
    Package,
    ShoppingBag,
    Search,
    Eye,
    X,
    DollarSign,
    CheckCircle,
    Clock,
    XCircle,
    Loader,
    ArrowDown,
    Layers,
    BarChart3,
    Users,
} from "lucide-react";
import { toast } from "sonner";

interface AdminOrdersTabProps {
    orders: any[];
    localOrders: any[];
    onUpdateOrder?: (orderId: string, data: any) => Promise<void>;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return '#FF9F40';
        case 'confirmed': return '#3B82F6';
        case 'preparing': return '#F59E0B';
        case 'ready': return '#8B5CF6';
        case 'out-for-delivery': return '#14B8A6';
        case 'delivered': return '#10B981';
        case 'completed': return '#10B981';
        case 'cancelled': return '#EF4444';
        default: return '#6B7280';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pending': return <Clock className="w-4 h-4" />;
        case 'confirmed': return <CheckCircle className="w-4 h-4" />;
        case 'preparing': return <Loader className="w-4 h-4 animate-spin" />;
        case 'ready': return <Package className="w-4 h-4" />;
        case 'out-for-delivery': return <ShoppingBag className="w-4 h-4" />;
        case 'delivered': return <CheckCircle className="w-4 h-4" />;
        case 'completed': return <CheckCircle className="w-4 h-4" />;
        case 'cancelled': return <XCircle className="w-4 h-4" />;
        default: return <Clock className="w-4 h-4" />;
    }
};

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
    orders,
    localOrders,
    onUpdateOrder,
}) => {
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [orderViewMode, setOrderViewMode] = useState<'pipeline' | 'list'>('pipeline');
    const [orderSearchQuery, setOrderSearchQuery] = useState("");

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        if (onUpdateOrder) {
            try {
                await onUpdateOrder(orderId, { status: newStatus });
                toast.success(`Order status updated to ${newStatus}`);
                logger.log('✅ Order status updated:', orderId, 'to', newStatus);
            } catch (error) {
                console.error('Error updating order status:', error);
                toast.error('Failed to update order status');
            }
        } else {
            logger.warn('onUpdateOrder function not provided');
            toast.error('Order update function not available');
        }
    };

    const handleMoveToNextStep = (orderId: string, currentStatus: string) => {
        const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered'];
        const currentIndex = statusFlow.indexOf(currentStatus);

        if (currentIndex < statusFlow.length - 1) {
            const nextStatus = statusFlow[currentIndex + 1];
            handleStatusChange(orderId, nextStatus);
        }
    };

    const pipelineStages = [
        {
            id: 'pending',
            label: 'New Orders',
            color: '#FF9F40',
            bgColor: 'rgba(255, 159, 64, 0.1)',
            icon: <Clock className="w-4 h-4" />
        },
        {
            id: 'confirmed',
            label: 'Confirmed',
            color: '#3B82F6',
            bgColor: 'rgba(59, 130, 246, 0.1)',
            icon: <CheckCircle className="w-4 h-4" />
        },
        {
            id: 'preparing',
            label: 'Preparing',
            color: '#F59E0B',
            bgColor: 'rgba(245, 158, 11, 0.1)',
            icon: <Loader className="w-4 h-4" />
        },
        {
            id: 'ready',
            label: 'Ready',
            color: '#8B5CF6',
            bgColor: 'rgba(139, 92, 246, 0.1)',
            icon: <Package className="w-4 h-4" />
        },
        {
            id: 'out-for-delivery',
            label: 'Out for Delivery',
            color: '#14B8A6',
            bgColor: 'rgba(20, 184, 166, 0.1)',
            icon: <ShoppingBag className="w-4 h-4" />
        },
        {
            id: 'delivered',
            label: 'Delivered',
            color: '#10B981',
            bgColor: 'rgba(16, 185, 129, 0.1)',
            icon: <CheckCircle className="w-4 h-4" />
        },
    ];

    const filterOrders = (ordersToFilter: any[]) => {
        if (!orderSearchQuery) return ordersToFilter;
        const query = orderSearchQuery.toLowerCase();
        return ordersToFilter.filter(order =>
            order.orderNumber.toLowerCase().includes(query) ||
            order.customerName?.toLowerCase().includes(query) ||
            order.customerPhone?.toLowerCase().includes(query)
        );
    };

    return (
        <div className="relative flex h-[calc(100vh-120px)] overflow-hidden -mx-6 px-6">
            {/* Main Content Area - Pipeline */}
            <div className={`flex-1 overflow-x-auto transition-all duration-300 pr-2 ${selectedOrder ? 'mr-[400px]' : ''}`}>
                <div className="space-y-6 pb-20">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Order Management</h2>
                                <p className="text-gray-600">{(() => {
                                    const ordersToUse = localOrders.length > 0 ? localOrders : orders;
                                    return `${ordersToUse.length} total orders • Total Revenue: Rs ${ordersToUse.reduce((sum: number, order: any) => sum + (Number(order.total) || Number(order.total_amount) || 0), 0).toLocaleString()}`;
                                })()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* View Toggle */}
                                <div className="flex items-center gap-2 p-1 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60">
                                    <button
                                        onClick={() => setOrderViewMode('pipeline')}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${orderViewMode === 'pipeline'
                                                ? 'bg-orange-500 text-white shadow-lg'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Layers className="w-4 h-4 inline mr-2" />
                                        Pipeline
                                    </button>
                                    <button
                                        onClick={() => setOrderViewMode('list')}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${orderViewMode === 'list'
                                                ? 'bg-orange-500 text-white shadow-lg'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <BarChart3 className="w-4 h-4 inline mr-2" />
                                        List
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders by number, customer name, phone, or items..."
                                value={orderSearchQuery}
                                onChange={(e) => setOrderSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl font-medium text-sm outline-none transition-all focus:ring-2 focus:ring-orange-300"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.8)',
                                }}
                            />
                            {orderSearchQuery && (
                                <button
                                    onClick={() => setOrderSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {orderViewMode === 'list' ? (
                        // List View - Table
                        <div
                            className="rounded-3xl overflow-hidden backdrop-blur-xl"
                            style={{
                                background: 'rgba(255, 255, 255, 0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            {(() => {
                                const ordersToUse = localOrders.length > 0 ? localOrders : orders;
                                const filteredOrders = filterOrders(ordersToUse);
                                return filteredOrders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingBag className="w-10 h-10 text-orange-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {orderSearchQuery ? 'No Orders Found' : 'No Orders Yet'}
                                        </h3>
                                        <p className="text-gray-500">
                                            {orderSearchQuery
                                                ? 'Try adjusting your search terms'
                                                : 'Orders placed by customers will appear here.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-orange-50/50">
                                                <tr>
                                                    <th className="text-left py-4 px-6 font-bold text-gray-700">Order ID</th>
                                                    <th className="text-left py-4 px-6 font-bold text-gray-700">Customer</th>
                                                    <th className="text-left py-4 px-6 font-bold text-gray-700">Items</th>
                                                    <th className="text-left py-4 px-6 font-bold text-gray-700">Total</th>
                                                    <th className="text-left py-4 px-6 font-bold text-gray-700">Status</th>
                                                    <th className="text-left py-4 px-6 font-bold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOrders.map((order) => (
                                                    <tr
                                                        key={order.id}
                                                        className={`border-t border-gray-100 hover:bg-orange-50/30 transition-all cursor-pointer ${selectedOrder?.id === order.id ? 'bg-orange-50/50' : ''}`}
                                                        onClick={() => setSelectedOrder(order)}
                                                    >
                                                        <td className="py-4 px-6 font-bold text-gray-900">{order.orderNumber}</td>
                                                        <td className="py-4 px-6 text-gray-700">
                                                            <div>{order.customerName || order.customer}</div>
                                                            <div className="text-xs text-gray-500">{order.customerPhone}</div>
                                                        </td>
                                                        <td className="py-4 px-6 text-gray-700">
                                                            {order.items && Array.isArray(order.items) ? order.items.length : (typeof order.items === 'number' ? order.items : 1)} items
                                                        </td>
                                                        <td className="py-4 px-6 font-bold text-green-600">Rs {order.total}</td>
                                                        <td className="py-4 px-6">
                                                            <div
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                                                                style={{
                                                                    background: `${getStatusColor(order.status)}20`,
                                                                    color: getStatusColor(order.status)
                                                                }}
                                                            >
                                                                {getStatusIcon(order.status)}
                                                                <span className="text-xs font-bold capitalize">{order.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex gap-2">
                                                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleMoveToNextStep(order.id, order.status);
                                                                        }}
                                                                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-all"
                                                                        title="Move to Next Step"
                                                                    >
                                                                        <ArrowDown className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedOrder(order);
                                                                    }}
                                                                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (() => {
                        const ordersToUse = localOrders.length > 0 ? localOrders : orders;
                        const filteredOrders = filterOrders(ordersToUse);

                        if (filteredOrders.length === 0) {
                            return (
                                <div
                                    className="text-center py-20 rounded-3xl backdrop-blur-xl"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.6)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBag className="w-10 h-10 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {orderSearchQuery ? 'No Orders Found' : 'No Orders Yet'}
                                    </h3>
                                    <p className="text-gray-500">
                                        {orderSearchQuery
                                            ? 'Try adjusting your search terms'
                                            : 'Orders placed by customers will appear here.'}
                                    </p>
                                </div>
                            );
                        }

                        const getFilteredOrdersByStatus = (status: string) => {
                            return filteredOrders.filter(order => {
                                if (status === 'pending') return order.status === 'pending';
                                if (status === 'confirmed') return order.status === 'confirmed';
                                if (status === 'preparing') return order.status === 'preparing';
                                if (status === 'ready') return order.status === 'ready';
                                if (status === 'out-for-delivery') return order.status === 'out-for-delivery' || order.status === 'delivering';
                                if (status === 'delivered') return order.status === 'delivered' || order.status === 'completed';
                                return false;
                            });
                        };

                        return (
                            <div className="flex gap-4 min-w-max pb-4">
                                {pipelineStages.map((stage) => {
                                    const stageOrders = getFilteredOrdersByStatus(stage.id);

                                    return (
                                        <motion.div
                                            key={stage.id}
                                            data-stage-id={stage.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex-shrink-0 w-[280px]"
                                        >
                                            {/* Stage Header */}
                                            <div
                                                onClick={() => {
                                                    const stageElement = document.querySelector(`[data-stage-id="${stage.id}"]`);
                                                    if (stageElement) {
                                                        stageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                                    }
                                                }}
                                                className="rounded-2xl p-4 mb-3 backdrop-blur-xl cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
                                                style={{
                                                    background: stage.bgColor,
                                                    border: `2px solid ${stage.color}30`,
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                            style={{
                                                                background: stage.color,
                                                                color: 'white'
                                                            }}
                                                        >
                                                            {stage.icon}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-gray-900">{stage.label}</h3>
                                                            <p className="text-xs text-gray-500">{stageOrders.length} orders</p>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="px-3 py-1 rounded-full font-black text-sm"
                                                        style={{
                                                            background: stage.color,
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {stageOrders.length}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Orders in Stage */}
                                            <div className="space-y-3 min-h-[200px]">
                                                {stageOrders.map((order) => (
                                                    <motion.div
                                                        layoutId={order.id}
                                                        key={order.id}
                                                        onClick={() => setSelectedOrder(order)}
                                                        whileHover={{ scale: 1.02, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden group ${selectedOrder?.id === order.id ? 'ring-2 ring-orange-500 shadow-xl' : 'shadow-sm hover:shadow-md'
                                                            }`}
                                                        style={{
                                                            background: 'rgba(255, 255, 255, 0.9)',
                                                            border: '1px solid rgba(255, 255, 255, 0.8)',
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <span className="font-black text-gray-900 text-lg block">{order.orderNumber}</span>
                                                                <span className="text-xs text-gray-500">{order.time}</span>
                                                            </div>
                                                            <div className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs">
                                                                Rs {order.total}
                                                            </div>
                                                        </div>

                                                        <div className="mb-3">
                                                            <p className="font-bold text-gray-800 text-sm line-clamp-1">{order.customerName || order.customer}</p>
                                                            <p className="text-xs text-gray-500">{order.items && Array.isArray(order.items) ? order.items.length : order.items} items</p>
                                                        </div>

                                                        {/* Quick Actions */}
                                                        <div className="flex gap-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMoveToNextStep(order.id, order.status);
                                                                    }}
                                                                    className="flex-1 py-1.5 rounded-lg bg-green-100 text-green-700 font-bold text-xs hover:bg-green-200"
                                                                >
                                                                    Next Step
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedOrder(order);
                                                                }}
                                                                className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs hover:bg-blue-200"
                                                            >
                                                                View
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Side Panel - Order Details */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-24 bottom-6 right-6 w-[380px] rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden z-20 flex flex-col"
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                        }}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 bg-white/50">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">{selectedOrder.orderNumber}</h3>
                                    <p className="text-gray-500 text-sm">{selectedOrder.date} at {selectedOrder.time}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Status Badge */}
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl w-full justify-center font-bold"
                                style={{
                                    background: `${getStatusColor(selectedOrder.status)}15`,
                                    color: getStatusColor(selectedOrder.status)
                                }}
                            >
                                {getStatusIcon(selectedOrder.status)}
                                <span className="capitalize">{selectedOrder.status}</span>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Customer Info */}
                            <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    Customer Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Name</span>
                                        <span className="font-bold text-gray-900 text-right">{selectedOrder.customerName || selectedOrder.customer}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Phone</span>
                                        <span className="font-bold text-gray-900">{selectedOrder.customerPhone}</span>
                                    </div>
                                    {selectedOrder.deliveryAddress && (
                                        <div className="pt-2 border-t border-gray-200 mt-2">
                                            <span className="text-gray-500 block mb-1">Delivery Address</span>
                                            <p className="font-medium text-gray-900 text-xs leading-relaxed">
                                                {selectedOrder.deliveryAddress}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-gray-500" />
                                    Items ({selectedOrder.items && Array.isArray(selectedOrder.items) ? selectedOrder.items.length : selectedOrder.items})
                                </h4>
                                <div className="space-y-3">
                                    {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
                                        selectedOrder.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.quantity} x Rs {item.price}</p>
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm">Rs {item.price * item.quantity}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">Items details unavailable</p>
                                    )}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-orange-50 p-4 rounded-2xl space-y-3">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-orange-500" />
                                    Payment Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-bold text-gray-900">Rs {selectedOrder.subtotal || selectedOrder.total}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <span className="font-bold text-gray-900">Rs {selectedOrder.deliveryFee || 0}</span>
                                    </div>
                                    <div className="pt-2 border-t border-orange-200 mt-2 flex justify-between items-center">
                                        <span className="font-black text-gray-900">Total Amount</span>
                                        <span className="font-black text-orange-600 text-lg">Rs {selectedOrder.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-md grid grid-cols-2 gap-3">
                            {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                                <button
                                    onClick={() => handleMoveToNextStep(selectedOrder.id, selectedOrder.status)}
                                    className="col-span-2 py-3 rounded-xl font-black text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Advance Order <ArrowDown className="w-4 h-4" />
                                </button>
                            )}

                            <button className="py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all">
                                Print Receipt
                            </button>
                            <button className="py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all">
                                Cancel Order
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
