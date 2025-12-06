import React, { useState, useRef } from "react";
import { Product } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useAddToCart } from "../hooks/useAddToCart";
import { useCart } from "../context/CartContext";

interface NewProductCardProps {
  product: Product;
  onClick?: () => void;
  isPopular?: boolean;
}

export const NewProductCard = ({ product, onClick, isPopular }: NewProductCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { handleAddToCart } = useAddToCart("playful", "bounce");
  const { cartItems, updateQuantity } = useCart();
  const productImageRef = useRef<HTMLDivElement>(null);

  // Check if product is in cart
  const hasSizes = product.sizes && product.sizes.length > 0;
  const cartItem = !hasSizes ? cartItems.find(item => item.id === product.id) : undefined;
  const quantity = cartItem?.quantity || 0;

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If product has sizes, open detail view instead of adding directly
    if (hasSizes) {
      if (onClick) onClick();
      return;
    }

    setIsAnimating(true);
    
    setTimeout(() => {
      handleAddToCart(product, productImageRef.current);
      setIsAnimating(false);
    }, 300);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      // Remove from cart
      updateQuantity(product.id, 0);
    }
  };

  const originalPrice = Math.round(product.price * 1.3);

  return (
    <motion.div
      onClick={onClick}
      className="relative cursor-pointer rounded-2xl overflow-hidden w-full"
      style={{
        background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D4BA 100%)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Image Section */}
      <div 
        ref={productImageRef}
        className="relative w-full rounded-2xl overflow-hidden m-2 mb-2"
        style={{ 
          height: "140px",
          background: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
        }}
      >
        {/* Popular Badge */}
        {isPopular && (
          <div 
            className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm"
            style={{
              background: 'rgba(60, 60, 60, 0.85)',
            }}
          >
            <span className="text-sm">🔥</span>
            <span className="text-white text-xs font-medium">Popular</span>
          </div>
        )}

        {/* Product Image */}
        <motion.div
          className="w-full h-full"
          animate={{ 
            scale: isAnimating ? [1, 0.9, 1.1, 1] : 1
          }}
          transition={{ duration: 0.3 }}
        >
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="px-3 pb-3 space-y-2">
        {/* Product Name */}
        <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2">
          {product.name} 🔥
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <span className="text-sm">⭐</span>
          <span className="text-xs font-bold text-gray-800">4.9</span>
          <span className="text-sm">⭐</span>
          <span className="text-xs text-gray-500 font-medium">(120)</span>
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-2">
          <p 
            className="text-lg font-bold"
            style={{ color: '#8B4513' }}
          >
            {hasSizes && <span className="text-xs font-normal text-gray-500 mr-1">From</span>}
            Rs. {Math.round(product.price)}
          </p>
          <p className="text-xs text-gray-400 line-through font-medium">
            Rs. {originalPrice}
          </p>
        </div>

        {/* Add to Cart Button / Quantity Selector */}
        <AnimatePresence mode="wait">
          {quantity === 0 ? (
            // Add to Cart Button
            <motion.button
              key="add-button"
              onClick={handleAddToCartClick}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2 rounded-xl flex items-center justify-center gap-2 shadow-md mt-2"
              style={{
                background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
              }}
            >
              <span className="text-sm font-bold text-white">{hasSizes ? "Select Size" : "Add to Cart"}</span>
              <ShoppingCart className="w-4 h-4 text-white" />
            </motion.button>
          ) : (
            // Quantity Selector
            <motion.div
              key="quantity-selector"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex items-center justify-between gap-2 mt-2 py-1.5 px-2 rounded-xl shadow-md"
              style={{
                background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
              }}
            >
              {/* Minus Button */}
              <motion.button
                onClick={handleDecrement}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="w-7 h-7 rounded-lg bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white/40"
              >
                <Minus className="w-4 h-4 text-white" strokeWidth={3} />
              </motion.button>

              {/* Quantity Display */}
              <motion.div
                key={quantity}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex-1 text-center"
              >
                <span className="text-base font-bold text-white">{quantity}</span>
              </motion.div>

              {/* Plus Button */}
              <motion.button
                onClick={handleIncrement}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="w-7 h-7 rounded-lg bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white/40"
              >
                <Plus className="w-4 h-4 text-white" strokeWidth={3} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
