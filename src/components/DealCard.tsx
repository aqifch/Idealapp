import React from "react";
import { motion } from "motion/react";
import { Star, TrendingUp, Package } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Deal {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  dealPrice: number;
  discount: number;
  rating: number;
  category: string;
  soldCount?: number;
  stockLeft?: number;
}

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
  urgencyLevel?: string;
}

export const DealCard = ({ deal, onClick, urgencyLevel = "text-orange-500" }: DealCardProps) => {
  const isLowStock = deal.stockLeft && deal.stockLeft < 10;
  const isHotDeal = deal.soldCount && deal.soldCount > 150;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="w-[160px] bg-white rounded-2xl hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden relative border border-gray-100"
      style={{
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Discount Badge - Corner Ribbon */}
      <div className="absolute top-0 right-0 z-20">
        <div className="relative">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="bg-gradient-to-br from-red-500 to-red-600 text-white px-3 py-1.5 rounded-bl-2xl rounded-tr-2xl shadow-lg"
          >
            <p className="text-xs font-black leading-none">-{deal.discount}%</p>
            <p className="text-[10px] font-bold">OFF</p>
          </motion.div>
          {/* Triangle decoration */}
          <div className="absolute -bottom-1 right-0 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-red-700 border-t-[8px] border-t-red-700"></div>
        </div>
      </div>

      {/* Hot Deal Badge */}
      {isHotDeal && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 left-2 z-20 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-md"
        >
          <TrendingUp className="w-3 h-3" />
          <span className="text-[10px] font-bold">HOT</span>
        </motion.div>
      )}

      {/* Product Image */}
      <div className="relative h-32 bg-gradient-to-br from-orange-50 to-yellow-50 p-3">
        <div className="w-full h-full rounded-xl overflow-hidden shadow-lg">
          <ImageWithFallback
            src={deal.image}
            alt={deal.name}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Category */}
        <p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold mb-1">
          {deal.category}
        </p>

        {/* Product Name */}
        <h3 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 h-10">
          {deal.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-xs text-gray-900">{deal.rating}</span>
          {deal.soldCount && (
            <span className="text-[10px] text-gray-500">({deal.soldCount})</span>
          )}
        </div>

        {/* Prices */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="font-bold text-orange-500 text-lg">Rs {deal.dealPrice}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 line-through">Rs {deal.originalPrice}</span>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              Save Rs {deal.originalPrice - deal.dealPrice}
            </span>
          </div>
        </div>

        {/* Stock Warning */}
        {isLowStock && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1.5 rounded-lg mb-3"
          >
            <Package className="w-3 h-3" />
            <span className="text-[10px] font-bold">Only {deal.stockLeft} left!</span>
          </motion.div>
        )}

        {/* Grab Deal Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all ${
            isLowStock ? "animate-pulse" : ""
          }`}
        >
          {isLowStock ? "🔥 Grab Now!" : "Claim Deal"}
        </motion.button>
      </div>

      {/* Shine Effect on Hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
        whileHover={{
          translateX: "200%",
          transition: { duration: 0.6 },
        }}
      />
    </motion.div>
  );
};