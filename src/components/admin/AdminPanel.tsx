import React, { useState, useEffect, useMemo } from "react";
import logger from '../../utils/logger';
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Plus,
  Edit2,
  X,
  ArrowDown,
  Layers,
  Megaphone,
  Bell,
  Shield,
  Menu
} from "lucide-react";
import { Product, Category, Deal, Banner } from "../../data/mockData";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { SimpleNotificationCenter } from "../notification/SimpleNotificationCenter";
import { UsersAdmin } from "./UsersAdmin";
import { RolesAdmin } from "./RolesAdmin";
import { AdminProductModal } from "./AdminProductModal";
import { AdminCategoryModal } from "./AdminCategoryModal";
import { AdminDealModal } from "./AdminDealModal";
import { AdminBannerModal } from "./AdminBannerModal";
import { SettingsAdmin } from "./SettingsAdmin";
import { User } from "@supabase/supabase-js";
import { usePermissions } from "../../hooks/usePermissions";

// Zustand Stores
import { useProductStore } from "../../store/useProductStore";
import { useCategoryStore } from "../../store/useCategoryStore";
import { useDealStore } from "../../store/useDealStore";
import { useBannerStore } from "../../store/useBannerStore";
import { useOrderStore } from "../../store/useOrderStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useAuth } from "../../hooks/useAuth";

// Extracted tab components
import { AdminDashboard } from "./AdminDashboard";
import { AdminProductsTab } from "./AdminProductsTab";
import { AdminOrdersTab } from "./AdminOrdersTab";
import { AdminCategoriesTab } from "./AdminCategoriesTab";
import { AdminMarketingTab } from "./AdminMarketingTab";

interface AdminPanelProps {
  onClose: () => void;
  user?: User | null;
  cartItems: any[];
}

type AdminSection = "dashboard" | "products" | "orders" | "categories" | "deals" | "banners" | "notifications" | "users" | "roles" | "settings";

// "marketing" is handled via the Megaphone icon but maps to deals/banners internally
type AdminSectionWithMarketing = AdminSection | "marketing";

