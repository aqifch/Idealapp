import React from "react";
import { motion } from "motion/react";
import { X, Package, Heart, User, Home, ShoppingBag, Phone, Mail } from "lucide-react";

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onMenuItemClick: (item: "wishlist" | "orders" | "profile" | "home") => void;
  storeSettings?: any;
  user?: any;
}

export const MenuSidebar = ({ isOpen, onClose, onMenuItemClick, storeSettings, user }: MenuSidebarProps) => {
  const handleItemClick = (item: "wishlist" | "orders" | "profile" | "home") => {
    onMenuItemClick(item);
    onClose();
  };

  const menuItems = [
    {
      id: "home" as const,
      icon: Home,
      label: "Home",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      id: "orders" as const,
      icon: Package,
      label: "My Orders",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: "wishlist" as const,
      icon: Heart,
      label: "My Wishlist",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      id: "profile" as const,
      icon: User,
      label: "My Profile",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />
      )}

      {/* Sidebar Panel */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-white">{storeSettings?.storeName || "IDEAL POINT"}</h2>
              <p className="text-xs text-white/80">{storeSettings?.tagline || "Fast Food Delivery"}</p>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>
          </div>

          {/* User Info */}
          {user ? (
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl p-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-orange-500">
                    {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-white truncate max-w-[180px]">{user.user_metadata?.name || 'User'}</p>
                <p className="text-xs text-white/80 truncate max-w-[180px]">{user.email}</p>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => handleItemClick("profile")}
              className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl p-3 cursor-pointer hover:bg-white/30 transition-colors"
            >
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="font-bold text-white">Guest User</p>
                <p className="text-xs text-white/80">Tap to login / sign up</p>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Quick Access
          </h3>
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 p-4 bg-white hover:bg-gray-50 border-2 border-gray-100 rounded-2xl transition-all group"
                >
                  <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-black text-gray-900">{item.label}</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-500 rounded-full flex items-center justify-center transition-all">
                    <span className="text-gray-400 group-hover:text-white font-bold">→</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-6 bg-gray-50 space-y-4">
          {storeSettings?.phone && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{storeSettings.phone}</span>
            </div>
          )}
          
          {storeSettings?.email && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium truncate">{storeSettings.email}</span>
            </div>
          )}
          
          <p className="text-xs text-center text-gray-400 pt-2">
            {storeSettings?.storeName || "App"} v1.0.0
          </p>
        </div>
      </motion.div>
    </>
  );
};
