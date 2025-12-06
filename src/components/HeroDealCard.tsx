import React from "react";
import { motion } from "motion/react";
import { Star, Clock, Zap } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Deal {
  id: string;
  name: string;
  description: string;
  image: string;
  originalPrice: number;
  dealPrice: number;
  discount: number;
  rating: number;
  category: string;
  soldCount?: number;
  stockLeft?: number;
}

interface HeroDealCardProps {
  deal: Deal;
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  onClick: () => void;
  onViewAll?: () => void;
}

export const HeroDealCard = ({ deal, timeLeft, onClick, onViewAll }: HeroDealCardProps) => {
  const isLowStock = deal.stockLeft && deal.stockLeft < 10;

  // Format time with leading zeros
  const formatTime = (num: number) => num.toString().padStart(2, "0");

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative bg-white rounded-3xl shadow-2xl overflow-hidden mx-4 md:mx-auto md:max-w-[340px] cursor-pointer"
      onClick={onClick}
    >
      {/* Timer Banner - Orange */}
      <div className="bg-[#FF8500] text-white py-3 px-4 flex items-center justify-center gap-2.5">
        <Clock className="w-5 h-5" />
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm uppercase tracking-wide">FLASH DEAL ENDS IN:</span>
          {/* Time Display with White Background */}
          <div className="bg-white rounded-lg px-3 py-1.5 shadow-md">
            <div className="flex items-center gap-1.5 font-mono font-black text-base tabular-nums text-[#FF8500]">
              <span>{formatTime(timeLeft.hours)}</span>
              <span>:</span>
              <span>{formatTime(timeLeft.minutes)}</span>
              <span>:</span>
              <span>{formatTime(timeLeft.seconds)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE SECTION - Dark background, HUGE image */}
      <div className="relative w-full h-[230px] bg-gradient-to-b from-gray-800 via-gray-900 to-black overflow-hidden">
        
        {/* Product Image - FULL SIZE */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
        >
          <ImageWithFallback
            src={deal.image}
            alt={deal.name}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Discount Badge - Ribbon Style, Top Left */}
        <div className="absolute top-4 left-0 z-30">
          <motion.div 
            initial={{ x: -100, rotate: -5 }}
            animate={{ x: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative"
          >
            {/* Main Badge */}
            <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white pl-4 pr-5 py-2 shadow-2xl relative">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-white drop-shadow-md" />
                <span className="text-xl font-black drop-shadow-md tracking-tight">-{deal.discount}%</span>
              </div>
              
              {/* 3D Bottom Shadow Effect */}
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-b from-orange-600/50 to-transparent rounded-b"></div>
              
              {/* Top shine effect */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-white/30 to-transparent"></div>
              
              {/* Right Triangle */}
              <div className="absolute top-0 right-0 translate-x-full">
                <div className="w-0 h-0 border-t-[19px] border-t-transparent border-l-[10px] border-l-orange-500 border-b-[19px] border-b-transparent"></div>
              </div>
            </div>

            {/* Bottom fold shadow */}
            <div className="absolute -bottom-1.5 left-2 right-2 h-1.5 bg-black/20 blur-sm rounded-full"></div>
          </motion.div>
        </div>

        {/* Stock Warning Banner - Bottom Red Bar */}
        {isLowStock && (
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            className="absolute bottom-0 left-0 right-0 bg-[#DC2626] text-white py-2.5 flex items-center justify-center gap-2 z-30"
          >
            <span className="font-black text-sm uppercase tracking-wide">
              ONLY {deal.stockLeft} LEFT! ⚡
            </span>
          </motion.div>
        )}
      </div>

      {/* CONTENT SECTION - White background */}
      <div className="p-5 bg-white">
        
        {/* Title */}
        <h3 className="text-2xl font-black text-gray-900 mb-1.5 leading-tight">
          {deal.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 leading-snug">
          {deal.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          <Star className="w-4 h-4 text-green-600 fill-green-600" />
          <span className="text-base font-bold text-gray-900">{deal.rating}</span>
        </div>

        {/* Pricing Box - Beige background */}
        <div className="bg-[#FEF3E2] rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            {/* Prices */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl font-black text-gray-900">
                Rs {deal.dealPrice}
              </span>
              <span className="text-lg text-gray-500 line-through">
                Rs {deal.originalPrice}
              </span>
            </div>

            {/* Save Badge - Green */}
            <div className="bg-green-500 text-white px-3 py-2 rounded-lg">
              <p className="text-[10px] font-bold uppercase leading-none mb-0.5">SAVE</p>
              <p className="text-base font-black leading-none">Rs {deal.originalPrice - deal.dealPrice}</p>
            </div>
          </div>
        </div>

        {/* CTA Button - Orange */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#FF8500] hover:bg-[#FF9500] text-white font-black text-base py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Zap className="w-5 h-5 fill-white" />
          <span>GRAB NOW!</span>
        </motion.button>
      </div>
    </motion.div>
  );
};