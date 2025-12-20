import React, { useState, useRef } from "react";
import { Product } from "../../data/mockData";
import { ImageWithFallback } from "../common/figma/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Plus, Minus, Heart } from "lucide-react";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useCart } from "../../context/CartContext";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  isPopular?: boolean;
  isInWishlist?: boolean;
  onAddToWishlist?: (product: Product) => void;
}

export const ProductCard = ({ product, onClick, isPopular, isInWishlist = false, onAddToWishlist }: ProductCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { handleAddToCart } = useAddToCart("playful", "bounce");
  const { cartItems, updateQuantity } = useCart();
  const productImageRef = useRef<HTMLDivElement>(null);

  // Check if product is in cart
  const cartItem = cartItems.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const hasSizes = product.sizes && product.sizes.length > 0;

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
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
      className="relative cursor-pointer rounded-2xl overflow-hidden w-full backdrop-blur-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Image Section */}
      <div 
        ref={productImageRef}
        className="relative w-full h-[140px] bg-gray-100"
      >
        {/* Wishlist Heart Icon */}
        {onAddToWishlist && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist(product);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}
          >
            <Heart 
              className={`w-4 h-4 transition-all ${
                isInWishlist 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-600'
              }`}
            />
          </motion.button>
        )}

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
      <div className="px-2.5 pb-2.5 space-y-1.5">
        {/* Product Name */}
        <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">
          {product.name} 🔥
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <span className="text-xs">⭐</span>
          <span className="text-xs font-bold text-gray-800">4.9</span>
          <span className="text-xs">⭐</span>
          <span className="text-xs text-gray-500 font-medium">(120)</span>
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-1.5">
          <p 
            className="text-base font-bold"
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 rounded-xl flex items-center justify-center gap-1.5 backdrop-blur-md mt-2"
              style={{
                background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                boxShadow: '0 4px 12px rgba(255, 159, 64, 0.3)',
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
              className="w-full flex items-center justify-between gap-2 mt-2 py-1.5 px-2 rounded-xl backdrop-blur-md"
              style={{
                background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                boxShadow: '0 4px 12px rgba(255, 159, 64, 0.3)',
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
