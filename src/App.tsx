import React, { useState, useEffect } from "react";
import { Product, Category, Deal, Banner, categories as defaultCategories, defaultDeals, defaultBanners } from "./data/mockData";
import { allProducts } from "./data/allProducts";
import { CartProvider, useCart } from "./context/CartContext";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { CartView } from "./components/CartView";
import { CheckoutView } from "./components/CheckoutView";
import { OrderSuccessView } from "./components/OrderSuccessView";
import { AccountView } from "./components/AccountView";
import { OrdersView } from "./components/OrdersView";
import { ProductsView } from "./components/ProductsView";
import { AddToCartToast } from "./components/AddToCartToast";
import { EnhancedFlyingProduct } from "./components/EnhancedFlyingProduct";
import { EditProfileView } from "./components/EditProfileView";
import { SavedAddressesView } from "./components/SavedAddressesView";
import { HomeProductCard } from "./components/HomeProductCard";
import { AnimatePresence } from "motion/react";

// New Components
import { TopHeader } from "./components/TopHeader";
import { SearchBar } from "./components/SearchBar";
import { NewHeroBanner } from "./components/NewHeroBanner";
import { NewCategories } from "./components/NewCategories";
import { NewProductCard } from "./components/NewProductCard";
import { NewBottomNav } from "./components/NewBottomNav";
import { WishlistView } from "./components/WishlistView";
import { MenuSidebar } from "./components/MenuSidebar";
import { OrdersSidebar } from "./components/OrdersSidebar";
import { DesktopSidebar } from "./components/DesktopSidebar";

// Desktop Professional Components
import { DesktopNavBar } from "./components/DesktopNavBar";
import { DesktopFeaturedDeals } from "./components/DesktopFeaturedDeals";
import { DesktopCategoryShowcase } from "./components/DesktopCategoryShowcase";
import { DesktopPromoBanner } from "./components/DesktopPromoBanner";
import { DesktopDealsSection } from "./components/DesktopDealsSection";
import { AdminPanel } from "./components/AdminPanel";
import { FlashSaleCard } from "./components/FlashSaleCard";
import { LoginView } from "./components/LoginView";
import { RegisterView } from "./components/RegisterView";
import { User } from "@supabase/supabase-js";
import { supabase } from "./utils/supabase/client";

