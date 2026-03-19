import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Product } from "./data/mockData";
import { CartProvider, useCart } from "./context/CartContext";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";
import { ShopProvider, ShopContextType } from "./context/ShopContext";
import { ProductDetailModal } from "./components/product/ProductDetailModal";
import { AddToCartToast } from "./components/cart/AddToCartToast";
import { EnhancedFlyingProduct } from "./components/cart/EnhancedFlyingProduct";
import { AnimatePresence } from "motion/react";
import { Toaster } from "./components/ui/sonner";

// Layout Components
import { TopHeader } from "./components/layout/TopHeader";
import { NewBottomNav } from "./components/layout/NewBottomNav";
import { MenuSidebar } from "./components/layout/MenuSidebar";
import { OrdersSidebar } from "./components/order/OrdersSidebar";
import { DesktopNavBar } from "./components/layout/DesktopNavBar";

// Routes
import { AppRoutes } from "./routes";

// Hooks
import { useAuth } from "./hooks/useAuth";
import { useWishlistStore } from "./store/useWishlistStore";
import { useSettingsStore } from "./store/useSettingsStore";

import { supabase } from "./config/supabase";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const wishlistItems = useWishlistStore(state => state.wishlistItems);
  const storeSettings = useSettingsStore(state => state.storeSettings);

  // UI State — stays in AppContent (not data logic)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuSidebarOpen, setIsMenuSidebarOpen] = useState(false);
  const [isOrdersSidebarOpen, setIsOrdersSidebarOpen] = useState(false);

  const currentPath = location.pathname;
  const isAdminRoute = currentPath.startsWith('/admin');

  const {
    flyingProducts,
    removeFlyingProduct,
    showToast,
    toastProductName,
    setShowToast,
    cartItems,
  } = useCart();

  const { markAsRead } = useNotifications();

  // Initialize Zustand stores
  React.useEffect(() => {
    import('./store/useProductStore').then(m => m.useProductStore.getState().initialize());
    import('./store/useCategoryStore').then(m => m.useCategoryStore.getState().initialize());
    import('./store/useDealStore').then(m => m.useDealStore.getState().initialize());
    import('./store/useBannerStore').then(m => m.useBannerStore.getState().initialize());
    import('./store/useOrderStore').then(m => m.useOrderStore.getState().initialize());
    import('./store/useWishlistStore').then(m => m.useWishlistStore.getState().initialize());
    import('./store/useSettingsStore').then(m => m.useSettingsStore.getState().initialize());
  }, []);

  // UI Handlers
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const handleViewChange = async (view: string) => {
    if (view === "logout") {
      await supabase.auth.signOut();
      navigate("/");
      return;
    }

    const routeMap: Record<string, string> = {
      "home": "/",
      "products": "/products",
      "cart": "/cart",
      "checkout": "/checkout",
      "orderSuccess": "/order-success",
      "account": "/account",
      "orders": "/orders",
      "wishlist": "/wishlist",
      "editProfile": "/edit-profile",
      "savedAddresses": "/saved-addresses",
      "login": "/login",
      "register": "/register",
      "admin": "/admin"
    };

    const route = routeMap[view] || "/";
    navigate(route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategorySelect = (categoryName: string) => {
    const mappedCategory = categoryName === "Fries" ? "Sides" : categoryName;
    setSelectedCategory(mappedCategory);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleMenuItemClick = (item: "wishlist" | "orders" | "profile" | "home") => {
    setIsMenuSidebarOpen(false);
    if (item === "wishlist") navigate("/wishlist");
    else if (item === "orders") setIsOrdersSidebarOpen(true);
    else if (item === "profile") navigate("/account");
    else if (item === "home") navigate("/");
  };

  const handleNotificationInteraction = async (notification: any) => {
    await markAsRead(notification.id);
    if (notification.productId) {
      import('./store/useProductStore').then(m => {
        const product = m.useProductStore.getState().products.find(p => p.id === notification.productId);
        if (product) handleProductClick(product);
      });
    } else if (notification.dealId) {
      navigate('/');
    }
  };

  return (
    <ShopProvider>
      <div
        className="min-h-screen font-sans text-gray-900 relative"
        style={{ background: '#FFF8F0' }}
      >
        {/* Desktop Navigation Bar */}
        <div className="hidden lg:block">
          {!isAdminRoute && (
            <DesktopNavBar
              activeView={currentPath}
              onViewChange={handleViewChange}
              cartCount={cartItems.length}
              wishlistCount={wishlistItems.length}
              onAdminAccess={() => navigate('/admin')}
              onNotificationItemClick={handleNotificationInteraction}
              user={user}
              storeSettings={storeSettings}
            />
          )}
        </div>

        {/* Background Blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute" style={{ top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(220, 90, 80, 0.4) 0%, rgba(220, 90, 80, 0.2) 40%, transparent 70%)', filter: 'blur(80px)' }} />
          <div className="absolute" style={{ top: '20%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 165, 100, 0.35) 0%, rgba(255, 165, 100, 0.15) 50%, transparent 70%)', filter: 'blur(70px)' }} />
          <div className="absolute" style={{ bottom: '10%', left: '-10%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(255, 185, 120, 0.4) 0%, rgba(255, 185, 120, 0.2) 45%, transparent 70%)', filter: 'blur(90px)' }} />
          <div className="absolute" style={{ bottom: '-5%', right: '40%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255, 200, 140, 0.3) 0%, rgba(255, 200, 140, 0.15) 50%, transparent 70%)', filter: 'blur(60px)' }} />
        </div>

        {/* Content */}
        <div className="relative" style={{ zIndex: 1 }}>
          {/* Mobile Top Header */}
          <div className="lg:hidden">
            {!isAdminRoute && (
              <TopHeader
                onCartClick={() => navigate("/cart")}
                onWishlistClick={() => navigate("/wishlist")}
                cartCount={cartItems.length}
                wishlistCount={wishlistItems.length}
                onNotificationItemClick={handleNotificationInteraction}
                storeSettings={storeSettings}
              />
            )}
          </div>

          {/* Main Content */}
          <main className="pt-20 lg:pt-24 pb-28 lg:pb-12 px-4 lg:px-12 max-w-[1600px] lg:mx-auto">
            <AppRoutes
              navigate={navigate}
              handleViewChange={handleViewChange}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              handleProductClick={handleProductClick}
              handleSearch={handleSearch}
              onCategorySelect={handleCategorySelect}
            />
          </main>

          {/* Bottom Navigation */}
          {!isAdminRoute && currentPath !== "/checkout" && currentPath !== "/cart" && currentPath !== "/login" && currentPath !== "/register" && (
            <div className="lg:hidden">
              <NewBottomNav
                activeView={currentPath}
                onViewChange={handleViewChange}
                cartCount={cartItems.length}
              />
            </div>
          )}

          {/* Product Detail Modal */}
          <ProductDetailModal
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />

          {/* Sidebars */}
          <MenuSidebar
            isOpen={isMenuSidebarOpen}
            onClose={() => setIsMenuSidebarOpen(false)}
            onMenuItemClick={handleMenuItemClick}
            storeSettings={storeSettings}
            user={user}
          />

          <OrdersSidebar
            isOpen={isOrdersSidebarOpen}
            onClose={() => setIsOrdersSidebarOpen(false)}
          />

          {/* Toast Notification */}
          <AddToCartToast
            isVisible={showToast}
            productName={toastProductName}
            onClose={() => setShowToast(false)}
          />

          {/* Flying Products Animation */}
          <AnimatePresence>
            {flyingProducts.map((fp) => (
              <EnhancedFlyingProduct
                key={fp.id}
                id={fp.id}
                image={fp.image}
                name={fp.name}
                startPos={fp.startPos}
                endPos={fp.endPos}
                timing={fp.timing}
                onComplete={() => removeFlyingProduct(fp.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ShopProvider>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <CartProvider>
        <AppContent />
        <Toaster position="top-right" />
      </CartProvider>
    </NotificationProvider>
  );
}
