import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart } from "lucide-react";

interface EnhancedCartBadgeProps {
  count: number;
  onClick?: () => void;
  animation?: "bounce" | "shake" | "pulse" | "spin";
}

export const EnhancedCartBadge = ({
  count,
  onClick,
  animation = "bounce",
}: EnhancedCartBadgeProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [prevCount, setPrevCount] = useState(count);

  useEffect(() => {
    if (count > prevCount) {
      setShouldAnimate(true);
      setTimeout(() => setShouldAnimate(false), 1000);
    }
    setPrevCount(count);
  }, [count, prevCount]);

  // Animation variants
  const animations = {
    bounce: {
      scale: [1, 1.3, 0.9, 1.2, 1],
      rotate: [0, -15, 15, -10, 0],
      y: [0, -10, 0, -5, 0],
    },
    shake: {
      x: [0, -10, 10, -8, 8, -5, 5, 0],
      rotate: [0, -15, 15, -12, 12, -8, 8, 0],
    },
    pulse: {
      scale: [1, 1.4, 1, 1.3, 1, 1.2, 1],
    },
    spin: {
      rotate: [0, 180, 360],
      scale: [1, 1.3, 1],
    },
  };

  return (
    <motion.button
      onClick={onClick}
      className="relative"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
    >
      {/* Cart Icon with Animation */}
      <motion.div
        animate={shouldAnimate ? animations[animation] : {}}
        transition={{
          duration: animation === "spin" ? 0.6 : 0.8,
          ease: animation === "bounce" ? [0.68, -0.55, 0.265, 1.55] : "easeInOut",
        }}
        className="relative"
      >
        <ShoppingCart className="w-6 h-6 text-gray-700" />

        {/* Explosion Effect on Update */}
        {shouldAnimate && (
          <>
            {/* Star Burst */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const angle = (i / 8) * Math.PI * 2;
              const distance = 30;
              return (
                <motion.div
                  key={`star-${i}`}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-400"
                >
                  {i % 2 === 0 ? "⭐" : "✨"}
                </motion.div>
              );
            })}

            {/* Expanding Rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`ring-${i}`}
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{
                  scale: [0.5, 2.5 + i],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: i * 0.1,
                }}
                className="absolute inset-0 border-4 rounded-full"
                style={{
                  borderColor: i % 2 === 0 ? "#FBBF24" : "#F59E0B",
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Cart Badge with Count */}
      {count > 0 && (
        <motion.div
          key={count}
          initial={{ scale: 0 }}
          animate={{
            scale: shouldAnimate ? [0, 1.5, 1] : 1,
            backgroundColor: shouldAnimate
              ? ["#EAB308", "#F59E0B", "#EF4444", "#EAB308"]
              : "#EAB308",
          }}
          transition={{
            scale: { type: "spring", stiffness: 500, damping: 15 },
            backgroundColor: { duration: 0.8 },
          }}
          className="absolute -top-2 -right-2 min-w-[22px] h-[22px] bg-yellow-500 text-white text-xs font-black rounded-full flex items-center justify-center px-1.5 shadow-xl border-2 border-white"
        >
          {/* Pulsing Glow */}
          {shouldAnimate && (
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 bg-yellow-400 rounded-full -z-10"
            />
          )}

          {/* Count Number with Animation */}
          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.5 }}
              transition={{
                type: "spring",
                stiffness: 600,
                damping: 20,
              }}
            >
              {count}
            </motion.span>
          </AnimatePresence>

          {/* Sparkle Effect */}
          {shouldAnimate && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: Math.cos((i * Math.PI * 2) / 3) * 20,
                    y: Math.sin((i * Math.PI * 2) / 3) * 20,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: i * 0.1,
                  }}
                  className="absolute text-xs"
                >
                  ✨
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      )}
    </motion.button>
  );
};
