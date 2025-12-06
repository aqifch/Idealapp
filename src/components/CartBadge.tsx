import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart } from "lucide-react";

interface CartBadgeProps {
  count: number;
  onClick?: () => void;
  triggerBounce?: boolean;
}

export const CartBadge = ({ count, onClick, triggerBounce }: CartBadgeProps) => {
  const [shouldBounce, setShouldBounce] = useState(false);
  const [prevCount, setPrevCount] = useState(count);

  useEffect(() => {
    if (count > prevCount) {
      setShouldBounce(true);
      setTimeout(() => setShouldBounce(false), 600);
    }
    setPrevCount(count);
  }, [count]);

  return (
    <motion.button
      onClick={onClick}
      className="relative"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Cart Icon */}
      <motion.div
        animate={shouldBounce ? {
          scale: [1, 1.2, 0.9, 1.1, 1],
          rotate: [0, -10, 10, -5, 0]
        } : {}}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <ShoppingCart className="w-6 h-6 text-gray-700" />
        
        {/* Cart Badge with Count */}
        {count > 0 && (
          <motion.div
            key={count}
            initial={{ scale: 0 }}
            animate={{ 
              scale: shouldBounce ? [0, 1.4, 1] : 1,
              backgroundColor: shouldBounce ? ["#EAB308", "#F59E0B", "#EAB308"] : "#EAB308"
            }}
            transition={{
              scale: { type: "spring", stiffness: 500, damping: 15 },
              backgroundColor: { duration: 0.6 }
            }}
            className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-yellow-500 text-white text-xs font-black rounded-full flex items-center justify-center px-1.5 shadow-lg"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={count}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Success Pulse Ring */}
        {shouldBounce && (
          <motion.div
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 border-4 border-yellow-400 rounded-full"
          />
        )}
      </motion.div>
    </motion.button>
  );
};
