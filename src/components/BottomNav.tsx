import React, { useRef, useEffect } from "react";
import { Home, Package, ShoppingCart, User } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../context/CartContext";

interface BottomNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const BottomNav = ({ activeView, onViewChange }: BottomNavProps) => {
  const { getTotalItems, setCartIconRef, cartAnimation } = useCart();
  const totalItems = getTotalItems();
  const cartIconRef = useRef<HTMLDivElement>(null);

  // Register cart icon reference with context
  useEffect(() => {
    if (cartIconRef.current) {
      setCartIconRef(cartIconRef);
    }
  }, [setCartIconRef]);

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "products", label: "Products", icon: Package },
    { id: "cart", label: "Cart", icon: ShoppingCart },
    { id: "profile", label: "Account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 shadow-lg">
      <div className="flex items-center justify-around h-16 relative">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              {/* Icon with ref for cart */}
              <div ref={item.id === "cart" ? cartIconRef : null}>
                <Icon
                  className={`w-6 h-6 mb-1 transition-colors ${
                    isActive ? "text-yellow-500" : "text-gray-500"
                  }`}
                />
              </div>
              
              {/* Label */}
              <span
                className={`text-xs font-medium transition-all ${
                  isActive ? "text-yellow-600" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator - Yellow Bar at Bottom */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500 rounded-t-full"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Cart Badge with Enhanced Animation */}
              {item.id === "cart" && totalItems > 0 && (
                <motion.span 
                  key={totalItems}
                  className="absolute top-2 right-1/4 min-w-[20px] h-5 px-1 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: cartAnimation === "bounce" ? [0, 1.4, 1] : [0, 1.3, 1],
                    rotate: cartAnimation === "shake" ? [0, -15, 15, -10, 10, 0] : 0,
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 15,
                    duration: cartAnimation === "shake" ? 0.6 : 0.4,
                  }}
                >
                  <motion.span
                    key={`count-${totalItems}`}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {totalItems}
                  </motion.span>
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};