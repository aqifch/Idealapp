import React from "react";
import { motion } from "motion/react";

interface ParticleProps {
  productName: string;
  startX: number;
  startY: number;
}

// Detect food type and return appropriate particles
const getFoodParticles = (productName: string) => {
  const name = productName.toLowerCase();
  
  if (name.includes("burger") || name.includes("sandwich")) {
    // Sesame seeds
    return {
      emoji: "🌾",
      particles: ["🌾", "⭐", "✨", "🌟"],
      colors: ["#F59E0B", "#EAB308", "#FCD34D", "#FEF3C7"],
      count: 12,
    };
  } else if (name.includes("fries") || name.includes("fry")) {
    // Fries/potato pieces
    return {
      emoji: "🍟",
      particles: ["🥔", "⭐", "✨", "🌟"],
      colors: ["#EAB308", "#F59E0B", "#FCD34D", "#FBBF24"],
      count: 10,
    };
  } else if (name.includes("pizza")) {
    // Cheese/pepperoni
    return {
      emoji: "🧀",
      particles: ["🧀", "🍕", "⭐", "✨"],
      colors: ["#F59E0B", "#EF4444", "#FCD34D", "#FCA5A5"],
      count: 14,
    };
  } else if (name.includes("drink") || name.includes("soda") || name.includes("juice")) {
    // Bubbles
    return {
      emoji: "💧",
      particles: ["💧", "💦", "✨", "⭐"],
      colors: ["#3B82F6", "#60A5FA", "#DBEAFE", "#93C5FD"],
      count: 16,
    };
  } else if (name.includes("chicken") || name.includes("wings")) {
    // Fire/spicy
    return {
      emoji: "🔥",
      particles: ["🔥", "⭐", "✨", "🌟"],
      colors: ["#EF4444", "#F59E0B", "#FCD34D", "#FCA5A5"],
      count: 12,
    };
  } else if (name.includes("ice cream") || name.includes("dessert") || name.includes("cake")) {
    // Hearts/stars
    return {
      emoji: "💖",
      particles: ["💖", "⭐", "✨", "🌟", "💫"],
      colors: ["#EC4899", "#F472B6", "#FBCFE8", "#FDE68A"],
      count: 15,
    };
  } else {
    // Default sparkles
    return {
      emoji: "✨",
      particles: ["⭐", "✨", "🌟", "💫"],
      colors: ["#EAB308", "#F59E0B", "#FCD34D", "#FBBF24"],
      count: 10,
    };
  }
};

export const FoodParticles = ({ productName, startX, startY }: ParticleProps) => {
  const foodData = getFoodParticles(productName);
  
  return (
    <>
      {/* Emoji Particles */}
      {Array.from({ length: foodData.count }).map((_, i) => {
        const angle = (i / foodData.count) * Math.PI * 2;
        const distance = 80 + Math.random() * 60;
        const randomParticle = foodData.particles[Math.floor(Math.random() * foodData.particles.length)];
        
        return (
          <motion.div
            key={`emoji-${i}`}
            initial={{
              x: startX,
              y: startY,
              scale: 0,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              x: startX + Math.cos(angle) * distance,
              y: startY + Math.sin(angle) * distance,
              scale: [0, 1.2, 0.8, 0],
              opacity: [1, 1, 0.8, 0],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.4,
              ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
              delay: i * 0.02,
            }}
            className="fixed pointer-events-none z-[9998]"
            style={{
              fontSize: `${16 + Math.random() * 8}px`,
            }}
          >
            {randomParticle}
          </motion.div>
        );
      })}

      {/* Color Burst Particles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        const randomColor = foodData.colors[Math.floor(Math.random() * foodData.colors.length)];
        
        return (
          <motion.div
            key={`color-${i}`}
            initial={{
              x: startX,
              y: startY,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: startX + Math.cos(angle) * distance,
              y: startY + Math.sin(angle) * distance,
              scale: [1, 2, 0],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: i * 0.03,
            }}
            className="fixed pointer-events-none z-[9998] rounded-full blur-sm"
            style={{
              width: `${8 + Math.random() * 8}px`,
              height: `${8 + Math.random() * 8}px`,
              backgroundColor: randomColor,
            }}
          />
        );
      })}

      {/* Ring Burst Effect */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`ring-${i}`}
          initial={{
            x: startX - 40,
            y: startY - 40,
            scale: 0.5,
            opacity: 1,
          }}
          animate={{
            scale: [0.5, 2 + i * 0.5],
            opacity: [1, 0],
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: i * 0.1,
          }}
          className="fixed pointer-events-none z-[9997] w-20 h-20 rounded-full"
          style={{
            border: `3px solid ${foodData.colors[i % foodData.colors.length]}`,
          }}
        />
      ))}
    </>
  );
};
