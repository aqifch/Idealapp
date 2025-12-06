import React from "react";
import { motion } from "motion/react";
import { Product } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Flame, Star, Clock } from "lucide-react";

interface DesktopFeaturedDealsProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export const DesktopFeaturedDeals = ({ products, onProductClick }: DesktopFeaturedDealsProps) => {
  // Filter only popular products for featured deals
  const featuredDeals = products
    .filter(p => p.isPopular === true)
    .slice(0, 3);

  const dealTypes = [
    { icon: Flame, label: "HOT DEAL", color: "#FF9F40" },
    { icon: Star, label: "BEST SELLER", color: "#FFC107" },
    { icon: Clock, label: "LIMITED TIME", color: "#FF9F40" },
  ];

  return (
    <div className="w-full py-12">
      <div className="text-center mb-8">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Trending Now
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          Don't miss out on these amazing offers!
        </motion.p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {featuredDeals.map((product, index) => {
          const dealType = dealTypes[index];
          const DealIcon = dealType.icon;
          const discount = 20 + (index * 10); // 20%, 30%, 40%
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => onProductClick(product)}
              className="relative cursor-pointer rounded-3xl overflow-hidden backdrop-blur-xl group"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              {/* Deal Badge */}
              <div 
                className="absolute top-4 left-4 z-20 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm"
                style={{
                  background: 'rgba(0, 0, 0, 0.75)',
                }}
              >
                <DealIcon className="w-4 h-4" style={{ color: dealType.color }} />
                <span className="text-white text-xs font-bold">{dealType.label}</span>
              </div>

              {/* Discount Badge */}
              <div 
                className="absolute top-4 right-4 z-20 w-16 h-16 rounded-full flex flex-col items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                  boxShadow: '0 4px 16px rgba(255, 159, 64, 0.4)',
                }}
              >
                <span className="text-white font-bold text-lg leading-none">{discount}%</span>
                <span className="text-white text-xs leading-none mt-0.5">OFF</span>
              </div>

              {/* Image */}
              <div 
                className="relative w-full overflow-hidden"
                style={{ height: "240px" }}
              >
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Price Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: '#FF9F40' }}
                    >
                      {product.sizes && product.sizes.length > 0 && <span className="text-base font-normal text-gray-500 mr-1">From</span>}
                      Rs {product.price.toFixed(0)}
                    </span>
                    <span className="text-gray-400 line-through text-sm">
                      Rs {(product.price * 1.5).toFixed(0)}
                    </span>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(255, 159, 64, 0.3)',
                    }}
                  >
                    Order Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
