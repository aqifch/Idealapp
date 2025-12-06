import React from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ArrowRight, Star } from "lucide-react";
import { Banner } from "../data/mockData";

interface DesktopPromoBannerProps {
  banner?: Banner;
}

export const DesktopPromoBanner = ({ banner }: DesktopPromoBannerProps) => {
  if (!banner) return null;

  return (
    <div className="w-full py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative w-full rounded-3xl overflow-hidden backdrop-blur-xl"
        style={{
          height: "300px",
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center px-16">
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: 'rgba(255, 193, 7, 0.2)',
                border: '1px solid rgba(255, 193, 7, 0.4)',
              }}
            >
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-bold">EXCLUSIVE OFFER</span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-bold text-white mb-3 leading-tight"
            >
              {banner.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/90 text-lg mb-6"
            >
              {banner.description}
            </motion.p>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl font-bold text-base flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                color: 'white',
                boxShadow: '0 8px 24px rgba(255, 159, 64, 0.4)',
              }}
            >
              {banner.buttonText || "Order Now"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-10 right-20 w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 193, 7, 0.3) 0%, transparent 70%)',
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-10 right-40 w-24 h-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 159, 64, 0.3) 0%, transparent 70%)',
          }}
        />
      </motion.div>
    </div>
  );
};
