import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Package, Clock, CheckCircle, Truck, XCircle, ChevronRight } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface OrdersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "preparing" | "on-the-way" | "delivered" | "cancelled";
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  deliveryAddress: string;
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "#1234",
    date: "Today, 2:30 PM",
    status: "on-the-way",
    items: [
      { name: "Beef Burger", quantity: 2, price: 599 },
      { name: "French Fries", quantity: 1, price: 299 },
    ],
    total: 1497,
    deliveryAddress: "123 Main Street, Karachi",
  },
  {
    id: "2",
    orderNumber: "#1233",
    date: "Yesterday, 6:45 PM",
    status: "delivered",
    items: [
      { name: "Chicken Pizza", quantity: 1, price: 1299 },
      { name: "Cold Drink", quantity: 2, price: 199 },
    ],
    total: 1697,
    deliveryAddress: "123 Main Street, Karachi",
  },
  {
    id: "3",
    orderNumber: "#1232",
    date: "2 days ago",
    status: "delivered",
    items: [
      { name: "Zinger Burger", quantity: 3, price: 699 },
      { name: "Chicken Wings", quantity: 1, price: 799 },
    ],
    total: 2896,
    deliveryAddress: "456 Business Plaza, Karachi",
  },
  {
    id: "4",
    orderNumber: "#1231",
    date: "5 days ago",
    status: "delivered",
    items: [
      { name: "Grilled Chicken", quantity: 1, price: 899 },
      { name: "Garlic Bread", quantity: 1, price: 399 },
    ],
    total: 1298,
    deliveryAddress: "123 Main Street, Karachi",
  },
  {
    id: "5",
    orderNumber: "#1230",
    date: "1 week ago",
    status: "cancelled",
    items: [
      { name: "Beef Burger", quantity: 1, price: 599 },
    ],
    total: 599,
    deliveryAddress: "123 Main Street, Karachi",
  },
];

const getStatusConfig = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return {
        icon: Clock,
        label: "Order Pending",
        color: "text-yellow-600 bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    case "preparing":
      return {
        icon: Package,
        label: "Preparing",
        color: "text-orange-600 bg-orange-50",
        borderColor: "border-orange-200",
      };
    case "on-the-way":
      return {
        icon: Truck,
        label: "On the Way",
        color: "text-amber-600 bg-amber-50",
        borderColor: "border-amber-200",
      };
    case "delivered":
      return {
        icon: CheckCircle,
        label: "Delivered",
        color: "text-green-600 bg-green-50",
        borderColor: "border-green-200",
      };
    case "cancelled":
      return {
        icon: XCircle,
        label: "Cancelled",
        color: "text-red-600 bg-red-50",
        borderColor: "border-red-200",
      };
  }
};

export const OrdersSidebar = ({ isOpen, onClose }: OrdersSidebarProps) => {
  const [orders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  const handleReorder = (order: Order) => {
    toast.success(`Reordering ${order.orderNumber}! 🛒`);
    onClose();
  };

  const handleTrackOrder = (order: Order) => {
    toast.info(`Tracking order ${order.orderNumber}! 📍`);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />
      )}

      {/* Sidebar Panel */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">My Orders</h2>
              <p className="text-xs text-white/80">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </p>
            </div>
          </div>
          <motion.button
            onClick={selectedOrder ? handleBackToList : onClose}
            whileHover={{ scale: 1.1, rotate: selectedOrder ? 0 : 90 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
          >
            {selectedOrder ? (
              <ChevronRight className="w-6 h-6 text-white rotate-180" />
            ) : (
              <X className="w-6 h-6 text-white" />
            )}
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedOrder ? (
            /* Orders List */
            orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full px-6 text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mb-6">
                  <Package className="w-12 h-12 text-orange-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  No Orders Yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-xs">
                  Start ordering your favorite food and see your orders here
                </p>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg"
                >
                  Start Ordering
                </motion.button>
              </motion.div>
            ) : (
              <div className="p-4 space-y-3">
                {orders.map((order, index) => {
                  const statusConfig = getStatusConfig(order.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleOrderClick(order)}
                      className={`bg-white border-2 ${statusConfig.borderColor} rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer`}
                    >
                      {/* Order Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-black text-gray-900 mb-1">
                            Order {order.orderNumber}
                          </h3>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                        <div className={`px-3 py-1.5 ${statusConfig.color} rounded-xl flex items-center gap-1.5 font-bold text-xs`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig.label}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-sm text-gray-600 mb-1">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-gray-400 mt-1">
                            +{order.items.length - 2} more items
                          </p>
                        )}
                      </div>

                      {/* Order Total */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Total Amount</span>
                        <span className="text-lg font-black text-orange-500">
                          Rs {order.total}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )
          ) : (
            /* Order Details */
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6"
            >
              {/* Status Section */}
              <div className="mb-6">
                {(() => {
                  const statusConfig = getStatusConfig(selectedOrder.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div className={`${statusConfig.color} rounded-2xl p-6 text-center border-2 ${statusConfig.borderColor}`}>
                      <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-3">
                        <StatusIcon className="w-8 h-8" />
                      </div>
                      <h3 className="font-black mb-1">{statusConfig.label}</h3>
                      <p className="text-xs opacity-80">Order {selectedOrder.orderNumber}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Order Info */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">Order Number</span>
                  <span className="text-sm font-black text-gray-900">{selectedOrder.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Order Date</span>
                  <span className="text-sm font-black text-gray-900">{selectedOrder.date}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-black text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="bg-white border-2 border-gray-100 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-black text-orange-500">Rs {item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <h4 className="font-black text-gray-900 mb-2">Delivery Address</h4>
                <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress}</p>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Total Amount</span>
                  <span className="text-2xl font-black text-white">Rs {selectedOrder.total}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                  <motion.button
                    onClick={() => handleTrackOrder(selectedOrder)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Truck className="w-5 h-5" />
                    Track Order
                  </motion.button>
                )}
                <motion.button
                  onClick={() => handleReorder(selectedOrder)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white border-2 border-orange-300 hover:bg-orange-50 text-orange-600 font-bold py-4 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Reorder
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
};