function AppContent() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Products State - Centralized for Admin & User sync
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('idealpoint_products');
    return savedProducts ? JSON.parse(savedProducts) : allProducts;
  });

  // Categories State - Centralized for Admin & User sync
  const [categories, setCategories] = useState<Category[]>(() => {
    const savedCategories = localStorage.getItem('idealpoint_categories');
    return savedCategories ? JSON.parse(savedCategories) : defaultCategories;
  });

  // Deals State - Centralized for Admin & User sync
  const [deals, setDeals] = useState<Deal[]>(() => {
    const savedDeals = localStorage.getItem('idealpoint_deals');
    return savedDeals ? JSON.parse(savedDeals) : defaultDeals;
  });

  // Banners State - Centralized for Admin & User sync
  const [banners, setBanners] = useState<Banner[]>(() => {
    const savedBanners = localStorage.getItem('idealpoint_banners');
    return savedBanners ? JSON.parse(savedBanners) : defaultBanners;
  });

  // Store Settings State - Centralized
  const [storeSettings, setStoreSettings] = useState(() => {
    const savedSettings = localStorage.getItem('idealpoint_settings');
    return savedSettings ? JSON.parse(savedSettings) : {
      storeName: "IDEAL POINT",
      tagline: "Fast Food",
      email: 'admin@idealpoint.com',
      phone: '+92 300 1234567',
      address: '123 Main Street, Karachi, Pakistan',
      deliveryFee: 150,
      taxRate: 0,
      minOrder: 500,
      currency: 'PKR',
      exchangeRate: 1, 
      bannerLayout: 'single', 
      bannerHeight: 500,
      bannerPadding: 12,
      isStoreOpen: true,
      enablePickup: true,
      openingTime: "10:00",
      closingTime: "23:00"
    };
  });

  // Fetch settings from server
  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const { projectId, publicAnonKey } = await import('./utils/supabase/info');
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b09ae082/settings`, {
                headers: { 
                    'Authorization': `Bearer ${publicAnonKey}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.settings) {
                    setStoreSettings(data.settings);
                    localStorage.setItem('idealpoint_settings', JSON.stringify(data.settings));
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };
    fetchSettings();
  }, []);

  const handleUpdateSettings = async (newSettings: any) => {
    const updatedSettings = { ...storeSettings, ...newSettings };
    setStoreSettings(updatedSettings);
    localStorage.setItem('idealpoint_settings', JSON.stringify(updatedSettings));
    
    // Save to server
    try {
        const { projectId, publicAnonKey } = await import('./utils/supabase/info');
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b09ae082/settings`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedSettings)
        });
        console.log("✅ Settings saved to server");
    } catch (error) {
        console.error("Failed to save settings to server:", error);
    }
  };

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('idealpoint_products', JSON.stringify(products));
    console.log('✅ Products synced to localStorage:', products.length, 'items');
    console.log('🔄 Real-time sync active - Admin changes → User views');
  }, [products]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('idealpoint_categories', JSON.stringify(categories));
    console.log('✅ Categories synced to localStorage:', categories.length, 'items');
    console.log('📂 Categories data:', categories.map(c => ({ name: c.name, icon: c.icon, isActive: c.isActive })));
  }, [categories]);

  // Save deals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('idealpoint_deals', JSON.stringify(deals));
    console.log('✅ Deals synced to localStorage:', deals.length, 'items');
  }, [deals]);

  // Save banners to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('idealpoint_banners', JSON.stringify(banners));
    console.log('✅ Banners synced to localStorage:', banners.length, 'items');
  }, [banners]);

  const [orders, setOrders] = useState<any[]>(() => {
    // Reset orders as requested by user
    return [];
  });

  useEffect(() => {
    localStorage.setItem('idealpoint_orders', JSON.stringify(orders));
  }, [orders]);

  const handleAddOrder = (newOrder: any) => {
    setOrders([newOrder, ...orders]);
  };

  const handleUpdateOrder = (orderId: string, orderData: any) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, ...orderData } : order
    ));
  };

  // Welcome message on mount
  useEffect(() => {
    console.log('%c🍔 IDEAL POINT Fast Food App', 'font-size: 20px; font-weight: bold; color: #FF9F40;');
    console.log('%c✅ Admin Panel Integration: COMPLETE', 'font-size: 14px; color: #10B981;');
    console.log('%c✅ Category Management: FULLY INTEGRATED', 'font-size: 14px; color: #10B981;');
    console.log('%c🛡️ Access Admin: Click shield icon (password: admin123)', 'font-size: 12px; color: #3B82F6;');
    console.log('%c📦 Products loaded:', products.length, 'items', 'font-size: 12px;');
    console.log('%c📂 Categories loaded:', categories.length, 'items', 'font-size: 12px;');
    console.log('%c🎁 Deals loaded:', deals.length, 'items', 'font-size: 12px;');
    console.log('%c🎨 Banners loaded:', banners.length, 'items', 'font-size: 12px;');
    console.log('%c🔄 Real-time sync: Admin changes → User view (instant)', 'font-size: 12px; color: #8B5CF6;');
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sidebars
  const [isMenuSidebarOpen, setIsMenuSidebarOpen] = useState(false);
  const [isOrdersSidebarOpen, setIsOrdersSidebarOpen] = useState(false);
  
  // Admin Panel
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Wishlist - Start with empty wishlist
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  
  const { 
    flyingProducts, 
    removeFlyingProduct, 
    showToast, 
    toastProductName, 
    setShowToast,
    cartItems,
  } = useCart();

  const { markAsRead } = useNotifications();

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const handleViewChange = (view: string) => {
    if (view === "logout") {
      supabase.auth.signOut();
      setActiveView("home");
      return;
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategorySelect = (categoryName: string) => {
    // Map "Fries" to "Sides" since products use "Sides" category
    const mappedCategory = categoryName === "Fries" ? "Sides" : categoryName;
    setSelectedCategory(mappedCategory);
    setActiveView("products"); // Navigate to menu screen
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddToWishlist = (product: Product) => {
    // Check if product already exists in wishlist
    const exists = wishlistItems.some(item => item.id === product.id);
    if (exists) {
      // Remove from wishlist if already exists
      setWishlistItems(wishlistItems.filter(item => item.id !== product.id));
    } else {
      // Add to wishlist if not exists
      setWishlistItems([...wishlistItems, product]);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== productId));
  };

  // Admin Product CRUD Functions
  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`,
    };
    setProducts([...products, newProduct]);
  };

  const handleUpdateProduct = (productId: string, productData: Partial<Product>) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, ...productData } : p
    ));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    // Remove from wishlist if exists
    setWishlistItems(wishlistItems.filter(item => item.id !== productId));
  };

  const handleResetProducts = () => {
    if (window.confirm('Reset to default products? All custom products will be deleted.')) {
      setProducts(allProducts);
      localStorage.removeItem('idealpoint_products');
    }
  };

  const handleResetCategories = () => {
    if (window.confirm('⚠️ Reset all categories to default? This cannot be undone!')) {
      setCategories(defaultCategories);
      localStorage.removeItem('idealpoint_categories');
    }
  };

  // Category CRUD Functions
  const handleAddCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories([...categories, newCategory]);
  };

  const handleUpdateCategory = (categoryId: string, categoryData: Partial<Category>) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, ...categoryData } : cat
    ));
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const handleReorderCategory = (categoryId: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(cat => cat.id === categoryId);
    if (index === -1) return;
    
    const newCategories = [...categories];
    if (direction === 'up' && index > 0) {
      [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
    } else if (direction === 'down' && index < newCategories.length - 1) {
      [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    }
    
    // Update display orders
    newCategories.forEach((cat, idx) => {
      cat.displayOrder = idx + 1;
    });
    
    setCategories(newCategories);
  };

  // Deal CRUD Functions
  const handleAddDeal = (dealData: Omit<Deal, 'id'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
    };
    setDeals([...deals, newDeal]);
  };

  const handleUpdateDeal = (dealId: string, dealData: Partial<Deal>) => {
    setDeals(deals.map(deal => 
      deal.id === dealId ? { ...deal, ...dealData } : deal
    ));
  };

  const handleDeleteDeal = (dealId: string) => {
    setDeals(deals.filter(deal => deal.id !== dealId));
  };

  // Banner CRUD Functions
  const handleAddBanner = (bannerData: Omit<Banner, 'id'>) => {
    const newBanner: Banner = {
      ...bannerData,
      id: `banner-${Date.now()}`,
    };
    setBanners([...banners, newBanner]);
  };

  const handleUpdateBanner = (bannerId: string, bannerData: Partial<Banner>) => {
    setBanners(banners.map(banner => 
      banner.id === bannerId ? { ...banner, ...bannerData } : banner
    ));
  };

  const handleDeleteBanner = (bannerId: string) => {
    setBanners(banners.filter(banner => banner.id !== bannerId));
  };

  const handleMenuItemClick = (item: "wishlist" | "orders" | "profile" | "home") => {
    setIsMenuSidebarOpen(false);
    if (item === "wishlist") {
      setActiveView("wishlist");
    } else if (item === "orders") {
      setIsOrdersSidebarOpen(true);
    } else if (item === "profile") {
      setActiveView("account");
    } else if (item === "home") {
      setActiveView("home");
    }
  };

  // Filter products for search only (not category on home screen)
  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Popular products - filter by isPopular flag (set in Admin Panel)
  const popularProducts = products.filter(p => p.isPopular === true);

  const activeDeals = deals.filter(d => d.isActive);
  
  // Sort active deals by display order
  const sortedActiveDeals = activeDeals.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Logic to determine which deal goes where
  // 1. Flash Sale: Either explicitly set via template, or the one with highest discount
  const flashSaleDeal = sortedActiveDeals.find(d => d.template === 'flash_sale') 
    || sortedActiveDeals.reduce((prev, current) => (prev && prev.discountPercentage > current.discountPercentage) ? prev : current, undefined as Deal | undefined);

  // 2. Other deals for the list/grid section
  const otherDeals = sortedActiveDeals.filter(d => d.id !== flashSaleDeal?.id);

  const handleDealClick = (deal: Deal) => {
    if (deal.productId) {
      const product = products.find(p => p.id === deal.productId);
      if (product) {
        handleProductClick(product);
      }
    }
  };

  const handleNotificationInteraction = async (notification: any) => {
    await markAsRead(notification.id);
    
    if (notification.productId) {
      const product = products.find(p => p.id === notification.productId);
      if (product) {
        handleProductClick(product);
      }
    } else if (notification.dealId) {
      // Logic to handle deal click - for now just go to deals view if exists or products view
      setActiveView('home'); // Deals are on home usually
      // Could also scroll to deals section
    }
  };

  return (
    <div 
      className="min-h-screen font-sans text-gray-900 relative"
      style={{
        background: '#FFF8F0',
      }}
    >
      {/* Desktop Navigation Bar - Hidden on Mobile, Replaces TopHeader on Desktop */}
      <div className="hidden lg:block">
        {!showAdminPanel && (
          <DesktopNavBar
            activeView={activeView}
            onViewChange={handleViewChange}
            cartCount={cartItems.length}
            wishlistCount={wishlistItems.length}
            onAdminAccess={() => setShowAdminPanel(true)}
            onNotificationItemClick={handleNotificationInteraction}
            user={user}
            storeSettings={storeSettings}
          />
        )}
      </div>

      {/* Warm Gradient Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Top Right Red/Orange Blob */}
        <div 
          className="absolute"
          style={{
            top: '-10%',
            right: '-5%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(220, 90, 80, 0.4) 0%, rgba(220, 90, 80, 0.2) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        
        {/* Middle Orange Blob */}
        <div 
          className="absolute"
          style={{
            top: '20%',
            right: '10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255, 165, 100, 0.35) 0%, rgba(255, 165, 100, 0.15) 50%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
        
        {/* Bottom Left Orange Blob */}
        <div 
          className="absolute"
          style={{
            bottom: '10%',
            left: '-10%',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(255, 185, 120, 0.4) 0%, rgba(255, 185, 120, 0.2) 45%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
        
        {/* Bottom Right Small Orange Blob */}
        <div 
          className="absolute"
          style={{
            bottom: '-5%',
            right: '40%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255, 200, 140, 0.3) 0%, rgba(255, 200, 140, 0.15) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>
      
      {/* Content Wrapper */}
      <div className="relative" style={{ zIndex: 1 }}>
      {/* Mobile Top Header - Hidden on Desktop */}
      <div className="lg:hidden">
        {!showAdminPanel && (
          <TopHeader 
            onCartClick={() => setActiveView("cart")}
            onWishlistClick={() => setActiveView("wishlist")}
            cartCount={cartItems.length}
            wishlistCount={wishlistItems.length}
            onNotificationItemClick={handleNotificationInteraction}
            storeSettings={storeSettings}
          />
        )}
      </div>

      {/* Main Content */}
      <main className="pt-20 lg:pt-24 pb-28 lg:pb-12 px-4 lg:px-12 max-w-[1600px] lg:mx-auto">
        {/* HOME VIEW */}
        {activeView === "home" && (
          <div className="space-y-6 mt-6">
            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} />

            {/* Show search results if searching, otherwise show normal home content */}
            {searchQuery.trim() !== "" ? (
              // INSTANT SEARCH RESULTS
              <div className="py-6 lg:py-12">
                <div className="flex items-center justify-between mb-4 lg:mb-8">
                  <div>
                    <h2 className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">
                      Search Results for "{searchQuery}"
                    </h2>
                    <p className="hidden lg:block text-gray-600">
                      Found {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="px-4 lg:px-8 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-bold backdrop-blur-md transition-all hover:scale-105"
                    style={{
                      background: 'rgba(255, 159, 64, 0.1)',
                      color: '#FF9F40',
                      border: '1px solid rgba(255, 159, 64, 0.2)',
                    }}
                  >
                    Clear Search
                  </button>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
                    {filteredProducts.map((product) => (
                      <HomeProductCard
                        key={product.id}
                        product={product}
                        onClick={() => handleProductClick(product)}
                        isPopular={false}
                        isInWishlist={wishlistItems.some(item => item.id === product.id)}
                        onAddToWishlist={handleAddToWishlist}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 lg:py-24 px-4">
                    <div className="text-6xl lg:text-9xl mb-4 lg:mb-6">🔍</div>
                    <p className="text-gray-500 font-bold text-lg lg:text-2xl">No products found</p>
                    <p className="text-gray-400 text-sm lg:text-lg mt-2">Try searching for something else</p>
                  </div>
                )}
              </div>
            ) : (
              // NORMAL HOME CONTENT
              <>
                {/* Hero Banner - Mobile Only */}
                <div className="lg:hidden">
                  <NewHeroBanner banners={banners.filter(b => b.type === 'hero' && b.isActive)} />
                </div>

                {/* Desktop Hero - Full Width Professional */}
                <div className="hidden lg:block -mx-12">
                  <div className="relative w-full overflow-hidden" style={{ height: `${storeSettings.bannerHeight || 500}px` }}>
                    {(() => {
                      const activeBanners = banners.filter(b => b.type === 'hero' && b.isActive);
                      const layout = storeSettings.bannerLayout || 'single';
                      const height = `${storeSettings.bannerHeight || 500}px`;
                      const padding = storeSettings.bannerPadding !== undefined ? storeSettings.bannerPadding : 48;

                      if (layout === 'grid-2') {
                        return (
                          <div 
                            className="grid grid-cols-2 gap-6 h-full"
                            style={{ paddingLeft: `${padding}px`, paddingRight: `${padding}px` }}
                          >
                            {[0, 1].map(i => (
                              <div key={i} className="rounded-[2rem] overflow-hidden h-full relative shadow-xl transform transition-transform hover:scale-[1.01]">
                                <NewHeroBanner 
                                  banners={activeBanners.length > i ? [activeBanners[i]] : []} 
                                  layout="grid-2"
                                  desktopHeight={height}
                                />
                              </div>
                            ))}
                          </div>
                        );
                      }

                      if (layout === 'grid-3') {
                        return (
                          <div 
                            className="grid grid-cols-3 gap-6 h-full"
                            style={{ paddingLeft: `${padding}px`, paddingRight: `${padding}px` }}
                          >
                            {[0, 1, 2].map(i => (
                              <div key={i} className="rounded-[2rem] overflow-hidden h-full relative shadow-xl transform transition-transform hover:scale-[1.01]">
                                <NewHeroBanner 
                                  banners={activeBanners.length > i ? [activeBanners[i]] : []} 
                                  layout="grid-3"
                                  desktopHeight={height}
                                />
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // Single layout
                      return (
                        <div style={{ paddingLeft: layout === 'single' ? 0 : `${padding}px`, paddingRight: layout === 'single' ? 0 : `${padding}px` }}>
                          <NewHeroBanner banners={activeBanners} layout="single" desktopHeight={height} />
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Categories - Mobile Only */}
                <div className="lg:hidden">
                  <NewCategories 
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    categories={categories}
                  />
                </div>

                {/* Desktop Category Showcase - Professional Grid */}
                <div className="hidden lg:block">
                  <DesktopCategoryShowcase
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    categories={categories}
                  />
                </div>

                {/* Deals Section */}
                <div className="hidden lg:block">
                  <DesktopDealsSection deals={otherDeals} onDealClick={handleDealClick} />
                </div>

                {/* Desktop Featured Deals - Only on Desktop */}
                <div className="hidden lg:block">
                  <DesktopFeaturedDeals
                    products={popularProducts}
                    onProductClick={handleProductClick}
                  />
                </div>

                {/* Desktop Promo Banner - Only on Desktop */}
                <div className="hidden lg:block">
                  <DesktopPromoBanner banner={banners.find(b => b.type === 'promo' && b.isActive)} />
                </div>

                {/* Products Section */}
                <div className="py-6 lg:py-12">
                  <div className="flex items-center justify-between mb-4 lg:mb-8">
                    <div>
                      <h2 className="text-lg lg:text-3xl font-bold text-gray-900 mb-1">
                        {activeView === "home" ? "Popular Items" : "All Menu Items"}
                      </h2>
                      <p className="hidden lg:block text-gray-600">
                        Handpicked favorites just for you
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveView("products")}
                      className="px-4 lg:px-8 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-bold backdrop-blur-md transition-all hover:scale-105"
                      style={{
                        background: 'rgba(255, 159, 64, 0.1)',
                        color: '#FF9F40',
                        border: '1px solid rgba(255, 159, 64, 0.2)',
                      }}
                    >
                      See All Menu
                    </button>
                  </div>

                  {/* Product Grid - Responsive: 2 cols mobile, 3 tablet, 5 desktop */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
                    {popularProducts.slice(0, activeView === "home" ? 10 : 8).map((product, index) => (
                      <HomeProductCard
                        key={product.id}
                        product={product}
                        onClick={() => handleProductClick(product)}
                        isPopular={index < 2}
                        isInWishlist={wishlistItems.some(item => item.id === product.id)}
                        onAddToWishlist={handleAddToWishlist}
                      />
                    ))}
                  </div>
                </div>

                {/* Flash Sale Card */}
                <FlashSaleCard deal={flashSaleDeal} onDealClick={handleDealClick} />

              </>
            )}
          </div>
        )}

        {/* PRODUCTS VIEW */}
        {activeView === "products" && (
          <ProductsView
            onProductClick={handleProductClick}
            selectedCategory={selectedCategory === "all" ? null : selectedCategory}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onBack={() => setActiveView("home")}
            products={products}
            wishlistItems={wishlistItems}
            onAddToWishlist={handleAddToWishlist}
          />
        )}

        {/* CART VIEW */}
        {activeView === "cart" && (
          <CartView
            onContinueShopping={() => setActiveView("home")}
            onCheckout={() => setActiveView("checkout")}
            deals={deals}
            deliveryFee={storeSettings.deliveryFee}
          />
        )}

        {/* CHECKOUT VIEW */}
        {activeView === "checkout" && (
          <CheckoutView
            onBack={() => setActiveView("cart")}
            onSuccess={() => setActiveView("orderSuccess")}
            deliveryFee={storeSettings.deliveryFee}
            onAddOrder={handleAddOrder}
            user={user}
            storeSettings={storeSettings}
          />
        )}

        {/* ORDER SUCCESS VIEW */}
        {activeView === "orderSuccess" && (
          <OrderSuccessView 
            onContinueShopping={() => setActiveView("home")} 
            latestOrder={orders[0]}
            onTrackOrder={() => setActiveView("orders")}
          />
        )}

        {/* ACCOUNT VIEW */}
        {activeView === "account" && (
          <AccountView
            onNavigateToEditProfile={() => setActiveView("editProfile")}
            onNavigateToAddresses={() => setActiveView("savedAddresses")}
            onNavigateToOrders={() => setActiveView("orders")}
            onNavigateToWishlist={() => setActiveView("wishlist")}
            onLogout={() => handleViewChange("logout")}
            onNavigateToLogin={() => setActiveView("login")}
            user={user}
            storeSettings={storeSettings}
          />
        )}

        {/* ORDERS VIEW */}
        {activeView === "orders" && (
          <OrdersView 
            onBack={() => setActiveView("account")} 
            orders={orders}
            storeSettings={storeSettings}
          />
        )}

        {/* WISHLIST VIEW */}
        {activeView === "wishlist" && (
          <WishlistView 
            onBack={() => setActiveView("home")} 
            onProductClick={handleProductClick}
            wishlistItems={wishlistItems}
            onRemoveFromWishlist={handleRemoveFromWishlist}
          />
        )}

        {/* EDIT PROFILE VIEW */}
        {activeView === "editProfile" && (
          <EditProfileView onBack={() => setActiveView("account")} />
        )}

        {/* SAVED ADDRESSES VIEW */}
        {activeView === "savedAddresses" && (
          <SavedAddressesView onBack={() => setActiveView("account")} />
        )}

        {/* LOGIN VIEW */}
        {activeView === "login" && (
          <LoginView 
            onNavigateToRegister={() => setActiveView("register")}
            onLoginSuccess={() => setActiveView("home")}
            onBack={() => setActiveView("home")}
          />
        )}

        {/* REGISTER VIEW */}
        {activeView === "register" && (
          <RegisterView 
            onNavigateToLogin={() => setActiveView("login")}
            onRegisterSuccess={() => setActiveView("home")}
            onBack={() => setActiveView("home")}
            storeSettings={storeSettings}
          />
        )}
      </main>

      {/* Bottom Navigation - Hidden on Desktop, Cart, Checkout, Login & Register */}
      {activeView !== "checkout" && activeView !== "cart" && activeView !== "login" && activeView !== "register" && (
        <div className="lg:hidden">
          <NewBottomNav
            activeView={activeView}
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
        show={showToast}
        productName={toastProductName}
        onClose={() => setShowToast(false)}
      />

      {/* Flying Products Animation */}
      <AnimatePresence>
        {flyingProducts.map((fp) => (
          <EnhancedFlyingProduct
            key={fp.id}
            product={fp.product}
            startPosition={fp.startPosition}
            onComplete={() => removeFlyingProduct(fp.id)}
          />
        ))}
      </AnimatePresence>

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
          products={products}
          cartItems={cartItems}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onResetProducts={handleResetProducts}
          categories={categories}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategory={handleReorderCategory}
          onResetCategories={handleResetCategories}
          deals={deals}
          onAddDeal={handleAddDeal}
          onUpdateDeal={handleUpdateDeal}
          onDeleteDeal={handleDeleteDeal}
          banners={banners}
          onAddBanner={handleAddBanner}
          onUpdateBanner={handleUpdateBanner}
          onDeleteBanner={handleDeleteBanner}
          storeSettings={storeSettings}
          onUpdateSettings={handleUpdateSettings}
          orders={orders}
          onUpdateOrder={handleUpdateOrder}
          user={user}
        />
      )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </NotificationProvider>
  );
}
