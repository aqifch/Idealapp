import React, { useState, useRef } from "react";
import { ArrowLeft, Star, Heart, Plus, Minus, Clock, Flame, Users, ShoppingCart, X } from "lucide-react";
import { Product, ProductSize } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useAddToCart } from "../hooks/useAddToCart";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

// Sample customization options
const customizationOptions = [
  { id: 1, name: "Extra Cheese", icon: "🧀", price: 50 },
  { id: 2, name: "Extra Sauce", icon: "🍅", price: 30 },
  { id: 3, name: "Spicy", icon: "🌶️", price: 0 },
  { id: 4, name: "Extra Veg", icon: "🥗", price: 40 },
];

export const ProductDetailModal = ({ product, isOpen, onClose }: ProductDetailModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(product?.isFavorite || false);
  const [selectedCustomizations, setSelectedCustomizations] = useState<number[]>([]);
  const { handleAddToCart } = useAddToCart();
  const { cartItems } = useCart();
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);

  // Reset state when product opens
  React.useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setSelectedCustomizations([]);
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize(null);
      }
    }
  }, [isOpen, product]);

  if (!product) return null;

  // Check if product already in cart
  const cartItem = cartItems.find(item => item.id === product.id);
  const cartQuantity = cartItem?.quantity || 0;

  const handleAddToCartClick = () => {
    const productToAdd = selectedSize ? {
        ...product,
        id: `${product.id}-${selectedSize.name}`,
        name: `${product.name} (${selectedSize.name})`,
        price: selectedSize.price,
    } : product;

    // Add item quantity times
    for (let i = 0; i < quantity; i++) {
      const imageElement = document.querySelector('.product-detail-image') as HTMLElement;
      if (imageElement) {
        handleAddToCart(productToAdd, imageElement);
      }
    }
    
    // Close modal after short delay
    setTimeout(() => {
      onClose();
      setQuantity(1);
      setSelectedCustomizations([]);
    }, 600);
  };

  const toggleCustomization = (id: number) => {
    setSelectedCustomizations(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const customizationPrice = selectedCustomizations.reduce((total, id) => {
    const option = customizationOptions.find(opt => opt.id === id);
    return total + (option?.price || 0);
  }, 0);

  const basePrice = selectedSize ? selectedSize.price : product.price;
  const storedOriginalPrice = selectedSize ? selectedSize.originalPrice : product.originalPrice;
  const originalPrice = storedOriginalPrice || Math.round(basePrice * 1.3);
  const totalPrice = Math.round((basePrice + customizationPrice) * quantity);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90%] md:max-w-2xl md:max-h-[85vh] z-50 overflow-hidden flex flex-col md:rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {/* Hero Section with Image */}
              <div className="relative h-[280px] md:h-[320px] overflow-hidden">
                {/* Product Image */}
                <motion.div
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
                  }}
                >
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover product-detail-image"
                  />
                  
                  {/* Gradient Overlay */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%)',
                    }}
                  />
                </motion.div>

                {/* Top Bar - Floating */}
                <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setIsFavorite(!isFavorite);
                      toast.success(isFavorite ? "Removed from wishlist ❤️" : "Added to wishlist ❤️");
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        isFavorite ? "text-red-500 fill-red-500" : "text-white"
                      }`}
                    />
                  </motion.button>
                </div>

                {/* Product Name & Rating - Floating at bottom */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-0 left-0 right-0 z-20 p-4"
                >
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex-1">
                      <h2 className="font-black text-white text-xl mb-1 drop-shadow-lg">
                        {product.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-xl"
                          style={{
                            background: 'rgba(255, 255, 255, 0.25)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                          }}
                        >
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-bold text-white">{product.rating}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-xl"
                          style={{
                            background: 'rgba(255, 255, 255, 0.25)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                          }}
                        >
                          <Clock className="w-3.5 h-3.5 text-white" />
                          <span className="text-xs font-bold text-white">5-10 Min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Details Section */}
              <div className="p-4 space-y-4">
                {/* Price Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-black text-gray-900 text-2xl">Rs. {basePrice}</span>
                    {originalPrice > basePrice && (
                      <span className="text-base text-gray-400 line-through">Rs. {originalPrice}</span>
                    )}
                  </div>
                  {product.discount && (
                    <div className="px-3 py-1 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                      <span className="text-sm font-bold text-green-700">{product.discount}% OFF</span>
                    </div>
                  )}
                </motion.div>

                {/* Product Description */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-bold text-gray-900 mb-2">About this item</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description || "Fresh ingredients and authentic flavors come together in this delicious dish. Crafted with care and served hot. Perfect for any meal of the day. Experience the taste of quality and tradition in every bite."}
                  </p>
                </motion.div>

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.42 }}
                    className="space-y-2"
                  >
                    <h3 className="font-bold text-gray-900">Select Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size.name}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            selectedSize?.name === size.name
                              ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {size.name}
                          <span className={`text-xs ${
                            selectedSize?.name === size.name ? 'text-gray-300' : 'text-gray-400'
                          }`}>
                            Rs. {size.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Customization Options */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <h3 className="font-bold text-gray-900 mb-3">Customize Your Order</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {customizationOptions.map((option) => (
                      <motion.button
                        key={option.id}
                        onClick={() => toggleCustomization(option.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-3 rounded-xl text-left backdrop-blur-xl transition-all"
                        style={{
                          background: selectedCustomizations.includes(option.id)
                            ? 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)'
                            : 'rgba(255, 255, 255, 0.6)',
                          border: selectedCustomizations.includes(option.id)
                            ? '2px solid #FF9F40'
                            : '1px solid rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{option.icon}</span>
                          {selectedCustomizations.includes(option.id) && (
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                              <span className="text-orange-500 text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <p className={`text-sm font-bold ${selectedCustomizations.includes(option.id) ? 'text-white' : 'text-gray-900'}`}>
                          {option.name}
                        </p>
                        {option.price > 0 && (
                          <p className={`text-xs ${selectedCustomizations.includes(option.id) ? 'text-white/80' : 'text-gray-500'}`}>
                            +Rs. {option.price}
                          </p>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Reviews Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-3.5 rounded-xl backdrop-blur-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">Customer Reviews</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-900">{product.rating}</span>
                      <span className="text-sm text-gray-500">(850+)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-600">
                      <span className="font-bold text-gray-900">98%</span> customers recommend this
                    </p>
                  </div>
                </motion.div>

                {/* Spacing for sticky footer */}
                <div className="h-20" />
              </div>
            </div>

            {/* Sticky Bottom - Add to Cart */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
              className="sticky bottom-0 left-0 right-0 p-4 backdrop-blur-xl border-t"
              style={{
                background: 'rgba(255, 248, 225, 0.95)',
                borderTop: '1px solid rgba(255, 159, 64, 0.2)',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center gap-2 p-1 rounded-xl backdrop-blur-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(255, 159, 64, 0.3)',
                  }}
                >
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                    }}
                  >
                    <Minus className="w-4 h-4 text-white" strokeWidth={3} />
                  </motion.button>
                  
                  <motion.div
                    key={quantity}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-10 text-center"
                  >
                    <span className="font-black text-gray-900">{quantity}</span>
                  </motion.div>
                  
                  <motion.button
                    onClick={() => setQuantity(quantity + 1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                    }}
                  >
                    <Plus className="w-4 h-4 text-white" strokeWidth={3} />
                  </motion.button>
                </div>

                {/* Add to Cart Button */}
                <motion.button
                  ref={addToCartButtonRef}
                  onClick={handleAddToCartClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                    boxShadow: '0 6px 20px rgba(255, 159, 64, 0.4)',
                  }}
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                  <span className="font-black text-white">
                    Add - Rs. {totalPrice}
                  </span>
                  {cartQuantity > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-white/30 text-white text-xs font-bold">
                      {cartQuantity} in cart
                    </span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
