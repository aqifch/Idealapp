import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Package, Clock, CheckCircle, XCircle, Truck, MapPin, Star, Phone, MessageCircle, HelpCircle, ChefHat } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { Product, ProductSize } from "../data/mockData";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "out-for-delivery" | "delivered" | "cancelled";
  items: {
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    selectedSize?: ProductSize;
  }[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  rating?: number;
}

interface OrdersViewProps {
  onBack: () => void;
  orders?: any[];
  storeSettings?: any;
}

// Mock orders data (Fallback only)
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "#ORD-9281",
    date: "Nov 25, 2024",
    status: "delivered",
    items: [
      {
        id: "1",
        name: "Chicken Burger",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        quantity: 2,
        price: 350,
      },
      {
        id: "2",
        name: "French Fries",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
        quantity: 1,
        price: 150,
      },
    ],
    subtotal: 850,
    tax: 50,
    deliveryFee: 100,
    total: 1000,
    deliveryAddress: "123 Main St, Karachi",
    rating: 4,
  },
  {
    id: "2",
    orderNumber: "#ORD-3321",
    date: "Today, 2:30 PM",
    status: "processing",
    items: [
      {
        id: "3",
        name: "Pizza Margherita",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
        quantity: 1,
        price: 1200,
      },
    ],
    subtotal: 1200,
    tax: 150,
    deliveryFee: 0,
    total: 1350,
    deliveryAddress: "456 Park Ave, Lahore",
  },
  {
    id: "3",
    orderNumber: "#ORD-1120",
    date: "Nov 23, 2024",
    status: "out-for-delivery",
    items: [
      {
        id: "4",
        name: "Beef Shawarma",
        image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400",
        quantity: 3,
        price: 450,
      },
    ],
    subtotal: 1350,
    tax: 100,
    deliveryFee: 100,
    total: 1550,
    deliveryAddress: "789 Mall Road, Islamabad",
  },
];

// Tracking Steps
const trackingSteps = [
  { status: "pending", level: 0, label: "Order Placed", icon: Clock, description: "We have received your order." },
  { status: "confirmed", level: 1, label: "Order Confirmed", icon: CheckCircle, description: "Restaurant has confirmed your order." },
  { status: "preparing", level: 2, label: "Preparing", icon: ChefHat, description: "Your food is being prepared." },
  { status: "out-for-delivery", level: 4, label: "Out for Delivery", icon: Truck, description: "Rider is on the way." },
  { status: "delivered", level: 5, label: "Delivered", icon: MapPin, description: "Enjoy your meal!" },
];

const getOrderLevel = (status: string) => {
  switch(status) {
    case 'pending': return 0;
    case 'confirmed': return 1;
    case 'processing': 
    case 'preparing': return 2;
    case 'ready': return 3;
    case 'out-for-delivery': return 4;
    case 'delivered': return 5;
    default: return -1;
  }
};

