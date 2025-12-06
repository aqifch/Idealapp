import React from "react";
import { motion } from "motion/react";
import { Check, Home, Package, Clock } from "lucide-react";

interface OrderSuccessViewProps {
  onContinueShopping: () => void;
  latestOrder?: any;
  onTrackOrder?: () => void;
}

export const OrderSuccessView = ({ onContinueShopping, latestOrder, onTrackOrder }: OrderSuccessViewProps) => {
  const orderNumber = latestOrder?.orderNumber || "#398207";
  const estimatedTime = "25-30 minutes";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Orange Header */}
      <div className="bg-[#FF8800] px-5 py-6 rounded-b-[3rem] shadow-lg relative z-10">
        <div className="flex items-center justify-center mt-4 mb-2">
          <h1 className="text-2xl font-black text-white tracking-wide">Order Confirmed</h1>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 flex flex-col items-center px-6 pt-10 pb-10 max-w-lg mx-auto w-full">
        
        {/* Green Success Circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
          className="mb-6 relative"
        >
          {/* Outer Glow */}
          <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl transform scale-110" />
          
          {/* White Border Ring */}
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.1)] p-2">
            {/* Green Circle */}
            <div className="w-full h-full bg-[#00C853] rounded-full flex items-center justify-center">
              <Check className="w-16 h-16 text-white stroke-[3px]" />
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-black text-[#0F172A] mb-3 leading-tight">
            Order Placed<br />Successfully!
          </h2>
          <p className="text-gray-500 leading-relaxed px-4">
            Your delicious food is being prepared and will be delivered soon!
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-white rounded-[2rem] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-gray-100 mb-8 space-y-5"
        >
          {/* Order Number */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-500 text-sm font-medium mb-0.5">Order Number</p>
              <p className="text-xl font-black text-gray-900">{orderNumber}</p>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-500 text-sm font-medium mb-0.5">Estimated Delivery</p>
              <p className="text-xl font-black text-gray-900">{estimatedTime}</p>
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full space-y-4 mt-auto"
        >
          <button
            onClick={onContinueShopping}
            className="w-full py-4 bg-[#FF8800] text-white rounded-full font-black text-lg shadow-[0_8px_20px_rgba(255,136,0,0.3)] hover:bg-[#FF7700] transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>

          <button
            onClick={onTrackOrder}
            className="w-full py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-full font-black text-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            Track Order
          </button>
        </motion.div>

      </div>
    </div>
  );
};
