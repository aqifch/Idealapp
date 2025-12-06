import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

interface FlyingProductProps {
  id: string;
  image: string;
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  onComplete: () => void;
}

export const FlyingProduct = ({ id, image, startPos, endPos, onComplete }: FlyingProductProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate control point for bezier curve (arc path)
  const controlPointX = startPos.x + (endPos.x - startPos.x) * 0.5;
  const controlPointY = Math.min(startPos.y, endPos.y) - 100; // Arc upward

  return (
    <motion.div
      initial={{
        x: startPos.x,
        y: startPos.y,
        scale: 1,
        opacity: 1,
        rotate: 0,
      }}
      animate={{
        x: [startPos.x, controlPointX, endPos.x],
        y: [startPos.y, controlPointY, endPos.y],
        scale: [1, 0.8, 0.3],
        opacity: [1, 1, 0],
        rotate: [0, 5, 10],
      }}
      transition={{
        duration: 0.8,
        ease: [0.4, 0.0, 0.2, 1],
        times: [0, 0.5, 1],
      }}
      onAnimationComplete={onComplete}
      className="fixed pointer-events-none z-[9999]"
      style={{
        width: "80px",
        height: "80px",
      }}
    >
      {/* Product Image with Glow */}
      <div className="relative w-full h-full">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full animate-pulse"></div>
        
        {/* Product Image */}
        <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-yellow-400">
          <img
            src={image}
            alt="Flying product"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Motion Trail Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-400/40 to-orange-500/40 rounded-2xl"
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: [0, 0.6, 0], scale: [1.2, 1.5, 1.8] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};