export const OrdersView = ({ onBack, orders = [], storeSettings }: OrdersViewProps) => {
  const { addToCart } = useCart();
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "completed">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);

  // Use real orders if available, otherwise fall back to mock for demo (or just empty)
  // The user specifically asked for real orders, so let's prioritize that.
  // But to keep the UI populated for the demo if they haven't ordered yet, maybe we can keep mock?
  // User said: "order real men create ho order screen men bhi real order hi dikhain"
  // This implies they want to see the REAL order they just created.
  // So I will use `orders` passed from App.tsx.
  const displayOrders = orders.length > 0 ? orders : []; 

  const filteredOrders = selectedTab === "all" 
    ? displayOrders 
    : selectedTab === "active"
    ? displayOrders.filter(o => ["pending", "confirmed", "processing", "preparing", "ready", "out-for-delivery"].includes(o.status))
    : displayOrders.filter(o => ["delivered", "cancelled"].includes(o.status));

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { color: "bg-amber-100 border-amber-200 text-amber-700", icon: Clock, label: "Pending" };
      case "confirmed":
        return { color: "bg-blue-100 border-blue-200 text-blue-700", icon: CheckCircle, label: "Confirmed" };
      case "processing":
      case "preparing":
        return { color: "bg-orange-100 border-orange-200 text-orange-700", icon: ChefHat, label: "Preparing" };
      case "ready":
        return { color: "bg-purple-100 border-purple-200 text-purple-700", icon: Package, label: "Ready for Pickup" };
      case "out-for-delivery":
        return { color: "bg-blue-100 border-blue-200 text-blue-700", icon: Truck, label: "On the Way" };
      case "delivered":
        return { color: "bg-green-100 border-green-200 text-green-700", icon: CheckCircle, label: "Delivered" };
      case "cancelled":
        return { color: "bg-red-100 border-red-200 text-red-700", icon: XCircle, label: "Cancelled" };
      default:
        return { color: "bg-gray-100 border-gray-200 text-gray-700", icon: HelpCircle, label: status || "Unknown" };
    }
  };

  const handleRateOrder = () => {
    toast.success("Thank you for your feedback! ⭐");
    setShowRating(false);
    setRatingValue(0);
  };

  return (
    <div className="min-h-screen pb-24" style={{
      background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 100%)'
    }}>
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-white/60 border-b border-white/60 shadow-sm"
      >
        <div className="px-5 py-4 max-w-4xl lg:mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-black/5 transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
          </div>
          <div className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
            {displayOrders.length} Orders
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="px-5 pb-4 max-w-4xl lg:mx-auto flex gap-2">
          {[
            { id: "all", label: "All Orders" },
            { id: "active", label: "Active" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                selectedTab === tab.id
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Orders List */}
      <div className="px-5 py-6 max-w-6xl lg:mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredOrders.map((order, index) => {
          const status = getStatusConfig(order.status);
          const StatusIcon = status.icon;
          
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedOrder(order)}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/60 shadow-xl shadow-orange-500/5 cursor-pointer active:scale-95 transition-transform"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{order.items[0].name}</h3>
                    <p className="text-xs text-gray-500">{order.items.length > 1 ? `+${order.items.length - 1} more items` : 'Single Item'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">Rs {order.total}</p>
                  <p className="text-xs text-gray-500">{order.date}</p>
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3 mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${status.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </div>
                <p className="text-xs font-bold text-gray-400">{order.orderNumber}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {["pending", "confirmed", "processing", "preparing", "ready", "out-for-delivery"].includes(order.status) ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                      setShowTracking(true);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg shadow-gray-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" /> Track Order
                  </button>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      order.items.forEach((item: any) => {
                         // Create a temporary product object for the cart
                         const productToAdd = {
                           id: item.id,
                           name: item.name,
                           price: item.price,
                           image: item.image,
                           description: "", 
                           category: "Reorder",
                           rating: 5,
                           reviews: 0,
                           isPopular: false,
                           isVegetarian: false,
                           isSpicy: false
                         };
                         // Add item to cart based on quantity
                         for (let i = 0; i < item.quantity; i++) {
                           addToCart(productToAdd as Product, item.selectedSize);
                         }
                      });
                      toast.success("Items added to cart! 🛒");
                    }}
                    className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    Reorder
                  </button>
                )}
                
                {order.status === 'delivered' && !order.rating && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                      setShowRating(true);
                    }}
                    className="px-4 py-3 rounded-xl bg-yellow-100 text-yellow-700 font-bold text-sm hover:bg-yellow-200 transition-all"
                  >
                    Rate
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      </div>

      {/* Order Detail & Tracking Modal */}
      <AnimatePresence>
        {(selectedOrder && !showTracking && !showRating) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] z-50 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 md:hidden" />
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Order Details</h2>
                    <p className="text-gray-500">{selectedOrder.orderNumber}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 border ${getStatusConfig(selectedOrder.status).color}`}>
                    {getStatusConfig(selectedOrder.status).label}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4 mb-8">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
                        <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.selectedSize && <span className="font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded mr-1">{item.selectedSize.name}</span>}
                          Qty: {item.quantity} × Rs {item.price}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">Rs {item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Bill Summary */}
                <div className="bg-gray-50 rounded-3xl p-6 mb-8 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Rs {selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>Rs {selectedOrder.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>Rs {selectedOrder.tax}</span>
                  </div>
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex justify-between font-black text-lg text-gray-900">
                    <span>Total</span>
                    <span>Rs {selectedOrder.total}</span>
                  </div>
                </div>

                {/* Help Button */}
                <button className="w-full py-4 rounded-2xl border border-gray-200 text-gray-600 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 mb-4">
                  <HelpCircle className="w-5 h-5" />
                  Need Help with this Order?
                </button>

                {/* Tracking / Reorder Button */}
                {["pending", "processing", "out-for-delivery"].includes(selectedOrder.status) ? (
                  <button 
                    onClick={() => setShowTracking(true)}
                    className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20"
                  >
                    <MapPin className="w-5 h-5" />
                    Track Order Live
                  </button>
                ) : (
                  <button className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold shadow-xl shadow-orange-500/20">
                    Reorder Everything
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LIVE TRACKING MODAL */}
      <AnimatePresence>
        {(showTracking && selectedOrder) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTracking(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] z-[60] max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6 relative">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 md:hidden" />
                <button 
                  onClick={() => setShowTracking(false)}
                  className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>

                <div className="text-center mb-10 mt-4">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Order Tracking</h2>
                  <p className="text-gray-500">Estimated Delivery: 35-45 mins</p>
                </div>

                {/* Stepper */}
                <div className="relative pl-8 space-y-10 mb-10">
                  {/* Vertical Line */}
                  <div className="absolute left-[19px] top-2 bottom-10 w-1 bg-gray-100" />
                  
                  {trackingSteps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const currentLevel = getOrderLevel(selectedOrder.status);
                    const isCompleted = currentLevel >= step.level;
                    const isCurrent = currentLevel === step.level || (selectedOrder.status === 'processing' && step.status === 'preparing');

                    return (
                      <div key={idx} className="relative flex items-start gap-6">
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all ${
                          isCompleted ? 'bg-green-500 border-green-100' : 'bg-white border-gray-100'
                        }`}>
                          <StepIcon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className={`${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                          <h4 className="font-bold text-lg text-gray-900">{step.label}</h4>
                          <p className="text-sm text-gray-500">{step.description}</p>
                          {isCurrent && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg inline-block"
                            >
                              Happening Now
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Driver Info (Mock) */}
                {selectedOrder.status === 'out-for-delivery' && (
                  <div className="bg-gray-50 rounded-3xl p-5 flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden">
                      <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Rider" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">Ali Raza</h4>
                      <p className="text-xs text-gray-500">Your Delivery Partner</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30">
                        <Phone className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RATING MODAL */}
      <AnimatePresence>
        {showRating && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRating(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-3xl p-8 z-[70] text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-yellow-500 fill-yellow-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Rate your Meal</h3>
              <p className="text-gray-500 mb-8">How was your experience with {storeSettings?.storeName || "Ideal Point"}?</p>
              
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingValue(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star 
                      className={`w-10 h-10 ${star <= ratingValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} 
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={handleRateOrder}
                disabled={ratingValue === 0}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                  ratingValue > 0 ? 'bg-gray-900 shadow-xl shadow-gray-900/20' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Submit Review
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
