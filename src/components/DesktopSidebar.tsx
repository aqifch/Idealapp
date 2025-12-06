import React from "react";
import { motion } from "motion/react";
import { Home, ShoppingCart, Heart, User, Package, MapPin, LogOut, Phone, Mail } from "lucide-react";

interface DesktopSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  cartCount: number;
  wishlistCount: number;
  storeSettings?: any;
}

export const DesktopSidebar = ({ activeView, onViewChange, cartCount, wishlistCount, storeSettings }: DesktopSidebarProps) => {
  const menuItems = [
    { id: "home", icon: Home, label: "Home", badge: null },
    { id: "cart", icon: ShoppingCart, label: "Cart", badge: cartCount },
    { id: "wishlist", icon: Heart, label: "Wishlist", badge: null },
    { id: "orders", icon: Package, label: "Orders", badge: null },
    { id: "savedAddresses", icon: MapPin, label: "Addresses", badge: null },
    { id: "account", icon: User, label: "Account", badge: null },
  ];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-64 backdrop-blur-xl z-40"
      style={{
        background: 'rgba(255, 255, 255, 0.5)',
        borderRight: '1px solid rgba(255, 159, 64, 0.2)',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Logo Section */}
      <div className="p-6 pb-4">
        <div 
          className="rounded-2xl p-4 backdrop-blur-xl text-center"
          style={{
            background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
            boxShadow: '0 4px 20px rgba(255, 159, 64, 0.3)',
          }}
        >
          <div className="text-3xl mb-2">🍔</div>
          <h1 className="font-black text-white">{storeSettings?.storeName || "Food Hub"}</h1>
          <p className="text-xs text-white/90 mt-1">{storeSettings?.tagline || "Fast & Delicious"}</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative"
              style={{
                background: isActive 
                  ? 'rgba(255, 159, 64, 0.2)' 
                  : 'transparent',
                border: isActive 
                  ? '1px solid rgba(255, 159, 64, 0.3)' 
                  : '1px solid transparent',
              }}
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                  style={{
                    background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                  }}
                />
              )}

              {/* Icon */}
              <div 
                className="relative flex-shrink-0"
                style={{
                  color: isActive ? '#F97316' : '#6B7280',
                }}
              >
                <Icon 
                  className={`w-5 h-5 transition-all ${
                    item.id === 'wishlist' && wishlistCount > 0
                      ? 'fill-red-500 text-red-500'
                      : ''
                  }`}
                />
                {item.badge !== null && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{
                      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                      color: 'white',
                      padding: '0 4px',
                    }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <span 
                className="font-bold text-sm"
                style={{
                  color: isActive ? '#F97316' : '#374151',
                }}
              >
                {item.label}
              </span>

              {/* Hover Effect */}
              {!isActive && (
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: 'rgba(255, 159, 64, 0.05)',
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 pt-2 space-y-3">
        {/* Contact Info */}
        {(storeSettings?.phone || storeSettings?.email) && (
            <div className="px-2 space-y-2">
                {storeSettings?.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        <span>{storeSettings.phone}</span>
                    </div>
                )}
                {storeSettings?.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{storeSettings.email}</span>
                    </div>
                )}
            </div>
        )}

        {/* Promo Card */}
        <div 
          className="rounded-xl p-3 backdrop-blur-xl"
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <div className="text-2xl mb-1">🎉</div>
          <p className="text-xs font-bold text-gray-900">Get 20% OFF</p>
          <p className="text-xs text-gray-600">On your first order!</p>
        </div>

        {/* Logout Button */}
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all hover:scale-102"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#DC2626',
          }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </motion.div>
  );
};
