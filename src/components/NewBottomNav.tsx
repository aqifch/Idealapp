import React from "react";
import { motion } from "motion/react";
import { Home, Grid3x3, ShoppingBag, ShoppingCart, User } from "lucide-react";

interface NewBottomNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
  cartCount?: number;
}

export const NewBottomNav = ({ activeView, onViewChange, cartCount = 0 }: NewBottomNavProps) => {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "products", icon: Grid3x3, label: "Menu" },
    { id: "orders", icon: ShoppingBag, label: "Orders" },
    { id: "account", icon: User, label: "Profile" },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: 'linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className="relative flex flex-col items-center gap-1 py-2 px-3 min-w-[60px]"
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Icon Container */}
                <div className="relative">
                  {/* Active Background Glow */}
                  {isActive && (
                    <motion.div
                      layoutId="navGlow"
                      className="absolute -inset-2 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 159, 64, 0.15) 0%, rgba(255, 183, 77, 0.15) 100%)',
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Icon Wrapper */}
                  <motion.div
                    className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: isActive 
                        ? 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)' 
                        : 'transparent',
                      boxShadow: isActive ? '0 4px 16px rgba(255, 159, 64, 0.3)' : 'none',
                    }}
                    animate={{
                      scale: isActive ? 1 : 0.9,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon
                      className="transition-all duration-200"
                      size={22}
                      style={{
                        color: isActive ? '#FFFFFF' : '#9CA3AF',
                        strokeWidth: isActive ? 2.5 : 2,
                      }}
                    />
                    
                    {/* Badge */}
                    {item.badge && item.badge > 0 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center"
                        style={{
                          background: '#FFB300',
                          boxShadow: '0 2px 8px rgba(255, 179, 0, 0.4)',
                        }}
                      >
                        <span 
                          className="font-bold leading-none"
                          style={{
                            color: '#1F2937',
                            fontSize: '10px',
                          }}
                        >
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Label */}
                <motion.span
                  className="text-xs transition-all duration-200"
                  style={{
                    color: isActive ? '#1F2937' : '#9CA3AF',
                    fontWeight: isActive ? 600 : 500,
                  }}
                  animate={{
                    y: isActive ? 0 : 2,
                  }}
                >
                  {item.label}
                </motion.span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-0.5 left-1/2 w-1 h-1 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                      x: '-50%',
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
