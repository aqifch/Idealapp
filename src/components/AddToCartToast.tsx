import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, X, ShoppingCart } from "lucide-react";

interface ToastProps {
  isVisible: boolean;
  productName: string;
  onClose: () => void;
  onViewCart?: () => void;
}

export const AddToCartToast = ({ isVisible, productName, onClose, onViewCart }: ToastProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-400 overflow-hidden">
            {/* Success Bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 3, ease: "linear" }}
              className="h-1 bg-gradient-to-r from-green-400 to-green-600 origin-left"
            />

            <div className="p-4 flex items-center gap-3">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
                className="flex-shrink-0"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
              </motion.div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <motion.h4
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-black text-gray-900 text-sm mb-0.5"
                >
                  Added to Cart!
                </motion.h4>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-xs text-gray-600 truncate"
                >
                  {productName}
                </motion.p>
              </div>

              {/* View Cart Button */}
              {onViewCart && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
                  onClick={onViewCart}
                  className="flex-shrink-0 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>View</span>
                </motion.button>
              )}

              {/* Close Button */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 500 }}
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>

            {/* Confetti Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => {
                const isEmoji = i % 3 === 0;
                const emojis = ["🍔", "🍕", "🍟", "⭐", "✨", "🌟"];
                return (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: "50%", 
                      y: "50%", 
                      scale: 0, 
                      opacity: 1,
                      rotate: 0,
                    }}
                    animate={{
                      x: `${50 + (Math.cos((i * Math.PI) / 6) * 120)}%`,
                      y: `${50 + (Math.sin((i * Math.PI) / 6) * 120)}%`,
                      scale: isEmoji ? [0, 1.2, 0] : [0, 1, 0],
                      opacity: [1, 1, 0],
                      rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                    }}
                    transition={{
                      duration: 0.8,
                      ease: [0.34, 1.56, 0.64, 1],
                      delay: i * 0.04,
                    }}
                    className="absolute"
                    style={{
                      fontSize: isEmoji ? "16px" : "8px",
                    }}
                  >
                    {isEmoji ? emojis[i % emojis.length] : (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: i % 2 === 0 ? "#EAB308" : "#F59E0B",
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};