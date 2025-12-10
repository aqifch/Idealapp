import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Home, UtensilsCrossed, Tag, User, ShoppingCart, Heart, Bell, ChevronDown, Package, MapPin, Lock, HelpCircle, FileText, LogOut, Shield, LogIn } from "lucide-react";
import { toast } from "sonner";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { NotificationPanel } from "./NotificationPanel";
import { useNotifications } from "../context/NotificationContext";
import { usePermissions } from "../hooks/usePermissions";

interface DesktopNavBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  cartCount: number;
  wishlistCount: number;
  onAdminAccess?: () => void;
  user?: SupabaseUser | null;
  onNotificationItemClick?: (notification: any) => void;
  storeSettings?: any;
}

export const DesktopNavBar = ({ 
  activeView, 
  onViewChange, 
  cartCount, 
  wishlistCount,
  onAdminAccess,
  user,
  onNotificationItemClick,
  storeSettings
}: DesktopNavBarProps) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const { role, permissions } = usePermissions(user || null);
  // Check if user has any admin privileges
  const hasAdminAccess = role === 'admin' || role === 'manager' || role === 'staff' || role === 'support';

  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotifications();

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "products", label: "Menu", icon: UtensilsCrossed },
  ];

  const accountMenuItems = [
    { id: "account", label: "My Account", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "savedAddresses", label: "Addresses", icon: MapPin },
  ];

  const handleAdminAccess = () => {
    if (hasAdminAccess) {
      toast.success(`Welcome back, ${user?.user_metadata?.name || 'Staff'}! 🛡️`);
      onAdminAccess?.();
    } else {
      toast.error("Unauthorized access");
    }
  };

  return (
    <>
    <div 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange("home")}>
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
            }}
          >
            <span className="text-3xl">🍔</span>
          </div>
          <div>
            <h1 className="font-bold text-2xl text-gray-900 leading-none">
              {storeSettings?.storeName || "IDEAL POINT"}
            </h1>
            <p className="text-sm text-gray-500 leading-none mt-1">{storeSettings?.tagline || "Fast Food"}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                style={{
                  background: isActive ? 'rgba(255, 159, 64, 0.15)' : 'transparent',
                  color: isActive ? '#FF9F40' : '#6B7280',
                }}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 mx-6 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">

          {/* Notifications */}
          <motion.button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center"
                  style={{ background: '#EF4444' }}
                >
                  <span className="text-white text-xs font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1 right-1 w-[18px] h-[18px] bg-red-500 rounded-full"
                />
              </>
            )}
          </motion.button>

          {/* Wishlist */}
          <motion.button
            onClick={() => onViewChange("wishlist")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5"
          >
            <Heart 
              className={`w-6 h-6 transition-all ${
                wishlistCount > 0 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-600'
              }`}
            />
          </motion.button>

          {/* Cart Button - Prominent */}
          <motion.button
            onClick={() => onViewChange("cart")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-6 py-2.5 rounded-xl font-bold text-sm backdrop-blur-md flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(255, 159, 64, 0.3)',
            }}
          >
            <ShoppingCart className="w-5 h-5" />
            Cart
            {cartCount > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 min-w-[24px] h-[24px] px-1.5 rounded-full flex items-center justify-center"
                style={{ background: '#EF4444', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)' }}
              >
                <span className="text-white text-xs font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              </motion.div>
            )}
          </motion.button>

          {/* Account Dropdown or Login */}
          {user ? (
            <div className="relative">
              <motion.button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: showAccountMenu ? 'rgba(255, 159, 64, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                  color: '#374151',
                }}
              >
                <User className="w-5 h-5" />
                Account
                <ChevronDown className={`w-4 h-4 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showAccountMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAccountMenu(false)}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-64 rounded-2xl backdrop-blur-xl overflow-hidden z-50"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                      }}
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                            }}
                          >
                            <span className="text-white font-bold uppercase">{user.email?.[0] || 'U'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{user.user_metadata?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {accountMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <motion.button
                              key={item.id}
                              onClick={() => {
                                onViewChange(item.id);
                                setShowAccountMenu(false);
                              }}
                              whileHover={{ backgroundColor: 'rgba(255, 159, 64, 0.1)' }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                            >
                              <Icon className="w-5 h-5 text-orange-500" />
                              <span className="font-bold text-gray-900 text-sm">{item.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200 p-2">
                        <motion.button
                          onClick={() => {
                            setShowAccountMenu(false);
                            // We trigger a view change to 'logout' which needs to be handled by App.tsx or AccountView
                            // But for now let's just redirect to 'account' where they can logout, or handle it here?
                            // The NavBar doesn't have logout logic. 
                            // Let's send them to 'account' and they can click logout there, OR we update App.tsx to handle 'logout' action?
                            // Better: Call a prop? But I don't have a onLogout prop. 
                            // I'll just use onViewChange("logout") and handle it in App.tsx
                            onViewChange("logout"); 
                          }}
                          whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all"
                        >
                          <LogOut className="w-5 h-5 text-red-600" />
                          <span className="font-bold text-red-600 text-sm">Logout</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              onClick={() => onViewChange("login")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: 'rgba(255, 159, 64, 0.15)',
                color: '#FF9F40',
              }}
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </motion.button>
          )}
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
        onNotificationClick={async (notification) => {
          // Call parent handler if provided
          if (onNotificationItemClick) {
            onNotificationItemClick(notification);
          } else {
            // Fallback default behavior
            await markAsRead(notification.id);
          }
          setIsNotificationOpen(false);
        }}
      />
    </>
  );
};