export const AdminPanel = ({
  onClose,
  cartItems,
  user
}: AdminPanelProps) => {
  const { role, permissions } = usePermissions(user || null);
  const [activeSection, setActiveSection] = useState<AdminSectionWithMarketing>("dashboard");

  // Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Category Modal State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Deal Modal State
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showEditDealModal, setShowEditDealModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Banner Modal State
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [showEditBannerModal, setShowEditBannerModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);

  // Zustand State Selection
  const products = useProductStore((state) => state.products);
  const categories = useCategoryStore((state) => state.categories);
  const deals = useDealStore((state) => state.deals);
  const banners = useBannerStore((state) => state.banners);
  const orders = useOrderStore((state) => state.orders);
  const storeSettings = useSettingsStore((state) => state.storeSettings);

  const addProduct = useProductStore((state) => state.handleAddProduct);
  const updateProduct = useProductStore((state) => state.handleUpdateProduct);
  const deleteProduct = useProductStore((state) => state.handleDeleteProduct);
  const resetProducts = useProductStore((state) => state.handleResetProducts);

  const addCategory = useCategoryStore((state) => state.handleAddCategory);
  const updateCategory = useCategoryStore((state) => state.handleUpdateCategory);
  const deleteCategory = useCategoryStore((state) => state.handleDeleteCategory);
  const reorderCategory = useCategoryStore((state) => state.handleReorderCategory);
  const resetCategories = useCategoryStore((state) => state.handleResetCategories);

  const addDeal = useDealStore((state) => state.handleAddDeal);
  const updateDeal = useDealStore((state) => state.handleUpdateDeal);
  const deleteDeal = useDealStore((state) => state.handleDeleteDeal);

  const addBanner = useBannerStore((state) => state.handleAddBanner);
  const updateBanner = useBannerStore((state) => state.handleUpdateBanner);
  const deleteBanner = useBannerStore((state) => state.handleDeleteBanner);

  const updateSettings = useSettingsStore((state) => state.handleUpdateSettings);
  const updateOrderWrapper = useOrderStore((state) => state.handleUpdateOrder);

  // Dashboard Data Loading State
  const dashboardLoading = false;
  
  // Use orders from context directly (useOrders now handles fetching all orders for admins)
  const localOrders = orders;

  // Product CRUD Functions - Wrappers
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    await addProduct(productData);
    toast.success("Product added successfully! 🎉");
    setShowAddProductModal(false);
  };

  const handleUpdateProduct = async (productId: string, productData: Partial<Product>) => {
    await updateProduct(productId, productData);
    toast.success("Product updated successfully! ✨");
    setShowEditProductModal(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
    toast.success("Product deleted successfully! 🗑️");
  };

  // Category CRUD Functions
  const handleAddCategory = async (categoryData: Omit<Category, 'id'>) => {
    await addCategory(categoryData);
    toast.success("Category added successfully! 🎉");
    setShowAddCategoryModal(false);
  };

  const handleUpdateCategory = async (categoryId: string, categoryData: Partial<Category>) => {
    await updateCategory(categoryId, categoryData);
    toast.success("Category updated successfully! ✨");
    setShowEditCategoryModal(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategory(categoryId);
    toast.success("Category deleted successfully! 🗑️");
  };

  const handleReorderCategory = async (categoryId: string, direction: 'up' | 'down') => {
    await reorderCategory(categoryId, direction);
  };

  // Deal CRUD Functions
  const handleAddDeal = async (dealData: Omit<Deal, 'id'>) => {
    await addDeal(dealData);
    toast.success("Deal added successfully! 🎉");
    setShowAddDealModal(false);
  };

  const handleUpdateDeal = async (dealId: string, dealData: Partial<Deal>) => {
    await updateDeal(dealId, dealData);
    toast.success("Deal updated successfully! ✨");
    setShowEditDealModal(false);
    setSelectedDeal(null);
  };

  const handleDeleteDeal = async (dealId: string) => {
    await deleteDeal(dealId);
    toast.success("Deal deleted successfully! 🗑️");
  };

  // Banner CRUD Functions
  const handleAddBanner = async (bannerData: Omit<Banner, 'id'>) => {
    await addBanner(bannerData);
    toast.success("Banner added successfully! 🎉");
    setShowAddBannerModal(false);
  };

  const handleUpdateBanner = async (bannerId: string, bannerData: Partial<Banner>) => {
    await updateBanner(bannerId, bannerData);
    toast.success("Banner updated successfully! ✨");
    setShowEditBannerModal(false);
    setSelectedBanner(null);
  };

  const handleDeleteBanner = async (bannerId: string) => {
    await deleteBanner(bannerId);
    toast.success("Banner deleted successfully! 🗑️");
  };

  const handleResetProducts = () => resetProducts();
  const handleResetCategories = () => resetCategories();
  const handleUpdateSettings = async (settings: any) => await updateSettings(settings);
  const handleUpdateOrder = async (orderId: string, orderData: any) => await updateOrderWrapper(orderId, orderData);

  // Create menuItems with defensive checks for Chrome compatibility
  const menuItems = useMemo(() => {
    const isAdminAccess = user !== null && (role === 'admin' || role === 'manager' || role === 'staff' || role === 'support');
    const hasPermissions = permissions && Object.keys(permissions).length > 0;
    const shouldShowAll = !hasPermissions || isAdminAccess;

    const items = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        group: "STORE",
        visible: shouldShowAll || (permissions?.canViewDashboard === true)
      },
      {
        id: "products",
        label: "Products",
        icon: Package,
        group: "STORE",
        visible: shouldShowAll || (permissions?.canManageProducts === true)
      },
      {
        id: "orders",
        label: "Orders",
        icon: ShoppingBag,
        group: "STORE",
        visible: shouldShowAll || (permissions?.canManageOrders === true)
      },
      {
        id: "categories",
        label: "Categories",
        icon: Layers,
        group: "STORE",
        visible: shouldShowAll || (permissions?.canManageCategories === true)
      },
      {
        id: "marketing",
        label: "Marketing & Promos",
        icon: Megaphone,
        group: "GROWTH",
        visible: shouldShowAll || (permissions?.canManageDeals === true) || (permissions?.canManageBanners === true)
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        group: "GROWTH",
        visible: shouldShowAll || (permissions?.canViewNotifications === true)
      },
      {
        id: "users",
        label: "Users",
        icon: Users,
        group: "ADMIN",
        visible: shouldShowAll || (permissions?.canManageUsers === true)
      },
      {
        id: "roles",
        label: "Roles & Permissions",
        icon: Shield,
        group: "ADMIN",
        visible: shouldShowAll || (permissions?.canManageRoles === true)
      },
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        group: "ADMIN",
        visible: shouldShowAll || (permissions?.canManageSettings === true)
      },
    ];

    const filtered = items.filter(item => item.visible);

    if (filtered.length !== items.length) {
      logger.log('🔍 Menu Items Filtered:', {
        role,
        isAdminAccess,
        shouldShowAll,
        hasPermissions,
        totalItems: items.length,
        visibleItems: filtered.length,
        hiddenItems: items.filter(i => !i.visible).map(i => i.id),
        visibleItemsList: filtered.map(i => i.id)
      });
    }

    return filtered.length > 0 ? filtered : items;
  }, [permissions, role, user]);

  // Redirect if active section is not allowed
  React.useEffect(() => {
    const isAllowed = menuItems.some(item => item.id === activeSection);
    if (!isAllowed && menuItems.length > 0) {
      setActiveSection(menuItems[0].id as AdminSectionWithMarketing);
    }
  }, [activeSection, menuItems]);

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <AdminDashboard
            products={products}
            categories={categories}
            orders={orders}
            localOrders={localOrders}
            dashboardLoading={dashboardLoading}
            onNavigate={(section) => setActiveSection(section as AdminSectionWithMarketing)}
          />
        );
      case "products":
        return (
          <AdminProductsTab
            products={products}
            categories={categories}
            onDeleteProduct={handleDeleteProduct}
            onResetProducts={handleResetProducts}
            onOpenAddModal={() => setShowAddProductModal(true)}
            onOpenEditModal={(product) => {
              setSelectedProduct(product);
              setShowEditProductModal(true);
            }}
          />
        );
      case "orders":
        return (
          <AdminOrdersTab
            orders={orders}
            localOrders={localOrders}
            onUpdateOrder={handleUpdateOrder}
          />
        );
      case "categories":
        return (
          <AdminCategoriesTab
            categories={categories}
            products={products}
            onDeleteCategory={handleDeleteCategory}
            onOpenAddModal={() => setShowAddCategoryModal(true)}
            onOpenEditModal={(category) => {
              setSelectedCategory(category);
              setShowEditCategoryModal(true);
            }}
          />
        );
      case "marketing":
        return (
          <AdminMarketingTab
            deals={deals}
            banners={banners}
            onUpdateDeal={(dealId, dealData) => handleUpdateDeal(dealId, dealData)}
            onDeleteDeal={handleDeleteDeal}
            onUpdateBanner={(bannerId, bannerData) => handleUpdateBanner(bannerId, bannerData)}
            onDeleteBanner={handleDeleteBanner}
            onOpenAddDealModal={() => setShowAddDealModal(true)}
            onOpenEditDealModal={(deal) => {
              setSelectedDeal(deal);
              setShowEditDealModal(true);
            }}
            onOpenAddBannerModal={() => setShowAddBannerModal(true)}
            onOpenEditBannerModal={(banner) => {
              setSelectedBanner(banner);
              setShowEditBannerModal(true);
            }}
            onPreviewBanner={(banner) => setPreviewBanner(banner)}
          />
        );
      case "notifications": return <SimpleNotificationCenter products={products} deals={deals} />;
      case "users": return <UsersAdmin currentUserRole={role} />;
      case "roles": return <RolesAdmin />;
      case "settings": return <SettingsAdmin settings={storeSettings} onUpdateSettings={handleUpdateSettings} />;
      default: return <div className="text-center text-gray-500 mt-20">Section under construction 🚧</div>;
    }
  };

  const renderSidebarContent = () => {
    // Group menu items by their group property
    const groups: Record<string, typeof menuItems> = {};
    menuItems.forEach(item => {
      const g = (item as any).group || 'OTHER';
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    });
    const groupOrder = ['STORE', 'GROWTH', 'ADMIN', 'OTHER'];
    const groupLabels: Record<string, string> = {
      STORE: 'Store',
      GROWTH: 'Growth',
      ADMIN: 'Admin',
      OTHER: 'Other',
    };

    return (
      <div
        className="flex flex-col h-full bg-white"
        style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100%' }}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/25">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-lg text-gray-900 tracking-tight leading-none">IdealPoint</h1>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5 capitalize">{user?.user_metadata?.role || 'Admin'} Panel</p>
            </div>
          </div>
        </div>

        {/* Nav Items grouped */}
        <div
          className="flex-1 overflow-y-auto py-3 px-3"
          style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
        >
          {menuItems && menuItems.length > 0 ? (
            groupOrder.map(groupKey => {
              const groupItems = groups[groupKey];
              if (!groupItems || groupItems.length === 0) return null;
              return (
                <div key={groupKey} className="mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 pt-3 pb-1">
                    {groupLabels[groupKey]}
                  </p>
                  {groupItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    const pendingCount = item.id === 'orders' ? localOrders.filter(o => o.status === 'pending').length : 0;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id as AdminSectionWithMarketing)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group mb-0.5 relative ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-50 to-orange-100/50 text-orange-600'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-orange-500" />
                        )}
                        <Icon className={`w-4.5 h-4.5 transition-colors flex-shrink-0 ${
                          isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'
                        }`} style={{ width: '1.1rem', height: '1.1rem' }} />
                        <span className={`text-sm font-semibold flex-1 text-left ${
                          isActive ? 'text-gray-900' : ''
                        }`}>{item.label}</span>

                        {pendingCount > 0 && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                            isActive ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {pendingCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p>Loading...</p>
            </div>
          )}
        </div>

        {/* User Info + Exit */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-sm flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.email?.[0].toUpperCase() || 'A'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{user?.user_metadata?.name || 'Admin User'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email || 'admin@idealpoint.com'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Exit to App
          </button>
        </div>
      </div>
    );
  };

  // Mobile bottom nav items (5 most important)
  const mobileNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ].filter(item => menuItems.some(m => m.id === item.id));

  return (
    <div
      className="fixed inset-0 z-50 flex bg-gradient-to-br from-slate-50 via-white to-orange-50/30"
      style={{
        display: 'flex',
        flexDirection: 'row',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 50,
        overflow: 'hidden'
      }}
    >
      {/* Sidebar - Always visible on desktop, Sheet handles mobile */}
      <div
        className="flex w-64 bg-white border-r border-orange-100 flex-col"
        style={{
          width: '16rem',
          minWidth: '16rem',
          maxWidth: '16rem',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'relative',
          zIndex: 1,
          visibility: 'visible',
          opacity: 1
        }}
      >
        {renderSidebarContent()}
      </div>

      {/* Main Content */}
      <div
        className="flex-1 overflow-hidden flex flex-col min-w-0"
      >
        {/* Top Bar */}
        <header className="h-14 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-5 flex items-center justify-between z-10 w-full overflow-hidden flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>

            {/* Breadcrumb & Title */}
            <div className="flex flex-col">
              <div className="hidden md:flex items-center gap-1.5 text-[10px] font-semibold mb-0.5">
                <span className="text-gray-400 tracking-wide">Admin</span>
                <span className="text-gray-300">/</span>
                <span className="text-orange-500 tracking-wide">
                  {menuItems.find(i => i.id === activeSection)?.label}
                </span>
              </div>
              <h2 className="text-base font-black text-gray-900 capitalize leading-none">
                {menuItems.find(i => i.id === activeSection)?.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Bell → goes to Notifications */}
            <button
              onClick={() => setActiveSection('notifications')}
              className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
              {localOrders.filter(o => o.status === 'pending').length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
              )}
            </button>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-sm border-2 border-white shadow-sm overflow-hidden cursor-pointer">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.email?.[0].toUpperCase() || 'A'}</span>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.18 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-2 py-1 flex items-center justify-around shadow-2xl">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const pendingCount = item.id === 'orders' ? localOrders.filter(o => o.status === 'pending').length : 0;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as AdminSectionWithMarketing)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold ${ isActive ? 'text-orange-500' : '' }`}>{item.label}</span>
              {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-orange-500" />}
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      <AdminProductModal
        isOpen={showAddProductModal || showEditProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          setShowEditProductModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={(data) => {
          if (selectedProduct) {
            handleUpdateProduct(selectedProduct.id, data);
          } else {
            handleAddProduct(data);
          }
        }}
        categories={categories}
      />

      <AdminCategoryModal
        isOpen={showAddCategoryModal || showEditCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setShowEditCategoryModal(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSave={(data) => {
          if (selectedCategory) {
            handleUpdateCategory(selectedCategory.id, data);
          } else {
            handleAddCategory(data);
          }
        }}
      />

      <AdminDealModal
        isOpen={showAddDealModal || showEditDealModal}
        onClose={() => {
          setShowAddDealModal(false);
          setShowEditDealModal(false);
          setSelectedDeal(null);
        }}
        deal={selectedDeal}
        products={products}
        onSave={(data) => {
          if (selectedDeal) {
            handleUpdateDeal(selectedDeal.id, data);
          } else {
            handleAddDeal(data);
          }
        }}
      />

      <AdminBannerModal
        isOpen={showAddBannerModal || showEditBannerModal}
        onClose={() => {
          setShowAddBannerModal(false);
          setShowEditBannerModal(false);
          setSelectedBanner(null);
        }}
        banner={selectedBanner}
        onSave={(data) => {
          if (selectedBanner) {
            handleUpdateBanner(selectedBanner.id, data);
          } else {
            handleAddBanner(data);
          }
        }}
      />

      {/* Banner Preview Modal */}
      {previewBanner && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">Banner Preview</h3>
                <p className="text-sm text-gray-500">How this banner will appear to users</p>
              </div>
              <button
                onClick={() => setPreviewBanner(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
              {(() => {
                const getButtonStyleClasses = (style: string = 'gradient') => {
                  switch (style) {
                    case 'solid': return 'bg-purple-500 text-white border-none';
                    case 'outline': return 'bg-transparent text-white border-2 border-white';
                    case 'gradient': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none';
                    case 'ghost': return 'bg-white/10 backdrop-blur-md text-white border border-white/30';
                    case 'rounded': return 'bg-purple-500 text-white border-none rounded-full';
                    default: return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none';
                  }
                };

                const getTextPositionClasses = (position: string = 'left') => {
                  switch (position) {
                    case 'left': return 'text-left items-start';
                    case 'center': return 'text-center items-center';
                    case 'right': return 'text-right items-end';
                  }
                };

                const getAnimationVariants = (type: string = 'fade') => {
                  switch (type) {
                    case 'fade': return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
                    case 'slide': return { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 50 } };
                    case 'zoom': return { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.2 } };
                    default: return { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } };
                  }
                };

                const displayStyle = previewBanner.displayStyle || 'image-text-button';
                const animationType = previewBanner.animationType || 'fade';
                const buttonStyle = previewBanner.buttonStyle || 'gradient';
                const textPosition = previewBanner.textPosition || 'left';
                const overlayOpacity = previewBanner.overlayOpacity ?? 70;
                const animationVariants = getAnimationVariants(animationType);

                return (
                  <>
                    {/* Mobile Preview */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-gray-700">📱 Mobile View</span>
                        {previewBanner.type === 'hero' && previewBanner.isActive && (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">Will Display</span>
                        )}
                        {previewBanner.type === 'promo' && (
                          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-bold">Not on Mobile</span>
                        )}
                      </div>
                      <motion.div
                        className="relative rounded-2xl overflow-hidden border-4 border-gray-200"
                        style={{ maxWidth: '375px', height: '200px' }}
                        {...animationVariants}
                        transition={{ duration: 0.5 }}
                      >
                        <img
                          src={previewBanner.image}
                          alt={previewBanner.title}
                          className="w-full h-full object-cover"
                        />
                        {(displayStyle === 'image-text' || displayStyle === 'image-text-button') && (
                          <div
                            className={`absolute inset-0 flex flex-col justify-center p-4 ${getTextPositionClasses(textPosition)}`}
                            style={{
                              background: `linear-gradient(to right, rgba(0,0,0,${overlayOpacity / 100}) 0%, rgba(0,0,0,${overlayOpacity / 200}) 100%)`,
                            }}
                          >
                            <div className="text-white">
                              {previewBanner.title && <h4 className="text-lg font-black mb-1">{previewBanner.title}</h4>}
                              {previewBanner.subtitle && <p className="text-sm opacity-90 mb-2">{previewBanner.subtitle}</p>}
                              {previewBanner.description && <p className="text-xs opacity-80 mb-2">{previewBanner.description}</p>}
                              {displayStyle === 'image-text-button' && previewBanner.buttonText && (
                                <span className={`px-3 py-1 text-xs font-bold ${buttonStyle === 'rounded' ? 'rounded-full' : 'rounded-lg'} ${getButtonStyleClasses(buttonStyle)}`}>
                                  {previewBanner.buttonText}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Desktop Preview */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-gray-700">🖥️ Desktop View</span>
                        {previewBanner.isActive && (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">Will Display</span>
                        )}
                        {!previewBanner.isActive && (
                          <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold">Inactive - Won't Display</span>
                        )}
                      </div>
                      <motion.div
                        className="relative rounded-2xl overflow-hidden border-4 border-gray-200"
                        style={{ height: '300px' }}
                        {...animationVariants}
                        transition={{ duration: 0.5 }}
                      >
                        <img
                          src={previewBanner.image}
                          alt={previewBanner.title}
                          className="w-full h-full object-cover"
                        />
                        {(displayStyle === 'image-text' || displayStyle === 'image-text-button') && (
                          <div
                            className={`absolute inset-0 flex flex-col justify-center p-8 ${getTextPositionClasses(textPosition)}`}
                            style={{
                              background: `linear-gradient(to right, rgba(0,0,0,${overlayOpacity / 100}) 0%, rgba(0,0,0,${overlayOpacity / 200}) 100%)`,
                            }}
                          >
                            <div className="max-w-md text-white">
                              {previewBanner.title && <h4 className="text-4xl font-black mb-2">{previewBanner.title}</h4>}
                              {previewBanner.subtitle && <p className="text-xl opacity-90 mb-4">{previewBanner.subtitle}</p>}
                              {previewBanner.description && <p className="text-lg opacity-80 mb-4">{previewBanner.description}</p>}
                              {displayStyle === 'image-text-button' && previewBanner.buttonText && (
                                <span className={`px-6 py-3 font-bold ${buttonStyle === 'rounded' ? 'rounded-full' : 'rounded-lg'} ${getButtonStyleClasses(buttonStyle)}`}>
                                  {previewBanner.buttonText}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </>
                );
              })()}

              {/* Banner Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Type:</span>
                    <span className="ml-2 font-bold text-gray-900 capitalize">{previewBanner.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Status:</span>
                    <span className={`ml-2 font-bold ${previewBanner.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {previewBanner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Display Style:</span>
                    <span className="ml-2 font-bold text-gray-900">
                      {previewBanner.displayStyle === 'image-only' ? '🖼️ Image Only' :
                        previewBanner.displayStyle === 'image-text' ? '📝 Image+Text' :
                          '✨ Full Featured'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Animation:</span>
                    <span className="ml-2 font-bold text-gray-900 capitalize">
                      {previewBanner.animationType || 'Fade'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Display Order:</span>
                    <span className="ml-2 font-bold text-gray-900">{previewBanner.displayOrder || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Location:</span>
                    <span className="ml-2 font-bold text-gray-900">
                      {previewBanner.type === 'hero' ? 'Home Page (All)' : 'Desktop Only'}
                    </span>
                  </div>
                  {(previewBanner.displayStyle === 'image-text' || previewBanner.displayStyle === 'image-text-button') && (
                    <>
                      <div>
                        <span className="text-gray-500 font-medium">Text Position:</span>
                        <span className="ml-2 font-bold text-gray-900 capitalize">
                          {previewBanner.textPosition || 'Left'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Overlay Opacity:</span>
                        <span className="ml-2 font-bold text-gray-900">
                          {previewBanner.overlayOpacity || 70}%
                        </span>
                      </div>
                    </>
                  )}
                  {previewBanner.displayStyle === 'image-text-button' && (
                    <div>
                      <span className="text-gray-500 font-medium">Button Style:</span>
                      <span className="ml-2 font-bold text-gray-900 capitalize">
                        {previewBanner.buttonStyle || 'Gradient'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedBanner(previewBanner);
                  setPreviewBanner(null);
                  setShowEditBannerModal(true);
                }}
                className="px-6 py-3 rounded-xl font-bold bg-purple-500 text-white hover:bg-purple-600 transition-all flex items-center gap-2 z-10"
              >
                <Edit2 className="w-5 h-5" />
                Edit Banner
              </button>
              <button
                onClick={() => setPreviewBanner(null)}
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all z-10"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
