import React from "react";
import { motion } from "motion/react";
import { Category as CategoryType } from "../data/mockData";
import Slider from "react-slick";

interface DesktopCategoryShowcaseProps {
  selectedCategory?: string;
  categories?: CategoryType[];
  onCategorySelect?: (categoryId: string) => void;
}

export const DesktopCategoryShowcase = ({ 
  selectedCategory = "all",
  onCategorySelect,
  categories: categoriesProp
}: DesktopCategoryShowcaseProps) => {
  // Default fallback categories
  const defaultCategories = [
    { id: "1", name: "Burgers", icon: "🍔", color: "#FF9F40", isActive: true },
    { id: "2", name: "Pizza", icon: "🍕", color: "#E63946", isActive: true },
    { id: "3", name: "Drinks", icon: "🥤", color: "#457B9D", isActive: true },
    { id: "4", name: "Sides", icon: "🍟", color: "#F4A261", isActive: true },
    { id: "5", name: "Desserts", icon: "🍰", color: "#E07BE0", isActive: true },
  ];

  const categories = (categoriesProp?.filter(cat => cat.isActive !== false) || defaultCategories)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Slider settings
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 5,
        }
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
        }
      }
    ]
  };

  // Helper function to get warm color variations
  const getWarmColors = (baseColor?: string) => {
    if (!baseColor) {
      return {
        bgColor: "rgba(255, 240, 220, 0.9)",
        glowColor: "rgba(255, 190, 130, 0.5)",
      };
    }
    
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 255, g: 159, b: 64 };
    };
    
    const rgb = hexToRgb(baseColor);
    return {
      bgColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
      glowColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
    };
  };

  return (
    <div className="w-full py-8 relative">
      {/* Decorative Background Boxes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="absolute top-10 left-20 w-40 h-40 bg-orange-200/30 rounded-3xl blur-2xl"
        />
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute top-0 right-40 w-52 h-52 bg-red-200/30 rounded-3xl blur-2xl"
        />
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute bottom-0 left-1/3 w-48 h-48 bg-yellow-200/30 rounded-3xl blur-2xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute top-20 right-20 w-36 h-36 bg-purple-200/30 rounded-3xl blur-2xl"
        />
      </div>

      <div className="mb-6 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 text-left"
        >
          Category
        </motion.h2>
      </div>

      <Slider {...sliderSettings} className="category-slider relative z-10">
        {categories.map((category, index) => {
          const isActive = selectedCategory === category.name;
          const colors = getWarmColors(category.color);
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onCategorySelect?.(category.name)}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="relative cursor-pointer rounded-2xl overflow-hidden backdrop-blur-xl p-5 group mx-2"
              style={{
                background: colors.bgColor,
                boxShadow: isActive 
                  ? '0 8px 30px rgba(255, 159, 64, 0.25)' 
                  : '0 6px 24px rgba(0, 0, 0, 0.08)',
                border: isActive 
                  ? '2px solid rgba(255, 159, 64, 0.5)' 
                  : '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              {/* Glow Effect */}
              <div 
                className="absolute inset-0 rounded-full blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                style={{
                  background: colors.glowColor,
                  transform: 'scale(0.8)',
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                {/* Icon with Animation */}
                <motion.div
                  animate={{
                    scale: isActive ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: isActive ? Infinity : 0,
                    repeatDelay: 1,
                  }}
                  className="text-5xl"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                  }}
                >
                  {category.icon}
                </motion.div>

                {/* Category Name */}
                <div className="text-center">
                  <h3 
                    className="font-bold text-base transition-colors"
                    style={{
                      color: isActive ? '#FF9F40' : '#1F2937',
                    }}
                  >
                    {category.name}
                  </h3>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full"
                    style={{ background: '#FF9F40' }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </Slider>
    </div>
  );
};
