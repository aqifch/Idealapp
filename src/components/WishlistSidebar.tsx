import React from "react";
import { motion } from "motion/react";
import { X, Heart, Trash2, ShoppingCart } from "lucide-react";
import { Product } from "../data/mockData";
import { toast } from "sonner";

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

export const WishlistSidebar = ({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveFromWishlist,
  onAddToCart,
  onProductClick,
}: WishlistSidebarProps) => {
  const handleRemove = (productId: string, productName: string) => {
    onRemoveFromWishlist(productId);
    toast.success(`${productName} removed from wishlist! 💔`);
  };

  const handleAddToCart = (product: Product) => {
    // If product has sizes, open details view to select size
    if (product.sizes && product.sizes.length > 0) {
      handleProductClick(product);
      return;
    }

    if (onAddToCart) {
      onAddToCart(product);
      toast.success(`${product.name} added to cart! 🛒`);
    }
  };

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
      onClose();
    }
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
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">My Wishlist</h2>
              <p className="text-xs text-white/80">
                {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {wishlistItems.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full px-6 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                Your Wishlist is Empty
              </h3>
              <p className="text-gray-500 mb-6 max-w-xs">
                Save your favorite items here to order them later
              </p>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg"
              >
                Start Shopping
              </motion.button>
            </motion.div>
          ) : (
            /* Wishlist Items */
            <div className="p-4 space-y-3">
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border-2 border-gray-100 rounded-2xl p-4 hover:border-yellow-300 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <motion.div
                      onClick={() => handleProductClick(item)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0 cursor-pointer shadow-md"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        onClick={() => handleProductClick(item)}
                        className="font-black text-gray-900 mb-1 cursor-pointer hover:text-orange-500 transition-colors line-clamp-1"
                      >
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-orange-500">
                          Rs {item.price}
                        </span>
                        {item.rating && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>⭐</span>
                            <span className="font-bold">{item.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <motion.button
                      onClick={() => handleAddToCart(item)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </motion.button>
                    <motion.button
                      onClick={() => handleRemove(item.id, item.name)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-11 h-11 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-xl transition-all flex items-center justify-center shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Total Items */}
        {wishlistItems.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-black text-gray-900">
                  {wishlistItems.length}
                </p>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg"
              >
                Continue Shopping
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};
