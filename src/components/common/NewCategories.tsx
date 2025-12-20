import React from "react";
import { motion } from "motion/react";
import { Category as CategoryType } from "../../data/mockData";

interface NewCategoriesProps {
  selectedCategory?: string;
  categories?: CategoryType[];
  onCategorySelect?: (categoryId: string) => void;
}

export const NewCategories = ({ 
  selectedCategory = "all",
  onCategorySelect,
  categories: categoriesProp
}: NewCategoriesProps) => {
  // Default fallback categories if none provided
  const defaultCategories = [
    { id: "1", name: "Burgers", icon: "🍔", color: "#FF9F40", isActive: true },
    { id: "2", name: "Pizza", icon: "🍕", color: "#E63946", isActive: true },
    { id: "3", name: "Drinks", icon: "🥤", color: "#457B9D", isActive: true },
    { id: "4", name: "Sides", icon: "🍟", color: "#F4A261", isActive: true },
    { id: "5", name: "Desserts", icon: "🍰", color: "#E07BE0", isActive: true },
  ];

  const categories = (categoriesProp?.filter(cat => cat.isActive !== false) || defaultCategories)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Helper function to get warm color variations
  const getWarmColors = (baseColor?: string) => {
    if (!baseColor) {
      return {
        bgColor: "rgba(255, 240, 220, 0.8)",
        glowColor: "rgba(255, 190, 130, 0.4)",
      };
    }
    
    // Convert hex to RGB and create warm variations
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
      glowColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`,
    };
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between lg:justify-center gap-4 lg:gap-8 overflow-x-auto hide-scrollbar pb-2 px-1">
        {categories.map((category, index) => {
          const isActive = selectedCategory === category.name;
          const colors = getWarmColors(category.color);
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onCategorySelect?.(category.name)}
              className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
              style={{ width: '80px' }}
            >
              {/* Circular Icon Container with Glass Morphism */}
              <div className="relative">
                {/* Soft Glow/Aura Behind */}
                <div 
                  className="absolute inset-0 rounded-full blur-xl transition-all duration-300"
                  style={{
                    background: colors.glowColor,
                    transform: isActive ? 'scale(1.5)' : 'scale(1.3)',
                    opacity: isActive ? 0.8 : 0.6,
                  }}
                />
                
                {/* Glass Morphism Circle */}
                <motion.div
                  className="relative w-[70px] h-[70px] lg:w-[90px] lg:h-[90px] rounded-full flex items-center justify-center backdrop-blur-md border border-white/30"
                  style={{
                    background: colors.bgColor,
                    boxShadow: isActive 
                      ? '0 4px 16px rgba(0, 0, 0, 0.1)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.05)',
                  }}
                  whileHover={{ y: -4, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {/* 3D Style Emoji */}
                  <span 
                    className="text-3xl lg:text-4xl"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                    }}
                  >
                    {category.icon}
                  </span>
                </motion.div>
              </div>

              {/* Label */}
              <span 
                className="text-xs lg:text-sm transition-colors whitespace-nowrap"
                style={{
                  color: isActive ? '#1F2937' : '#6B7280',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {category.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
