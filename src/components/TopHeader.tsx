import React, { useState } from "react";
import { ShoppingCart, Bell, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NotificationPanel } from "./NotificationPanel";
import { useNotifications } from "../context/NotificationContext";

interface TopHeaderProps {
  onCartClick: () => void;
  onWishlistClick?: () => void;
  cartCount: number;
  wishlistCount?: number;
  onNotificationItemClick?: (notification: any) => void;
  storeSettings?: any;
}

export const TopHeader = ({ 
  onCartClick, 
  onWishlistClick,
  cartCount,
  wishlistCount = 0,
  onNotificationItemClick,
  storeSettings
}: TopHeaderProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotifications();

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleNotificationItemClick = async (notification: any) => {
    if (onNotificationItemClick) {
      onNotificationItemClick(notification);
    } else {
      await markAsRead(notification.id);
    }
    setIsNotificationOpen(false);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Main Header */}
        <div 
          className="px-5 lg:px-8 py-4 lg:py-5 flex items-center justify-between backdrop-blur-md border-b max-w-[1600px] lg:mx-auto"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Logo Section */}
          <div className="flex items-center gap-2 lg:gap-3">
            <div 
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
              }}
            >
              <span className="text-2xl lg:text-3xl">🍔</span>
            </div>
            <div>
              <h1 className="font-bold text-lg lg:text-xl text-gray-900 leading-none">
                {storeSettings?.storeName || "IDEAL POINT"}
              </h1>
              <p className="text-xs lg:text-sm text-gray-500 leading-none mt-0.5">{storeSettings?.tagline || "Fast Food"}</p>
            </div>
          </div>

          {/* Right Side - Wishlist, Cart & Notification */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Wishlist Button */}
            <motion.button
              onClick={onWishlistClick}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.1 }}
              className="relative p-2 lg:p-2.5"
            >
              <Heart className="w-6 h-6 lg:w-7 lg:h-7 text-orange-500" />
              {wishlistCount > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] lg:min-w-[20px] h-[18px] lg:h-[20px] px-1 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: '#EF4444',
                  }}
                >
                  <span className="text-white text-xs font-bold">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                </motion.div>
              )}
            </motion.button>

            {/* Cart Button */}
            <motion.button
              onClick={onCartClick}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.1 }}
              className="relative p-2 lg:p-2.5"
            >
              <ShoppingCart className="w-6 h-6 lg:w-7 lg:h-7 text-orange-500" />
              {cartCount > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] lg:min-w-[20px] h-[18px] lg:h-[20px] px-1 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: '#FF9F40',
                  }}
                >
                  <span className="text-white text-xs font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                </motion.div>
              )}
            </motion.button>

            {/* Notification Button */}
            <motion.button
              onClick={handleNotificationClick}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.1 }}
              className="relative p-2 lg:p-2.5"
            >
              <Bell className="w-6 h-6 lg:w-7 lg:h-7 text-orange-500" />
              {unreadCount > 0 && (
                <>
                  {/* Badge with count */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[18px] lg:min-w-[20px] h-[18px] lg:h-[20px] px-1 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: '#EF4444',
                    }}
                  >
                    <span className="text-white text-xs font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </motion.div>
                  {/* Pulsing ring */}
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-[18px] lg:w-[20px] h-[18px] lg:h-[20px] bg-red-500 rounded-full"
                  />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={markAllAsRead}
        onClearAll={clearAll}
        onNotificationClick={handleNotificationItemClick}
      />
    </>
  );
};
