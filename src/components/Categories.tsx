import React, { useState } from "react";
import { categories } from "../data/mockData";
import { motion } from "motion/react";

interface CategoriesProps {
  onCategoryClick?: (categoryId: string) => void;
}

export const Categories = ({ onCategoryClick }: CategoriesProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleClick = (categoryId: string) => {
    // Unselect if clicking the same category
    const newActive = activeCategory === categoryId ? null : categoryId;
    setActiveCategory(newActive);
    
    // Navigate to products page with category filter
    if (onCategoryClick) {
      onCategoryClick(categoryId);
    }
  };

  return (
    <div className="w-full">
      <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-2 px-1">
        {categories.map((category, index) => {
          const isActive = category.id === activeCategory;
          return (
            <motion.button 
              key={category.id} 
              onClick={() => handleClick(category.id)}
              className="flex flex-col items-center gap-2 shrink-0 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Circular Icon Container */}
              <motion.div
                className={`
                  w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg ring-2 ring-yellow-200' 
                    : 'bg-white shadow-md group-hover:shadow-xl border border-gray-100'
                  }
                `}
                whileHover={{ y: -4, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {/* Icon/Emoji */}
                <span className={`text-3xl md:text-4xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {getCategoryEmoji(category.name)}
                </span>
              </motion.div>

              {/* Label Below Circle */}
              <span className={`
                text-xs md:text-sm font-bold transition-colors duration-300 text-center
                ${isActive 
                  ? 'text-yellow-600' 
                  : 'text-gray-700 group-hover:text-yellow-600'
                }
              `}>
                {category.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

function getCategoryEmoji(name: string): string {
  const emojiMap: { [key: string]: string } = {
    "Burgers": "🍔",
    "Pizza": "🍕",
    "Drinks": "🥤",
    "Sides": "🍟",
    "Desserts": "🍰",
    "Chicken": "🍗",
  };
  return emojiMap[name] || "🍽️";
}
