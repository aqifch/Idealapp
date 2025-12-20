import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, Minus, Plus, ShoppingCart, Ticket, Package, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { ImageWithFallback } from "../common/figma/ImageWithFallback";
import { toast } from "sonner";
import { Deal } from "../../data/mockData";

interface CartViewProps {
  onCheckout?: () => void;
  onContinueShopping?: () => void;
  deals?: Deal[];
  deliveryFee?: number;
}

export const CartView = ({ onCheckout, onContinueShopping, deals = [], deliveryFee = 0 }: CartViewProps) => {
  const { cartItems, removeFromCart, updateQuantity, getTotalItems, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedDeal, setAppliedDeal] = useState<Deal | null>(null);

  const handleRemove = (item: any) => {
    removeFromCart(item.cartId);
    toast.success(`${item.name} removed from cart`);
  };

  // Calculate Subtotal locally to ensure accuracy (avoiding the context multiplier if it exists)
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Calculate Discount
  const discountAmount = appliedDeal 
    ? (appliedDeal.discountPercentage 
        ? (subtotal * (appliedDeal.discountPercentage / 100)) 
        : 0) 
    : 0;

  const total = subtotal - discountAmount + deliveryFee;

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    // Find matching deal
    const deal = deals.find(d => d.couponCode?.toLowerCase() === promoCode.toLowerCase() && d.isActive);

    if (deal) {
      setAppliedDeal(deal);
      toast.success(`Promo code applied! ${deal.discountPercentage}% OFF`);
    } else {
      toast.error("Invalid or expired promo code");
      setAppliedDeal(null);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF8F0]" style={{
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8CC 100%)'
      }}>
        {/* Header */}
        <div className="p-6">
          <button 
            onClick={onContinueShopping}
            className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-40 h-40 rounded-full bg-orange-100 flex items-center justify-center mb-8"
          >
            <ShoppingCart className="w-20 h-20 text-orange-500" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Your Cart is Empty</h2>
          <p className="text-gray-500 text-center mb-8">Looks like you haven't added anything to your cart yet.</p>
          
          <button
            onClick={onContinueShopping}
            className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-bold shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]" style={{
      background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8CC 100%)'
    }}>
      {/* Header */}
      <div className="p-6 sticky top-0 z-10 backdrop-blur-md bg-white/30">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <button 
            onClick={onContinueShopping}
            className="w-10 h-10 rounded-xl bg-white/80 shadow-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">My Cart</h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <div className="max-w-2xl mx-auto w-full space-y-4">
          <AnimatePresence mode="popLayout">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.cartId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex items-center gap-4 p-4 bg-white rounded-3xl shadow-sm border border-orange-50"
              >
                {/* Image */}
                <div className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                    {item.selectedSize && (
                      <div className="flex mt-0.5">
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                          Size: {item.selectedSize.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-orange-500 font-bold">Rs {item.price.toFixed(2)}</span>
                    {item.originalPrice && (
                      <span className="text-gray-400 text-xs line-through">Rs {item.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-4 text-center font-bold text-gray-900">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                  <button 
                    onClick={() => handleRemove(item)}
                    className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors ml-1"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Promo Code Input */}
          <div className="bg-white rounded-2xl p-2 pl-4 shadow-sm border border-orange-50 flex items-center gap-2 mt-6">
            <Ticket className="w-5 h-5 text-orange-500" />
            <input
              type="text"
              placeholder="Enter Promo Code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 py-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
            />
            <button 
              onClick={handleApplyPromo}
              className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20"
            >
              Apply
            </button>
          </div>
          {appliedDeal && (
             <div className="flex justify-between items-center bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-100 text-sm font-bold">
               <span>Promo applied: {appliedDeal.couponCode}</span>
               <button onClick={() => { setAppliedDeal(null); toast.info("Promo code removed"); }} className="text-green-800 hover:underline">Remove</button>
             </div>
          )}

          {/* Bill Summary */}
          <div className="bg-[#FFF5E6] rounded-3xl p-6 mt-6 space-y-3 border border-orange-100/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Bill Summary</h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">Rs {subtotal.toFixed(2)}</span>
              </div>
              
              {appliedDeal && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({appliedDeal.discountPercentage}%)</span>
                  <span>- Rs {discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium">Rs {deliveryFee.toFixed(2)}</span>
              </div>

              <div className="h-px bg-orange-200/50 my-2" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 text-lg">Total Amount</span>
                <span className="font-black text-xl text-orange-600">
                  Rs {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto w-full">
          <button
            onClick={onCheckout}
            className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-lg shadow-xl shadow-gray-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Checkout
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
