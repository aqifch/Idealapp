import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Banner } from "../data/mockData";

interface NewHeroBannerProps {
  banners?: Banner[];
  layout?: 'single' | 'grid-2' | 'grid-3';
  desktopHeight?: string;
}

export const NewHeroBanner = ({ banners = [], layout = 'single', desktopHeight = "500px" }: NewHeroBannerProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = banners.length > 0 ? banners : [
    {
      id: "default-1",
      image: "https://images.unsplash.com/photo-1571507622407-80df135676b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kJTIwZGFya3xlbnwxfHx8fDE3NjQyNDM3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "THE ULTIMATE",
      subtitle: "CHEESEBURGER.",
      description: "Now available in spicy!",
      buttonText: "ORDER NOW"
    }
  ];

  useEffect(() => {
    if (slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const slide = slides[currentSlide];
  
  const titleSize = layout === 'grid-3' ? 'lg:text-3xl' : layout === 'grid-2' ? 'lg:text-4xl' : 'lg:text-6xl';
  const paddingX = layout === 'single' ? 'lg:px-24' : 'lg:px-8';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="relative w-full rounded-3xl lg:rounded-none overflow-hidden backdrop-blur-xl hero-banner-desktop"
      style={{
        height: "200px",
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.06)',
      }}
    >
      <style>{`
        @media (min-width: 1024px) {
          .hero-banner-desktop {
            height: ${desktopHeight} !important;
            box-shadow: none !important;
          }
        }
      `}</style>
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ImageWithFallback
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col justify-center px-8 ${paddingX} max-w-[1600px] lg:mx-auto`}>
        <motion.h2
          key={`title-${currentSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-white text-2xl md:text-3xl ${titleSize} font-bold tracking-wide leading-tight`}
        >
          {slide.title}
        </motion.h2>
        <motion.h2
          key={`subtitle-${currentSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-white text-2xl md:text-3xl ${titleSize} font-bold tracking-wide`}
        >
          {slide.subtitle}
        </motion.h2>
        <motion.p
          key={`desc-${currentSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-white/90 text-sm lg:text-xl mt-1 lg:mt-4"
        >
          {slide.description}
        </motion.p>

        {/* Order Button */}
        <motion.button
          key={`button-${currentSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 lg:mt-8 px-6 lg:px-12 py-2 lg:py-4 rounded-full font-bold text-sm lg:text-lg w-fit backdrop-blur-md"
          style={{
            background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
            boxShadow: '0 8px 24px rgba(255, 159, 64, 0.4)',
            color: 'white',
            border: 'none',
          }}
        >
          {slide.buttonText}
        </motion.button>
      </div>

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 lg:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all rounded-full ${
                index === currentSlide
                  ? "w-8 lg:w-12 h-2 lg:h-2.5 bg-yellow-400"
                  : "w-2 lg:w-3 h-2 lg:h-3 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
