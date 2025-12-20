import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ShoppingBag, 
  Heart, 
  Wallet, 
  MapPin, 
  Bell, 
  User, 
  Globe, 
  MessageCircle, 
  Star, 
  Shield, 
  Info, 
  Share2, 
  LogOut,
  ChevronRight,
  Edit2,
  Package
} from "lucide-react";
import { toast } from "sonner";

import { User as SupabaseUser } from "@supabase/supabase-js";

interface AccountViewProps {
  onNavigateToOrders: () => void;
  onNavigateToWishlist: () => void;
  onNavigateToEditProfile: () => void;
  onNavigateToAddresses: () => void;
  onLogout?: () => void;
  onNavigateToLogin?: () => void;
  orderCount?: number;
  wishlistCount?: number;
  user?: SupabaseUser | null;
  storeSettings?: any;
}

export const AccountView = ({ 
  onNavigateToOrders, 
  onNavigateToWishlist,
  onNavigateToEditProfile,
  onNavigateToAddresses,
  onLogout,
  onNavigateToLogin,
  orderCount = 0,
  wishlistCount = 0,
  user,
  storeSettings
}: AccountViewProps) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    toast.success("Logged out successfully! 👋");
    setShowLogoutConfirm(false);
    onLogout?.();
  };

  const handleMenuClick = (item: string) => {
    if (item === "orders") {
      onNavigateToOrders();
    } else if (item === "wishlist") {
      onNavigateToWishlist();
    } else if (item === "Addresses") {
      onNavigateToAddresses();
    } else {
      toast.info(`${item} - Coming soon! 🚀`);
    }
  };

  return (
    <div 
      className="min-h-screen pb-24 lg:pb-12 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%)',
      }}
    >
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute"
          style={{
            top: '-10%',
            right: '-5%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255, 159, 64, 0.3) 0%, rgba(255, 159, 64, 0.1) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute"
          style={{
            bottom: '10%',
            left: '-10%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(255, 193, 7, 0.25) 0%, rgba(255, 193, 7, 0.1) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl lg:max-w-5xl lg:mx-auto">
        {/* Profile Header - Glass Morphism */}
        <div className="px-6 lg:px-8 pt-8 lg:pt-12 pb-6 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl p-6 backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="relative"
              >
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center backdrop-blur-xl"
                  style={{
                    background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                    boxShadow: '0 4px 15px rgba(255, 159, 64, 0.3)',
                  }}
                >
                  <span className="text-3xl font-black text-white uppercase">{user?.email?.[0] || 'U'}</span>
                </div>
                {/* Online Badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
              </motion.div>

              {/* User Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1"
              >
                <h2 className="text-xl font-black text-gray-900 mb-0.5">{user?.user_metadata?.name || 'Guest'}</h2>
                <p className="text-sm text-gray-600">{user?.email || 'No email'}</p>
                <p className="text-xs text-gray-500">{user?.phone || 'No phone number'}</p>
              </motion.div>

              {/* Login Button - Only show when not logged in */}
              {!user && (
                <motion.button
                  onClick={() => onNavigateToLogin?.()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-10 px-4 rounded-xl flex items-center justify-center backdrop-blur-xl"
                  style={{
                    background: 'rgba(255, 159, 64, 0.2)',
                    border: '1px solid rgba(255, 159, 64, 0.3)',
                  }}
                >
                  <span className="text-sm font-bold text-orange-600">Login</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Cards */}
        <div className="px-6 lg:px-8 mb-6 lg:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 lg:grid-cols-2 gap-3 lg:gap-4"
          >
            {/* Orders Card */}
            <motion.button
              onClick={() => handleMenuClick("orders")}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl lg:rounded-3xl p-4 lg:p-6 backdrop-blur-xl transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <div 
                className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 lg:mb-3"
                style={{
                  background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                }}
              >
                <ShoppingBag className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <p className="text-2xl lg:text-3xl font-black text-gray-900">{orderCount}</p>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">Total Orders</p>
            </motion.button>

            {/* Wishlist Card */}
            <motion.button
              onClick={() => handleMenuClick("wishlist")}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl lg:rounded-3xl p-4 lg:p-6 backdrop-blur-xl transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <div 
                className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 lg:mb-3"
                style={{
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)',
                }}
              >
                <Heart className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <p className="text-2xl lg:text-3xl font-black text-gray-900">{wishlistCount}</p>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">Saved Items</p>
            </motion.button>

            {/* Wallet Card - Hide on Desktop (web doesn't need wallet) */}
            <motion.button
              onClick={() => toast.info("Wallet - Coming soon! 💰")}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden rounded-2xl p-4 backdrop-blur-xl transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                }}
              >
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <p className="text-lg font-black text-gray-900">Rs 0</p>
              <p className="text-xs text-gray-600 mt-1">Wallet</p>
            </motion.button>
          </motion.div>
        </div>

        {/* Menu Sections */}
        <div className="px-6 lg:px-8 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
          {/* MY ACCOUNT Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 px-2">
              My Account
            </h3>
            <div 
              className="rounded-2xl overflow-hidden backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <MenuItem
                icon={<Package className="w-5 h-5 text-orange-500" />}
                title="My Orders"
                subtitle={`${orderCount} orders placed`}
                badge={orderCount}
                onClick={() => handleMenuClick("orders")}
              />
              <MenuItem
                icon={<Heart className="w-5 h-5 text-red-500" />}
                title="Wishlist"
                subtitle={`${wishlistCount} items saved`}
                badge={wishlistCount}
                onClick={() => handleMenuClick("wishlist")}
              />
              <MenuItem
                icon={<MapPin className="w-5 h-5 text-green-600" />}
                title="Saved Addresses"
                subtitle="Manage delivery locations"
                onClick={() => handleMenuClick("Addresses")}
                isLast
              />
            </div>
          </motion.div>

          {/* SUPPORT Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 px-2">
              Support
            </h3>
            <div 
              className="rounded-2xl overflow-hidden backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <MenuItem
                icon={<MessageCircle className="w-5 h-5 text-green-600" />}
                title="Contact Support"
                subtitle="We're here to help"
                onClick={() => handleMenuClick("Contact Support")}
                isLast
              />
            </div>
          </motion.div>

          {/* ABOUT Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 px-2">
              About
            </h3>
            <div 
              className="rounded-2xl overflow-hidden backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <MenuItem
                icon={<Shield className="w-5 h-5 text-green-600" />}
                title="Privacy Policy"
                onClick={() => handleMenuClick("Privacy Policy")}
              />
              <MenuItem
                icon={<Info className="w-5 h-5 text-orange-500" />}
                title={`About ${storeSettings?.storeName || "IDEAL POINT"}`}
                subtitle="Learn more about us"
                onClick={() => handleMenuClick("About Us")}
                isLast
              />
            </div>
          </motion.div>

          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => setShowLogoutConfirm(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full lg:col-span-2 rounded-2xl lg:rounded-3xl py-4 lg:py-5 font-bold flex items-center justify-center gap-2 backdrop-blur-xl transition-all"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              color: '#DC2626',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)',
            }}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>

          {/* Footer - Desktop Only */}
          <p className="hidden lg:block lg:col-span-2 text-center text-sm text-gray-500 pb-4 pt-6">
            © 2024 {storeSettings?.storeName || "IDEAL POINT"}. All rights reserved.
          </p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowLogoutConfirm(false)}
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:w-96 z-50 rounded-3xl p-6 backdrop-blur-xl"
            style={{
              background: 'rgba(255, 248, 225, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="text-center mb-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                }}
              >
                <LogOut className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Logout</h3>
              <p className="text-gray-600">Are you sure you want to logout?</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowLogoutConfirm(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-xl font-bold transition-all backdrop-blur-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  color: '#374151',
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-xl font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                }}
              >
                Logout
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

// Menu Item Component
interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: number;
  onClick: () => void;
  isLast?: boolean;
}

const MenuItem = ({ icon, title, subtitle, badge, onClick, isLast }: MenuItemProps) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ 
        backgroundColor: "rgba(255, 159, 64, 0.08)",
      }}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-4 p-4 text-left transition-all ${
        !isLast ? "border-b border-white/30" : ""
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-gray-900">{title}</p>
          {badge !== undefined && badge > 0 && (
            <span 
              className="px-2 py-0.5 text-xs font-bold rounded-full"
              style={{
                background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                color: 'white',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </motion.button>
  );
};
