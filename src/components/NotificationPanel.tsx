import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Package, ShoppingCart, Star, Gift, Clock, Trash2, CheckCheck } from "lucide-react";
import { Notification } from "../context/NotificationContext";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onClearAll?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllAsRead?: () => void;
  onNotificationItemClick?: (notification: Notification) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "order":
      return <Package className="w-5 h-5 text-orange-600" />;
    case "promo":
      return <Gift className="w-5 h-5 text-amber-600" />;
    case "reward":
      return <Star className="w-5 h-5 text-yellow-500" />;
    case "delivery":
      return <ShoppingCart className="w-5 h-5 text-green-600" />;
    default:
      return <Package className="w-5 h-5 text-gray-600" />;
  }
};

const getNotificationBgColor = (type: string) => {
  switch (type) {
    case "order":
      return "from-orange-50 to-orange-100";
    case "promo":
      return "from-amber-50 to-orange-100";
    case "reward":
      return "from-yellow-50 to-amber-100";
    case "delivery":
      return "from-green-50 to-green-100";
    default:
      return "from-gray-50 to-gray-100";
  }
};

export const NotificationPanel = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onNotificationClick,
  onMarkAllAsRead,
  onNotificationItemClick,
}: NotificationPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Notification Panel - Slide from Right */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md shadow-2xl z-50 overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(135deg, #FFF5E6 0%, #FFE8CC 50%, #FFDBB8 100%)'
            }}
          >
            {/* Header - Glass Morphism */}
            <div className="px-5 py-6 backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl text-gray-800">
                      Notifications
                    </h2>
                    <p className="text-sm text-gray-600">
                      {notifications.filter((n) => n.isNew).length} new
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 border border-white/60 shadow-lg flex items-center justify-center transition-all hover:shadow-xl"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-700" />
                </motion.button>
              </div>

              {/* Action Buttons */}
              {notifications.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <motion.button
                    onClick={onMarkAllAsRead}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2.5 rounded-xl backdrop-blur-xl bg-white/60 border border-white/60 shadow-md text-sm text-gray-700 flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark All Read
                  </motion.button>
                  
                  <motion.button
                    onClick={onClearAll}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2.5 rounded-xl backdrop-blur-xl bg-gradient-to-r from-red-400/80 to-rose-500/80 border border-white/60 shadow-md text-sm text-white flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </motion.button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onNotificationClick?.(notification)}
                      className="relative rounded-2xl p-4 backdrop-blur-xl bg-white/60 border border-white/60 shadow-lg cursor-pointer transition-all hover:shadow-xl group overflow-hidden"
                    >
                      {/* Subtle gradient glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-amber-400/5 pointer-events-none" />
                      
                      {/* New Badge */}
                      {notification.isNew && (
                        <div className="absolute top-3 right-3 z-10">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                            className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg"
                          >
                            {/* Pulse Effect */}
                            <motion.div
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 bg-red-500 rounded-full"
                            />
                          </motion.div>
                        </div>
                      )}

                      <div className="relative flex items-start gap-3">
                        {/* Icon */}
                        {notification.imageUrl ? (
                          <motion.div
                            className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-all"
                            whileHover={{ scale: 1.05 }}
                          >
                            <img 
                              src={notification.imageUrl} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getNotificationBgColor(
                              notification.type
                            )} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all flex-shrink-0`}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                          >
                            {notification.icon || getNotificationIcon(notification.type)}
                          </motion.div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm text-gray-800 mb-1 pr-6">
                            {notification.title}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Time */}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(notification.timestamp).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hover Arrow Indicator */}
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md"
                      >
                        <span className="text-white text-sm">→</span>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center justify-center h-full p-8"
                >
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-28 h-28 rounded-3xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl border border-white/60 shadow-xl flex items-center justify-center mb-6"
                  >
                    <Gift className="w-14 h-14 text-orange-400" />
                  </motion.div>
                  <h3 className="text-xl text-gray-800 mb-2">
                    No Notifications
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    You're all caught up! We'll notify you when something new arrives.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
