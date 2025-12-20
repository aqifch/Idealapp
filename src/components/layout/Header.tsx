import React, { useState } from "react";
import { Search, X, Bell, Menu, ShoppingCart, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../../data/mockData";
import { NotificationPanel, Notification } from "../notification/NotificationPanel";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onProductClick?: (product: Product) => void;
  onViewAllResults?: () => void;
  allProducts?: Product[];
  onSidebarClick?: () => void;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  cartCount?: number;
  wishlistCount?: number;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "delivery",
    title: "Order Delivered! 🎉",
    message: "Your order #1234 has been delivered successfully. Enjoy your meal!",
    time: "2 min ago",
    isNew: true,
  },
  {
    id: "2",
    type: "promo",
    title: "50% OFF on Burgers! 🍔",
    message: "Limited time offer! Get 50% discount on all burger combos today.",
    time: "1 hour ago",
    isNew: true,
  },
  {
    id: "3",
    type: "reward",
    title: "You've Earned Points! ⭐",
    message: "Congratulations! You've earned 50 reward points on your last order.",
    time: "3 hours ago",
    isNew: true,
  },
  {
    id: "4",
    type: "order",
    title: "Order Confirmed 📦",
    message: "Your order #1233 has been confirmed and will be ready in 15 minutes.",
    time: "5 hours ago",
    isNew: false,
  },
  {
    id: "5",
    type: "promo",
    title: "Free Delivery Weekend! 🚚",
    message: "Enjoy free delivery on all orders this weekend. Order now!",
    time: "1 day ago",
    isNew: false,
  },
];

export const Header = ({ onSearch, onProductClick, onViewAllResults, allProducts = [], onSidebarClick, onCartClick, onWishlistClick, cartCount = 0, wishlistCount = 0 }: HeaderProps) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const newNotificationsCount = notifications.filter((n) => n.isNew).length;

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    setSearchQuery("");
    setSearchResults([]);
    if (onSearch) {
      onSearch("");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const filtered = allProducts.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5)); // Show max 5 results
    } else {
      setSearchResults([]);
    }

    if (onSearch) {
      onSearch(query);
    }
  };

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    }
    handleCloseSearch();
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isNew: false }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationItemClick = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, isNew: false } : n
      )
    );
    // Close panel
    setIsNotificationOpen(false);
  };

  return (
    <>
      {/* Header - Sticky */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md mb-6"
      >
        <div className="container mx-auto max-w-7xl px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Sidebar Menu Icon */}
            <motion.button
              onClick={onSidebarClick}
              className="w-11 h-11 flex items-center justify-center transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <Menu className="w-6 h-6 text-yellow-500" />
            </motion.button>

            {/* Center - Brand Name */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="absolute left-1/2 -translate-x-1/2"
            >
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                IDEAL POINT
              </h1>
            </motion.div>

            {/* Right side icons */}
            <div className="flex items-center gap-3">
              {/* Search Icon */}
              <motion.button
                onClick={handleSearchClick}
                className="w-11 h-11 flex items-center justify-center transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Search className="w-6 h-6 text-yellow-500" />
              </motion.button>

              {/* Wishlist Icon */}
              <motion.button
                onClick={onWishlistClick}
                className="relative w-11 h-11 flex items-center justify-center transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.33, duration: 0.5 }}
              >
                <Heart className="w-6 h-6 text-yellow-500" />
                {wishlistCount > 0 && (
                  <>
                    {/* Badge with count */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                    >
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </motion.div>
                    {/* Pulsing ring */}
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full"
                    />
                  </>
                )}
              </motion.button>

              {/* Cart Icon */}
              <motion.button
                onClick={onCartClick}
                className="relative w-11 h-11 flex items-center justify-center transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.36, duration: 0.5 }}
              >
                <ShoppingCart className="w-6 h-6 text-yellow-500" />
                {cartCount > 0 && (
                  <>
                    {/* Badge with count */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-orange-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.div>
                    {/* Pulsing ring */}
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full"
                    />
                  </>
                )}
              </motion.button>

              {/* Notification Icon */}
              <motion.button
                onClick={handleNotificationClick}
                className="relative w-11 h-11 flex items-center justify-center transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.39, duration: 0.5 }}
              >
                <Bell className="w-6 h-6 text-yellow-500" />
                {newNotificationsCount > 0 && (
                  <>
                    {/* Badge with count */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                    >
                      {newNotificationsCount}
                    </motion.div>
                    {/* Pulsing ring */}
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full"
                    />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded Search Overlay */}
      <AnimatePresence>
        {isSearchExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleCloseSearch}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Search Panel */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="fixed top-0 left-0 right-0 z-50 bg-white shadow-2xl"
            >
              <div className="container mx-auto max-w-7xl px-4 md:px-6 py-6">
                {/* Search Bar */}
                <div className="flex items-center gap-3 mb-6">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <motion.input
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      type="text"
                      placeholder="Search for food..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      autoFocus
                      className="w-full h-14 pl-14 pr-4 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-yellow-400 focus:bg-white outline-none transition-all font-medium"
                    />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>

                  {/* Close Button */}
                  <motion.button
                    onClick={handleCloseSearch}
                    className="w-14 h-14 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <X className="w-6 h-6 text-gray-700" />
                  </motion.button>
                </div>

                {/* Search Results */}
                {searchQuery.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[60vh] overflow-y-auto"
                  >
                    {searchResults.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {searchResults.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleProductClick(product)}
                            className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-all group"
                          >
                            {/* Product Image */}
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg transition-all">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors">
                                {product.name}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {product.category}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs font-bold text-gray-900">
                                  Rs {product.price}
                                </span>
                              </div>
                            </div>

                            {/* Arrow */}
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <span className="text-yellow-600">→</span>
                            </div>
                          </motion.div>
                        ))}

                        {/* View All Button */}
                        {searchResults.length >= 5 && (
                          <motion.button
                            onClick={() => {
                              if (onViewAllResults) {
                                onViewAllResults();
                              }
                              handleCloseSearch();
                            }}
                            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold transition-all"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            View All Results
                          </motion.button>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-gray-500 font-medium">
                          No results found for "{searchQuery}"
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Try searching for something else
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Popular Searches (when empty) */}
                {searchQuery.trim().length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100"
                  >
                    <h3 className="font-bold text-gray-900 mb-3">Popular Searches</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Burger", "Pizza", "Chicken", "Fries", "Drinks"].map((term, index) => (
                        <motion.button
                          key={term}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.05, type: "spring" }}
                          onClick={() => {
                            setSearchQuery(term);
                            handleSearchChange({ target: { value: term } } as any);
                          }}
                          className="px-4 py-2 bg-white hover:bg-yellow-100 rounded-full text-sm font-bold text-gray-700 shadow-sm hover:shadow-md transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {term}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {isNotificationOpen && (
          <NotificationPanel
            notifications={notifications}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClose={() => setIsNotificationOpen(false)}
            onClearAll={handleClearAll}
            onNotificationItemClick={handleNotificationItemClick}
          />
        )}
      </AnimatePresence>
    </>
  );
};
