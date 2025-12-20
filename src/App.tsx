import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Product, Category, Deal, Banner, categories as defaultCategories, defaultDeals, defaultBanners } from "./data/mockData";
import { allProducts } from "./data/allProducts";
import { CartProvider, useCart } from "./context/CartContext";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";
import { ProductDetailModal } from "./components/product/ProductDetailModal";
import { AddToCartToast } from "./components/cart/AddToCartToast";
import { EnhancedFlyingProduct } from "./components/cart/EnhancedFlyingProduct";
import { AnimatePresence } from "motion/react";

// New Components
import { TopHeader } from "./components/layout/TopHeader";
import { NewBottomNav } from "./components/layout/NewBottomNav";
import { MenuSidebar } from "./components/layout/MenuSidebar";
import { OrdersSidebar } from "./components/order/OrdersSidebar";

// Desktop Professional Components
import { DesktopNavBar } from "./components/layout/DesktopNavBar";

// Routes
import { AppRoutes } from "./routes";

import { User } from "@supabase/supabase-js";
import { supabase } from "./config/supabase";
import { toast } from "sonner";
import {
  fetchProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  fetchCategoriesFromSupabase,
  saveCategoryToSupabase,
  deleteCategoryFromSupabase,
  fetchDealsFromSupabase,
  saveDealToSupabase,
  deleteDealFromSupabase,
  fetchBannersFromSupabase,
  saveBannerToSupabase,
  deleteBannerFromSupabase,
} from "./api/supabase/supabaseDataSync";
import { fetchOrders, updateOrder as updateOrderInDb, Order } from "./utils/api/orders";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // Fetch data from Supabase on mount and sync localStorage to Supabase
  useEffect(() => {
    const loadDataFromSupabase = async () => {
      try {
        console.log('🔄 Loading data from Supabase...');
        
        // Fetch all data in parallel
        const [dbProducts, dbCategories, dbDeals, dbBanners] = await Promise.all([
          fetchProductsFromSupabase(),
          fetchCategoriesFromSupabase(),
          fetchDealsFromSupabase(),
          fetchBannersFromSupabase(),
        ]);

        // If database has data, use it (database is source of truth)
        if (dbProducts.length > 0) {
          setProducts(dbProducts);
          localStorage.setItem('idealpoint_products', JSON.stringify(dbProducts));
          console.log('✅ Loaded', dbProducts.length, 'products from Supabase');
        } else {
          // Database is empty, sync localStorage data to Supabase
          console.log('📤 Database empty, syncing localStorage products to Supabase...');
          const savedProducts = localStorage.getItem('idealpoint_products');
          const localProducts = savedProducts ? JSON.parse(savedProducts) : allProducts;
          
          if (localProducts.length > 0) {
            for (const product of localProducts) {
              await saveProductToSupabase(product);
            }
            console.log('✅ Synced', localProducts.length, 'products to Supabase');
            // Refresh state after sync
            setProducts(localProducts);
          }
        }

        if (dbCategories.length > 0) {
          setCategories(dbCategories);
          localStorage.setItem('idealpoint_categories', JSON.stringify(dbCategories));
          console.log('✅ Loaded', dbCategories.length, 'categories from Supabase');
        } else {
          console.log('📤 Database empty, syncing localStorage categories to Supabase...');
          const savedCategories = localStorage.getItem('idealpoint_categories');
          const localCategories = savedCategories ? JSON.parse(savedCategories) : defaultCategories;
          
          if (localCategories.length > 0) {
            for (const category of localCategories) {
              await saveCategoryToSupabase(category);
            }
            console.log('✅ Synced', localCategories.length, 'categories to Supabase');
            setCategories(localCategories);
          }
        }

        if (dbDeals.length > 0) {
          setDeals(dbDeals);
          localStorage.setItem('idealpoint_deals', JSON.stringify(dbDeals));
          console.log('✅ Loaded', dbDeals.length, 'deals from Supabase');
        } else {
          console.log('📤 Database empty, syncing localStorage deals to Supabase...');
          const savedDeals = localStorage.getItem('idealpoint_deals');
          const localDeals = savedDeals ? JSON.parse(savedDeals) : defaultDeals;
          
          if (localDeals.length > 0) {
            for (const deal of localDeals) {
              await saveDealToSupabase(deal);
            }
            console.log('✅ Synced', localDeals.length, 'deals to Supabase');
            setDeals(localDeals);
          }
        }

        if (dbBanners.length > 0) {
          setBanners(dbBanners);
          localStorage.setItem('idealpoint_banners', JSON.stringify(dbBanners));
          console.log('✅ Loaded', dbBanners.length, 'banners from Supabase');
        } else {
          console.log('📤 Database empty, syncing localStorage banners to Supabase...');
          const savedBanners = localStorage.getItem('idealpoint_banners');
          const localBanners = savedBanners ? JSON.parse(savedBanners) : defaultBanners;
          
          if (localBanners.length > 0) {
            for (const banner of localBanners) {
              await saveBannerToSupabase(banner);
            }
            console.log('✅ Synced', localBanners.length, 'banners to Supabase');
            setBanners(localBanners);
          }
        }

        console.log('✅ Data sync complete');
      } catch (error) {
        console.error('❌ Error loading data from Supabase:', error);
        console.log('📦 Using localStorage fallback');
      }
    };

    loadDataFromSupabase();
  }, []);

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
            const { getFunctionUrl, getPublicAnonKey } = await import('./config/supabase');
            const response = await fetch(getFunctionUrl('make-server-b09ae082/settings'), {
                headers: { 
                    'Authorization': `Bearer ${getPublicAnonKey()}`
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
        const { getFunctionUrl, getPublicAnonKey } = await import('./config/supabase');
        await fetch(getFunctionUrl('make-server-b09ae082/settings'), {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${getPublicAnonKey()}`,
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

  const [orders, setOrders] = useState<Order[]>(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem('idealpoint_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Load orders from database on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const dbOrders = await fetchOrders(user?.id);
        
        if (dbOrders.length > 0) {
          // Merge database orders with local orders (database takes priority)
          setOrders(prevOrders => {
            const merged = [...dbOrders];
            // Add local orders that don't exist in database
            prevOrders.forEach(localOrder => {
              if (!dbOrders.find(dbOrder => dbOrder.id === localOrder.id)) {
                merged.push(localOrder);
              }
            });
            return merged;
          });
          console.log('✅ Orders loaded from database:', dbOrders.length);
        }
      } catch (error) {
        console.error('Error loading orders from database:', error);
      }
    };
    
    loadOrders();
  }, []);

  useEffect(() => {
    localStorage.setItem('idealpoint_orders', JSON.stringify(orders));
  }, [orders]);

  const handleAddOrder = async (newOrder: Order) => {
    // Order is already saved to database in CheckoutView
    // Just add to local state
    setOrders(prevOrders => {
      // Check if order already exists
      const exists = prevOrders.find(o => o.id === newOrder.id);
      if (exists) {
        return prevOrders.map(o => o.id === newOrder.id ? newOrder : o);
      }
      return [newOrder, ...prevOrders];
    });
  };

  const handleUpdateOrder = async (orderId: string, orderData: Partial<Order>) => {
    const oldOrder = orders.find(o => o.id === orderId);
    if (!oldOrder) {
      console.error('Order not found:', orderId);
      toast.error('Order not found');
      return;
    }

    // Update local state immediately
    const updatedOrder = { ...oldOrder, ...orderData };
    const updatedOrders = orders.map(order => 
      order.id === orderId ? updatedOrder : order
    );
    setOrders(updatedOrders);

    // Update in database
    let dbUpdatedOrder: Order | null = null;
    try {
      console.log('🔄 Updating order in database:', orderId, orderData);
      dbUpdatedOrder = await updateOrderInDb(orderId, orderData);
      if (dbUpdatedOrder) {
        // Update local state with database response
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? dbUpdatedOrder! : o)
        );
        console.log('✅ Order updated in database:', orderId, 'Status:', dbUpdatedOrder.status);
        toast.success('Order updated successfully');
      } else {
        console.warn('⚠️ Order update returned null');
        toast.error('Failed to update order in database');
      }
    } catch (error: any) {
      console.error('❌ Error updating order in database:', error);
      toast.error(`Failed to update order: ${error.message || 'Unknown error'}`);
    }

    // Trigger order status change automation ONLY when status actually changes
    const oldStatus = oldOrder.status;
    const newStatus = orderData.status || updatedOrder.status || oldStatus;
    
    if (oldStatus !== newStatus && newStatus) {
      const orderNumber = oldOrder.orderNumber || updatedOrder.orderNumber || orderId;
      const orderTotal = updatedOrder.total || oldOrder.total || 0;
      
      console.log(`🔄 Order status changed: ${oldStatus} → ${newStatus} (Order: ${orderNumber})`);
      
      // Get customer user ID from order - try multiple sources
      let customerUserId: string | undefined = undefined;
      
      // Try to get from updated order first
      if (dbUpdatedOrder?.userId) {
        customerUserId = dbUpdatedOrder.userId;
      } else if (updatedOrder.userId) {
        customerUserId = updatedOrder.userId;
      } else if (oldOrder.userId) {
        customerUserId = oldOrder.userId;
      } else {
        // Try to get from current session
        try {
          const { supabase } = await import('./config/supabase');
          const { data: { user } } = await supabase.auth.getUser();
          customerUserId = user?.id;
        } catch (err) {
          console.warn('Could not get user ID from session');
        }
      }
      
      console.log('🔔 Triggering notifications for order:', orderId, 'Status change:', `${oldStatus} → ${newStatus}`, 'User:', customerUserId || 'all');
      
      try {
        const { triggerAutomation } = await import('./utils/notifications/notificationAutomation');
        
        // Trigger general status change notification
        await triggerAutomation('order_status_changed', {
          orderNumber,
          orderId,
          oldStatus,
          newStatus,
          status: newStatus,
          total: orderTotal,
          customerName: updatedOrder.customerName || oldOrder.customerName,
        }, customerUserId);
        
        // Trigger specific status triggers ONLY when status actually changes to that status
        if (newStatus === 'confirmed' && oldStatus !== 'confirmed') {
          console.log('🔔 Triggering order_confirmed automation (status changed to confirmed)');
          await triggerAutomation('order_confirmed', {
            orderNumber,
            orderId,
            total: orderTotal,
            estimatedTime: '30-45 minutes',
            customerName: updatedOrder.customerName || oldOrder.customerName,
          }, customerUserId);
        } else if (newStatus === 'preparing' && oldStatus !== 'preparing') {
          console.log('🔔 Triggering order_preparing automation');
          await triggerAutomation('order_preparing', {
            orderNumber,
            orderId,
            total: orderTotal,
          }, customerUserId);
        } else if (newStatus === 'ready' && oldStatus !== 'ready') {
          console.log('🔔 Triggering order_ready automation');
          await triggerAutomation('order_ready', {
            orderNumber,
            orderId,
            total: orderTotal,
          }, customerUserId);
        } else if (newStatus === 'completed' && oldStatus !== 'completed') {
          console.log('🔔 Triggering order_completed automation');
          await triggerAutomation('order_completed', {
            orderNumber,
            orderId,
            total: orderTotal,
          }, customerUserId);
        } else if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
          console.log('🔔 Triggering order_cancelled automation');
          await triggerAutomation('order_cancelled', {
            orderNumber,
            orderId,
            total: orderTotal,
          }, customerUserId);
        }
        
        console.log('✅ Notifications triggered successfully for status change:', `${oldStatus} → ${newStatus}`);
        
        // Force refresh notifications for user
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refreshNotifications'));
          console.log('🔄 Notification refresh event dispatched');
        }, 1000); // Wait 1 second for notification to be created
      } catch (error: any) {
        console.error('❌ Error triggering status change automation:', error);
        toast.error(`Order updated but notification failed: ${error.message || 'Unknown error'}`);
      }
    }
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get current view from URL path
  const currentPath = location.pathname;
  
  // Sidebars
  const [isMenuSidebarOpen, setIsMenuSidebarOpen] = useState(false);
  const [isOrdersSidebarOpen, setIsOrdersSidebarOpen] = useState(false);
  
  // Check if we're on admin route
  const isAdminRoute = currentPath === '/admin';
  
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
      navigate("/");
      return;
    }
    
    // Map view names to routes
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
    // Map "Fries" to "Sides" since products use "Sides" category
    const mappedCategory = categoryName === "Fries" ? "Sides" : categoryName;
    setSelectedCategory(mappedCategory);
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
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`,
    };
    
    // Update local state immediately
    setProducts([...products, newProduct]);
    
    // Save to Supabase
    const success = await saveProductToSupabase(newProduct);
    if (success) {
      console.log('✅ Product saved to Supabase:', newProduct.id);
    }
  };

  const handleUpdateProduct = async (productId: string, productData: Partial<Product>) => {
    const updatedProduct = products.find(p => p.id === productId);
    if (!updatedProduct) return;

    const mergedProduct = { ...updatedProduct, ...productData };
    
    // Update local state immediately
    setProducts(products.map(p => 
      p.id === productId ? mergedProduct : p
    ));
    
    // Save to Supabase
    const success = await saveProductToSupabase(mergedProduct);
    if (success) {
      console.log('✅ Product updated in Supabase:', productId);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    // Update local state immediately
    setProducts(products.filter(p => p.id !== productId));
    // Remove from wishlist if exists
    setWishlistItems(wishlistItems.filter(item => item.id !== productId));
    
    // Delete from Supabase
    const success = await deleteProductFromSupabase(productId);
    if (success) {
      console.log('✅ Product deleted from Supabase:', productId);
    }
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
  const handleAddCategory = async (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    
    // Update local state immediately
    setCategories([...categories, newCategory]);
    
    // Save to Supabase
    const success = await saveCategoryToSupabase(newCategory);
    if (success) {
      console.log('✅ Category saved to Supabase:', newCategory.id);
    }
  };

  const handleUpdateCategory = async (categoryId: string, categoryData: Partial<Category>) => {
    const updatedCategory = categories.find(cat => cat.id === categoryId);
    if (!updatedCategory) return;

    const mergedCategory = { ...updatedCategory, ...categoryData };
    
    // Update local state immediately
    setCategories(categories.map(cat => 
      cat.id === categoryId ? mergedCategory : cat
    ));
    
    // Save to Supabase
    const success = await saveCategoryToSupabase(mergedCategory);
    if (success) {
      console.log('✅ Category updated in Supabase:', categoryId);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Update local state immediately
    setCategories(categories.filter(cat => cat.id !== categoryId));
    
    // Delete from Supabase
    const success = await deleteCategoryFromSupabase(categoryId);
    if (success) {
      console.log('✅ Category deleted from Supabase:', categoryId);
    }
  };

  const handleReorderCategory = async (categoryId: string, direction: 'up' | 'down') => {
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
    
    // Update local state immediately
    setCategories(newCategories);
    
    // Save all categories to Supabase
    for (const cat of newCategories) {
      await saveCategoryToSupabase(cat);
    }
    console.log('✅ Categories reordered and saved to Supabase');
  };

  // Deal CRUD Functions
  const handleAddDeal = async (dealData: Omit<Deal, 'id'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
    };
    
    // Update local state immediately
    setDeals([...deals, newDeal]);
    
    // Save to Supabase
    const success = await saveDealToSupabase(newDeal);
    if (success) {
      console.log('✅ Deal saved to Supabase:', newDeal.id);
    }
  };

  const handleUpdateDeal = async (dealId: string, dealData: Partial<Deal>) => {
    const updatedDeal = deals.find(deal => deal.id === dealId);
    if (!updatedDeal) return;

    const mergedDeal = { ...updatedDeal, ...dealData };
    
    // Update local state immediately
    setDeals(deals.map(deal => 
      deal.id === dealId ? mergedDeal : deal
    ));
    
    // Save to Supabase
    const success = await saveDealToSupabase(mergedDeal);
    if (success) {
      console.log('✅ Deal updated in Supabase:', dealId);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    // Update local state immediately
    setDeals(deals.filter(deal => deal.id !== dealId));
    
    // Delete from Supabase
    const success = await deleteDealFromSupabase(dealId);
    if (success) {
      console.log('✅ Deal deleted from Supabase:', dealId);
    }
  };

  // Banner CRUD Functions
  const handleAddBanner = async (bannerData: Omit<Banner, 'id'>) => {
    const newBanner: Banner = {
      ...bannerData,
      id: `banner-${Date.now()}`,
    };
    
    // Update local state immediately
    setBanners([...banners, newBanner]);
    
    // Save to Supabase
    const success = await saveBannerToSupabase(newBanner);
    if (success) {
      console.log('✅ Banner saved to Supabase:', newBanner.id);
    }
  };

  const handleUpdateBanner = async (bannerId: string, bannerData: Partial<Banner>) => {
    const updatedBanner = banners.find(banner => banner.id === bannerId);
    if (!updatedBanner) return;

    const mergedBanner = { ...updatedBanner, ...bannerData };
    
    // Update local state immediately
    setBanners(banners.map(banner => 
      banner.id === bannerId ? mergedBanner : banner
    ));
    
    // Save to Supabase
    const success = await saveBannerToSupabase(mergedBanner);
    if (success) {
      console.log('✅ Banner updated in Supabase:', bannerId);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    // Update local state immediately
    setBanners(banners.filter(banner => banner.id !== bannerId));
    
    // Delete from Supabase
    const success = await deleteBannerFromSupabase(bannerId);
    if (success) {
      console.log('✅ Banner deleted from Supabase:', bannerId);
    }
  };

  const handleMenuItemClick = (item: "wishlist" | "orders" | "profile" | "home") => {
    setIsMenuSidebarOpen(false);
    if (item === "wishlist") {
      navigate("/wishlist");
    } else if (item === "orders") {
      setIsOrdersSidebarOpen(true);
    } else if (item === "profile") {
      navigate("/account");
    } else if (item === "home") {
      navigate("/");
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
      navigate('/'); // Deals are on home usually
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
          products={products}
          categories={categories}
          deals={deals}
          banners={banners}
          orders={orders}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          storeSettings={storeSettings}
          user={user}
          handleProductClick={handleProductClick}
          handleSearch={handleSearch}
          handleAddToWishlist={handleAddToWishlist}
          handleRemoveFromWishlist={handleRemoveFromWishlist}
          handleAddOrder={handleAddOrder}
          handleUpdateOrder={handleUpdateOrder}
          handleAddProduct={handleAddProduct}
          handleUpdateProduct={handleUpdateProduct}
          handleDeleteProduct={handleDeleteProduct}
          handleResetProducts={handleResetProducts}
          handleAddCategory={handleAddCategory}
          handleUpdateCategory={handleUpdateCategory}
          handleDeleteCategory={handleDeleteCategory}
          handleReorderCategory={handleReorderCategory}
          handleResetCategories={handleResetCategories}
          handleAddDeal={handleAddDeal}
          handleUpdateDeal={handleUpdateDeal}
          handleDeleteDeal={handleDeleteDeal}
          handleAddBanner={handleAddBanner}
          handleUpdateBanner={handleUpdateBanner}
          handleDeleteBanner={handleDeleteBanner}
          handleUpdateSettings={handleUpdateSettings}
          onCategorySelect={handleCategorySelect}
        />
      </main>

      {/* Bottom Navigation - Hidden on Desktop, Cart, Checkout, Login & Register */}
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
