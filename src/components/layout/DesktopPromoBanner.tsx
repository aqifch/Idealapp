import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../common/figma/ImageWithFallback";
import { ArrowRight, Star } from "lucide-react";
import { Banner } from "../../data/mockData";

interface DesktopPromoBannerProps {
  banner?: Banner;
}

// Helper function to get animation variants
const getAnimationVariants = (type: string = 'fade') => {
  switch (type) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    case 'slide':
      return {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 50 },
      };
    case 'zoom':
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.2 },
      };
    default:
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      };
  }
};

// Helper function to get button style classes
const getButtonStyleClasses = (style: string = 'gradient') => {
  switch (style) {
    case 'solid':
      return 'bg-purple-500 text-white border-none';
    case 'outline':
      return 'bg-transparent text-white border-2 border-white';
    case 'gradient':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none';
    case 'ghost':
      return 'bg-white/10 backdrop-blur-md text-white border border-white/30';
    case 'rounded':
      return 'bg-purple-500 text-white border-none rounded-full';
    default:
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none';
  }
};

// Helper function to get text position classes
const getTextPositionClasses = (position: string = 'left') => {
  switch (position) {
    case 'left':
      return 'text-left items-start';
    case 'center':
      return 'text-center items-center';
    case 'right':
      return 'text-right items-end';
    default:
      return 'text-left items-start';
  }
};

export const DesktopPromoBanner = ({ banner }: DesktopPromoBannerProps) => {
  if (!banner) return null;

  const displayStyle = banner.displayStyle || 'image-text-button';
  const animationType = banner.animationType || 'fade';
  const buttonStyle = banner.buttonStyle || 'gradient';
  const textPosition = banner.textPosition || 'left';
  const overlayOpacity = banner.overlayOpacity ?? 80;
  
  const animationVariants = getAnimationVariants(animationType);

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
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            className="absolute inset-0"
            {...animationVariants}
            transition={{ duration: 0.5 }}
          >
            <ImageWithFallback
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay - only show if text is displayed */}
            {(displayStyle === 'image-text' || displayStyle === 'image-text-button') && (
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, rgba(0,0,0,${overlayOpacity / 100}) 0%, rgba(0,0,0,${overlayOpacity / 200}) 100%)`,
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Content - only show if not image-only */}
        {(displayStyle === 'image-text' || displayStyle === 'image-text-button') && (
          <div className={`relative z-10 h-full flex items-center px-16 ${getTextPositionClasses(textPosition)}`}>
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
              {banner.title && (
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-5xl font-bold text-white mb-3 leading-tight"
                >
                  {banner.title}
                </motion.h2>
              )}

              {/* Subtitle */}
              {banner.subtitle && (
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="text-3xl font-bold text-white/90 mb-3 leading-tight"
                >
                  {banner.subtitle}
                </motion.h3>
              )}

              {/* Description */}
              {banner.description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/90 text-lg mb-6"
                >
                  {banner.description}
                </motion.p>
              )}

              {/* CTA Button - only show if image-text-button */}
              {displayStyle === 'image-text-button' && banner.buttonText && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 font-bold text-base flex items-center gap-3 ${
                    buttonStyle === 'rounded' ? 'rounded-full' : 'rounded-xl'
                  } ${getButtonStyleClasses(buttonStyle)}`}
                  style={{
                    boxShadow: buttonStyle === 'gradient' || buttonStyle === 'solid' 
                      ? '0 8px 24px rgba(147, 51, 234, 0.4)' 
                      : 'none',
                  }}
                  onClick={() => {
                    if (banner.buttonLink) {
                      if (banner.buttonLink.startsWith('http')) {
                        window.open(banner.buttonLink, '_blank');
                      } else {
                        window.location.href = banner.buttonLink;
                      }
                    }
                  }}
                >
                  {banner.buttonText}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>
        )}

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
