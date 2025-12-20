import React, { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Heart, ShoppingCart, Trash2, X, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { useCart } from "../../context/CartContext";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  category: string;
}

interface WishlistViewProps {
  onBack: () => void;
  onProductClick?: (product: any) => void;
  wishlistItems: WishlistItem[];
  onRemoveFromWishlist: (productId: string) => void;
}

export const WishlistView = ({ onBack, onProductClick, wishlistItems, onRemoveFromWishlist }: WishlistViewProps) => {
  const { addToCart } = useCart();

  const handleRemoveFromWishlist = (itemId: string, itemName: string) => {
    onRemoveFromWishlist(itemId);
    toast.success(`${itemName} removed from wishlist ❤️`);
  };

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    toast.success(`${item.name} added to cart! 🛒`);
  };

  const handleAddAllToCart = () => {
    wishlistItems.forEach(item => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
      });
    });
    toast.success(`All ${wishlistItems.length} items added to cart! 🎉`);
  };

  const totalSavings = wishlistItems.reduce(
    (total, item) => total + (item.originalPrice ? item.originalPrice - item.price : 0),
    0
  );

  const totalValue = wishlistItems.reduce((total, item) => total + item.price, 0);

  return (
    <div 
      className="min-h-screen pb-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%)',
      }}
    >
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute"
          style={{
            top: '5%',
            right: '-5%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute"
          style={{
            bottom: '20%',
            left: '-10%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(255, 159, 64, 0.25) 0%, rgba(255, 159, 64, 0.1) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header - Glass Morphism */}
        <div className="px-6 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-5 backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              {/* Back Button */}
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                }}
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </motion.button>

              {/* Title */}
              <div className="flex-1 text-center">
                <h1 className="font-black text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-600">{wishlistItems.length} items saved</p>
              </div>

              {/* Heart Icon */}
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                }}
              >
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
            </div>

            {/* Stats Cards */}
            {wishlistItems.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {/* Total Value */}
                <div 
                  className="rounded-2xl p-3 backdrop-blur-xl text-center"
                  style={{
                    background: 'rgba(255, 159, 64, 0.15)',
                    border: '1px solid rgba(255, 159, 64, 0.3)',
                  }}
                >
                  <p className="text-xs text-gray-600 mb-1">Total Value</p>
                  <p className="font-black text-orange-600">Rs {totalValue}</p>
                </div>

                {/* Savings */}
                <div 
                  className="rounded-2xl p-3 backdrop-blur-xl text-center"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <p className="text-xs text-gray-600 mb-1">You Save</p>
                  <p className="font-black text-green-600">Rs {totalSavings}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Add All to Cart Button */}
        {wishlistItems.length > 0 && (
          <div className="px-6 mb-6">
            <motion.button
              onClick={handleAddAllToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-2xl py-4 font-bold flex items-center justify-center gap-2 backdrop-blur-xl"
              style={{
                background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                boxShadow: '0 4px 20px rgba(255, 159, 64, 0.3)',
                color: 'white',
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              Add All to Cart ({wishlistItems.length} items)
            </motion.button>
          </div>
        )}

        {/* Wishlist Items */}
        <div className="px-6 max-w-7xl lg:mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlistItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl p-8 backdrop-blur-xl text-center col-span-full"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                marginTop: '60px',
              }}
            >
              <div className="text-6xl mb-4">💔</div>
              <h3 className="font-black text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-6">Start adding items you love!</p>
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                }}
              >
                Explore Products
              </motion.button>
            </motion.div>
          ) : (
            wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl p-4 backdrop-blur-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <motion.div
                    onClick={() => onProductClick?.(item)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer"
                    style={{
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Discount Badge */}
                    {item.originalPrice && (
                      <div 
                        className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md"
                        style={{
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: 'white',
                        }}
                      >
                        {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                      </div>
                    )}
                  </motion.div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 
                          onClick={() => onProductClick?.(item)}
                          className="font-black text-gray-900 mb-1 cursor-pointer hover:text-orange-500 transition-colors line-clamp-1"
                        >
                          {item.name}
                        </h3>
                        <p 
                          className="text-xs px-2 py-1 rounded-full inline-block"
                          style={{
                            background: 'rgba(255, 159, 64, 0.15)',
                            color: '#F97316',
                          }}
                        >
                          {item.category}
                        </p>
                      </div>
                      <motion.button
                        onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </motion.button>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-gray-900">{item.rating}</span>
                      <span className="text-xs text-gray-500 ml-1">({Math.floor(Math.random() * 500 + 100)} reviews)</span>
                    </div>

                    {/* Price & Add Button */}
                    <div className="flex items-end justify-between mt-auto">
                      <div className="flex flex-col">
                        {item.originalPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            Rs {item.originalPrice}
                          </span>
                        )}
                        <span className="font-black text-orange-600 text-lg">
                          Rs {item.price}
                        </span>
                      </div>
                      <motion.button
                        onClick={() => handleAddToCart(item)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5"
                        style={{
                          background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(255, 159, 64, 0.3)',
                        }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Bottom Summary Card */}
        {wishlistItems.length > 0 && (
          <div className="px-6 pt-6 pb-4 max-w-7xl lg:mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-5 backdrop-blur-xl"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 mb-1">💰 Potential Savings</p>
                  <p className="text-2xl font-black text-green-600">
                    Rs {totalSavings}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Save by adding these items to cart!
                  </p>
                </div>
                <div className="text-5xl">🎉</div>
              </div>
            </motion.div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
