import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FoodParticles } from "./FoodParticles";

interface EnhancedFlyingProductProps {
  id: string;
  image: string;
  name: string;
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  onComplete: () => void;
  timing?: "fast" | "normal" | "smooth" | "playful";
}

// Timing presets
const TIMING_PRESETS = {
  fast: {
    duration: 0.6,
    easing: [0.4, 0.0, 0.2, 1],
    description: "Quick & snappy",
  },
  normal: {
    duration: 0.8,
    easing: [0.4, 0.0, 0.2, 1],
    description: "Balanced & smooth",
  },
  smooth: {
    duration: 1.0,
    easing: [0.25, 0.46, 0.45, 0.94],
    description: "Gentle & elegant",
  },
  playful: {
    duration: 0.9,
    easing: [0.68, -0.55, 0.265, 1.55],
    description: "Bouncy & fun",
  },
};

export const EnhancedFlyingProduct = ({
  id,
  image,
  name,
  startPos,
  endPos,
  onComplete,
  timing = "playful",
}: EnhancedFlyingProductProps) => {
  const [showParticles, setShowParticles] = useState(false);
  const preset = TIMING_PRESETS[timing];

  useEffect(() => {
    // Trigger particles burst at start
    setShowParticles(true);
  }, []);

  // Calculate control points for energetic curved path
  const controlPoint1X = startPos.x + (endPos.x - startPos.x) * 0.25;
  const controlPoint1Y = Math.min(startPos.y, endPos.y) - 120; // Higher arc
  
  const controlPoint2X = startPos.x + (endPos.x - startPos.x) * 0.75;
  const controlPoint2Y = Math.min(startPos.y, endPos.y) - 80;

  return (
    <>
      {/* Food Particles Burst */}
      {showParticles && (
        <FoodParticles
          productName={name}
          startX={startPos.x + 40}
          startY={startPos.y + 40}
        />
      )}

      {/* Flying Product with Motion Blur */}
      <motion.div
        initial={{
          x: startPos.x,
          y: startPos.y,
          scale: 1,
          opacity: 1,
          rotate: 0,
        }}
        animate={{
          x: [startPos.x, controlPoint1X, controlPoint2X, endPos.x],
          y: [startPos.y, controlPoint1Y, controlPoint2Y, endPos.y],
          scale: [1, 1.2, 0.8, 0.3],
          opacity: [1, 1, 1, 0],
          rotate: [0, -15, 15, 25],
        }}
        transition={{
          duration: preset.duration,
          ease: preset.easing,
          times: [0, 0.3, 0.6, 1],
        }}
        onAnimationComplete={onComplete}
        className="fixed pointer-events-none z-[9999]"
        style={{
          width: "80px",
          height: "80px",
        }}
      >
        {/* Multi-layer Glow Effect */}
        <div className="relative w-full h-full">
          {/* Outer Glow - Pulsing */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-4 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 blur-2xl rounded-full"
          />

          {/* Middle Glow - Rotating */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -inset-2 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 blur-xl rounded-full opacity-60"
          />

          {/* Inner Glow */}
          <div className="absolute inset-0 bg-yellow-400/40 blur-lg rounded-full" />

          {/* Product Image Container with Shine */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(251, 191, 36, 0.5)",
                "0 0 40px rgba(251, 146, 60, 0.8)",
                "0 0 20px rgba(251, 191, 36, 0.5)",
              ],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-full h-full bg-white rounded-2xl overflow-hidden border-4 border-yellow-400"
          >
            {/* Shine Effect Overlay */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: "easeInOut",
              }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12"
            />

            {/* Product Image */}
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover relative z-10"
            />

            {/* Top Highlight */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent" />
          </motion.div>

          {/* Motion Trail Effects */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={`trail-${i}`}
              className="absolute inset-0 rounded-2xl"
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: [0, 0.4, 0],
                scale: [1, 1.3 + i * 0.2, 1.6 + i * 0.2],
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: i * 0.05,
                repeat: Infinity,
                repeatDelay: 0.3,
              }}
              style={{
                background: `linear-gradient(135deg, 
                  rgba(251, 191, 36, 0.3),
                  rgba(251, 146, 60, 0.3),
                  rgba(239, 68, 68, 0.2)
                )`,
                filter: "blur(8px)",
              }}
            />
          ))}

          {/* Speed Lines */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`speed-${i}`}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: [0, 1, 0],
                opacity: [0, 0.6, 0],
                x: [-50, 0, 50],
              }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 0.3,
              }}
              className="absolute left-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full origin-left"
              style={{
                top: `${30 + i * 20}%`,
                width: "120%",
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Motion Blur Trail Clone */}
      <motion.div
        initial={{
          x: startPos.x,
          y: startPos.y,
          scale: 1,
          opacity: 0.4,
        }}
        animate={{
          x: [startPos.x, controlPoint1X, controlPoint2X, endPos.x],
          y: [startPos.y, controlPoint1Y, controlPoint2Y, endPos.y],
          scale: [1, 1.15, 0.75, 0.25],
          opacity: [0.4, 0.3, 0.2, 0],
        }}
        transition={{
          duration: preset.duration,
          ease: preset.easing,
          times: [0, 0.3, 0.6, 1],
        }}
        className="fixed pointer-events-none z-[9998]"
        style={{
          width: "80px",
          height: "80px",
          filter: "blur(4px)",
        }}
      >
        <div className="w-full h-full bg-white rounded-2xl overflow-hidden border-2 border-orange-400 opacity-60">
          <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
      </motion.div>
    </>
  );
};
