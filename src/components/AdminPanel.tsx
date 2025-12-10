import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Tag, 
  Gift, 
  BarChart3, 
  Settings, 
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  X,
  Save,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  XCircle,
  Loader,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Layers,
  Palette,
  Calendar,
  Megaphone,
  Star,
  Bell,
  Send,
  Trash,
  Shield,
  Menu
} from "lucide-react";
import { Product, Category, Deal, Banner, categories as defaultCategories, ProductSize } from "../data/mockData";
import { allProducts } from "../data/allProducts";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { NotificationsAdmin } from "./NotificationsAdmin";
import { UsersAdmin } from "./UsersAdmin";
import { RolesAdmin } from "./RolesAdmin";
import { AdminProductModal } from "./AdminProductModal";
import { AdminCategoryModal } from "./AdminCategoryModal";
import { AdminDealModal } from "./AdminDealModal";
import { AdminBannerModal } from "./AdminBannerModal";
import { SettingsAdmin } from "./SettingsAdmin";
import { User } from "@supabase/supabase-js";
import { usePermissions } from "../hooks/usePermissions";
import { fetchOrders } from "../utils/orders";

interface AdminPanelProps {
  onClose: () => void;
  user?: User | null;
  products: Product[];
  cartItems: any[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (productId: string, productData: Partial<Product>) => void;
  onDeleteProduct: (productId: string) => void;
  onResetProducts?: () => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (categoryId: string, categoryData: Partial<Category>) => void;
  onDeleteCategory: (categoryId: string) => void;
  onReorderCategory: (categoryId: string, direction: 'up' | 'down') => void;
  onResetCategories?: () => void;
  deals: Deal[];
  onAddDeal: (deal: Omit<Deal, 'id'>) => void;
  onUpdateDeal: (dealId: string, dealData: Partial<Deal>) => void;
  onDeleteDeal: (dealId: string) => void;
  banners: Banner[];
  onAddBanner: (banner: Omit<Banner, 'id'>) => void;
  onUpdateBanner: (bannerId: string, bannerData: Partial<Banner>) => void;
  onDeleteBanner: (bannerId: string) => void;
  storeSettings?: any;
  onUpdateSettings?: (settings: any) => void;
  orders?: any[];
  onUpdateOrder?: (orderId: string, orderData: any) => void;
}

type AdminSection = "dashboard" | "products" | "orders" | "categories" | "deals" | "banners" | "notifications" | "users" | "roles" | "settings";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: number;
  total: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  date: string;
  time: string;
}

export const AdminPanel = ({ 
  onClose, 
  products, 
  cartItems, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  onResetProducts,
  categories, 
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory, 
  onReorderCategory,
  onResetCategories,
  deals,
  onAddDeal,
  onUpdateDeal,
  onDeleteDeal,
  banners,
  onAddBanner,
  onUpdateBanner,
  onDeleteBanner,
  storeSettings,
  onUpdateSettings,
  orders = [],
  onUpdateOrder,
  user
}: AdminPanelProps) => {
  const { role, permissions } = usePermissions(user || null);
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  
  // Product Management State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Category Management State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Deals & Banners State
  const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showEditDealModal, setShowEditDealModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealSearchQuery, setDealSearchQuery] = useState("");

  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [showEditBannerModal, setShowEditBannerModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [bannerSearchQuery, setBannerSearchQuery] = useState("");
  const [bannerFilterType, setBannerFilterType] = useState<'all' | 'hero' | 'promo'>('all');
  const [bannerFilterStatus, setBannerFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  
  // Order Management State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderViewMode, setOrderViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  
  // Dashboard Data Loading State
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [localOrders, setLocalOrders] = useState<any[]>(orders);
  
  // Fetch orders for admin (fetch all orders, not just user's orders)
  useEffect(() => {
    const loadOrdersForAdmin = async () => {
      // For admin users, always fetch all orders from database
      if (user) {
        // Show loading only on dashboard
        if (activeSection === 'dashboard') {
          setDashboardLoading(true);
        }
        try {
          // For admin, fetch all orders (no userId filter)
          console.log('🔄 Fetching all orders for admin...');
          const allOrders = await fetchOrders();
          setLocalOrders(allOrders);
          console.log('✅ Loaded orders for admin:', allOrders.length);
        } catch (error) {
          console.error('❌ Error loading orders for admin:', error);
        } finally {
          setDashboardLoading(false);
        }
      } else if (orders.length > 0) {
        // Update local orders when prop changes (for non-admin or when orders prop has data)
        setLocalOrders(orders);
      }
    };
    
    loadOrdersForAdmin();
  }, [orders, activeSection, user]);
  
  // Update local orders when orders prop changes
  useEffect(() => {
    if (orders.length > 0) {
      setLocalOrders(orders);
    }
  }, [orders]);

  // Product CRUD Functions - Wrappers
  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    onAddProduct(productData);
    toast.success("Product added successfully! 🎉");
    setShowAddProductModal(false);
  };

  const handleUpdateProduct = (productId: string, productData: Partial<Product>) => {
    onUpdateProduct(productId, productData);
    toast.success("Product updated successfully! ✨");
    setShowEditProductModal(false);
    setSelectedProduct(null);
  };

  // Category CRUD Functions - Wrappers with toast notifications
  const handleAddCategory = (categoryData: Omit<Category, 'id'>) => {
    onAddCategory(categoryData);
    toast.success("Category added successfully! 🎉");
    setShowAddCategoryModal(false);
  };

  const handleUpdateCategory = (categoryId: string, categoryData: Partial<Category>) => {
    onUpdateCategory(categoryId, categoryData);
    toast.success("Category updated successfully! ✨");
    setShowEditCategoryModal(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    onDeleteCategory(categoryId);
    toast.success("Category deleted successfully! 🗑️");
  };
  
  // Deal CRUD Functions
  const handleAddDeal = (dealData: Omit<Deal, 'id'>) => {
    onAddDeal(dealData);
    toast.success("Deal added successfully! 🎉");
    setShowAddDealModal(false);
  };

  const handleUpdateDeal = (dealId: string, dealData: Partial<Deal>) => {
    onUpdateDeal(dealId, dealData);
    toast.success("Deal updated successfully! ✨");
    setShowEditDealModal(false);
    setSelectedDeal(null);
  };

  const handleDeleteDeal = (dealId: string) => {
    onDeleteDeal(dealId);
    toast.success("Deal deleted successfully! 🗑️");
  };

  // Banner CRUD Functions
  const handleAddBanner = (bannerData: Omit<Banner, 'id'>) => {
    onAddBanner(bannerData);
    toast.success("Banner added successfully! 🎉");
    setShowAddBannerModal(false);
  };

  const handleUpdateBanner = (bannerId: string, bannerData: Partial<Banner>) => {
    onUpdateBanner(bannerId, bannerData);
    toast.success("Banner updated successfully! ✨");
    setShowEditBannerModal(false);
    setSelectedBanner(null);
  };

  const handleDeleteBanner = (bannerId: string) => {
    onDeleteBanner(bannerId);
    toast.success("Banner deleted successfully! 🗑️");
  };

  // Create menuItems with defensive checks for Chrome compatibility
  // If user is accessing admin panel, they should have admin permissions by default
  const menuItems = useMemo(() => {
    // If user is accessing admin panel, assume they have admin access
    // This prevents issues when permissions are not loaded yet or role is incorrectly set
    const isAdminAccess = user !== null && (role === 'admin' || role === 'manager' || role === 'staff' || role === 'support');
    const hasPermissions = permissions && Object.keys(permissions).length > 0;
    
    // If permissions exist and user has admin role, use permissions
    // Otherwise, if user is accessing admin panel, show all items (default to admin access)
    const shouldShowAll = !hasPermissions || isAdminAccess;
    
    const items = [
      { 
        id: "dashboard", 
        label: "Dashboard", 
        icon: LayoutDashboard, 
        visible: shouldShowAll || (permissions?.canViewDashboard === true) 
      },
      { 
        id: "products", 
        label: "Products", 
        icon: Package, 
        visible: shouldShowAll || (permissions?.canManageProducts === true) 
      },
      { 
        id: "orders", 
        label: "Orders", 
        icon: ShoppingBag, 
        visible: shouldShowAll || (permissions?.canManageOrders === true) 
      },
      { 
        id: "categories", 
        label: "Categories", 
        icon: Layers, 
        visible: shouldShowAll || (permissions?.canManageCategories === true) 
      },
      { 
        id: "marketing", 
        label: "Marketing & Promos", 
        icon: Megaphone, 
        visible: shouldShowAll || (permissions?.canManageDeals === true) || (permissions?.canManageBanners === true) 
      },
      { 
        id: "users", 
        label: "Users", 
        icon: Users, 
        visible: shouldShowAll || (permissions?.canManageUsers === true) 
      },
      { 
        id: "roles", 
        label: "Roles & Permissions", 
        icon: Shield, 
        visible: shouldShowAll || (permissions?.canManageRoles === true) 
      },
      { 
        id: "notifications", 
        label: "Notifications", 
        icon: Bell, 
        visible: shouldShowAll || (permissions?.canViewNotifications === true) 
      },
      { 
        id: "settings", 
        label: "Settings", 
        icon: Settings, 
        visible: shouldShowAll || (permissions?.canManageSettings === true) 
      },
    ];
    
    const filtered = items.filter(item => item.visible);
    
    // Debug logging for troubleshooting
    if (filtered.length !== items.length) {
      console.log('🔍 Menu Items Filtered:', {
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
    
    // Always return filtered items, or all items if somehow all filtered out (shouldn't happen)
    return filtered.length > 0 ? filtered : items;
  }, [permissions, role, user]);

  // Redirect if active section is not allowed (e.g. on role change or initial load)
  React.useEffect(() => {
    const isAllowed = menuItems.some(item => item.id === activeSection);
    if (!isAllowed && menuItems.length > 0) {
        setActiveSection(menuItems[0].id as AdminSection);
    }
  }, [activeSection, menuItems]);
  
  // Filter functions for dashboard charts
  const getSalesData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesByDay = new Array(7).fill(0);
    const ordersToUse = localOrders.length > 0 ? localOrders : orders;

    if (ordersToUse && ordersToUse.length > 0) {
      ordersToUse.forEach(order => {
        if (order.status !== 'cancelled') {
          let date: Date | null = null;
          
          // Try different date formats
          if (order.createdAt) {
            date = new Date(order.createdAt);
          } else if (order.date) {
            // Handle string dates like "Dec 8, 2024"
            date = new Date(order.date);
            // If that fails, try parsing manually
            if (isNaN(date.getTime())) {
              // Try to parse common formats
              const dateStr = order.date.toString();
              date = new Date(dateStr);
            }
          }
          
          if (date && !isNaN(date.getTime())) {
            const dayIndex = date.getDay();
            const orderTotal = Number(order.total) || Number(order.total_amount) || 0;
            salesByDay[dayIndex] += orderTotal;
          }
        }
      });
    }

    return days.map((day, index) => ({
      name: day,
      sales: salesByDay[index]
    }));
  };

  // Memoized stats calculation - recalculates when orders or products change
  const stats = useMemo(() => {
    const ordersToUse = localOrders.length > 0 ? localOrders : orders;
    
    if (!ordersToUse || ordersToUse.length === 0) {
      return {
        revenue: 0,
        orders: 0,
        products: products.length || 0,
        customers: 0
      };
    }

    const activeOrders = ordersToUse.filter(o => o.status !== 'cancelled');
    const totalRevenue = activeOrders.reduce((acc, order) => {
      const orderTotal = Number(order.total) || Number(order.total_amount) || 0;
      return acc + orderTotal;
    }, 0);
    const totalOrders = ordersToUse.length;
    
    // Get unique customers - handle different customer field names
    const customerSet = new Set();
    ordersToUse.forEach(order => {
      if (order.customer) customerSet.add(order.customer);
      if (order.customerName) customerSet.add(order.customerName);
      if (order.userId) customerSet.add(order.userId);
    });
    const uniqueCustomers = customerSet.size;
    
    return {
      revenue: totalRevenue,
      orders: totalOrders,
      products: products.length || 0,
      customers: uniqueCustomers
    };
  }, [localOrders, orders, products]);

  const getCategoryData = () => {
    return categories.map(cat => ({
      name: cat.name,
      value: products.filter(p => p.category === cat.name).length
    }));
  };

  const COLORS = ['#FF9F40', '#FFB74D', '#FFCC80', '#FFE0B2', '#FFF3E0'];

  const renderDashboard = () => {
    // Show loading skeleton while data is being fetched
    if (dashboardLoading && localOrders.length === 0 && orders.length === 0) {
      return (
        <div className="space-y-6">
          {/* Loading Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
          {/* Loading Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-sm h-[400px] animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
                <div className="h-full bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
            <h3 className="text-2xl font-black text-gray-900">Rs {stats.revenue.toLocaleString()}</h3>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Orders</p>
            <h3 className="text-2xl font-black text-gray-900">{stats.orders}</h3>
          </div>

          <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Products</p>
            <h3 className="text-2xl font-black text-gray-900">{stats.products}</h3>
          </div>

          <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Customers</p>
            <h3 className="text-2xl font-black text-gray-900">{stats.customers}</h3>
          </div>
        </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-sm h-[400px] relative">
          <h3 className="text-lg font-black text-gray-900 mb-6">Weekly Sales</h3>
          {stats.revenue > 0 ? (
            <ResponsiveContainer width="100%" height="calc(100% - 3rem)">
              <BarChart data={getSalesData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                />
                <Bar dataKey="sales" fill="#FF9F40" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400" style={{ height: 'calc(100% - 3rem)' }}>
              <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm">No sales data available yet</p>
              <p className="text-xs mt-2 text-gray-400">Orders will appear here once customers place orders</p>
            </div>
          )}
        </div>

        {/* Categories Chart */}
        <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-sm h-[400px]">
          <h3 className="text-lg font-black text-gray-900 mb-6">Product Categories</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getCategoryData()}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {getCategoryData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    );
  };

  const renderProducts = () => {
    const filteredProducts = products
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(p => categoryFilter === "all" || p.category === categoryFilter);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              Product Management
              <span className="text-base px-3 py-1 rounded-full bg-orange-100 text-orange-600 font-bold">
                {products.length} items
              </span>
            </h2>
            <p className="text-gray-600">Manage your menu items - changes reflect instantly</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60">
              <button
                onClick={() => setProductViewMode('grid')}
                className={`px-3 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                  productViewMode === 'grid' 
                    ? 'bg-orange-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setProductViewMode('list')}
                className={`px-3 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                  productViewMode === 'list' 
                    ? 'bg-orange-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                List
              </button>
            </div>

            <motion.button
              onClick={() => setShowAddProductModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(255, 159, 64, 0.3)',
              }}
            >
              <Plus className="w-5 h-5" />
              Add Product
            </motion.button>
          </div>
        </div>

        {/* Search & Filter */}
        <div 
          className="rounded-2xl p-4 backdrop-blur-xl space-y-3"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          {/* Search Row */}
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded-lg font-bold text-gray-700 flex items-center gap-2 hover:bg-orange-50 transition-all bg-white border border-gray-200 outline-none focus:border-orange-400 appearance-none pr-10"
              >
                <option value="all">All Categories</option>
                {categories
                  .filter(cat => cat.isActive !== false)
                  .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                  .map(category => {
                    const count = products.filter(p => p.category === category.name).length;
                    return (
                      <option key={category.id} value={category.name}>
                        {category.name} ({count})
                      </option>
                    );
                  })}
              </select>
              <Filter className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {onResetProducts && (
              <button 
                onClick={onResetProducts}
                className="px-4 py-2 rounded-lg font-bold text-red-600 flex items-center gap-2 hover:bg-red-50 transition-all"
                title="Reset to default products"
              >
                <Download className="w-5 h-5" />
                Reset
              </button>
            )}
          </div>

          {/* Stats & Info Row */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-1.5 text-gray-700">
              <Package className="w-4 h-4" />
              <span className="font-bold">
                Showing {filteredProducts.length} of {products.length}
              </span>
            </div>
            <div className="h-3 w-px bg-gray-300"></div>
            <div className="flex items-center gap-1.5 text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="font-bold">{products.filter(p => p.inStock !== false).length} Stock</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="font-bold">{products.filter(p => p.inStock === false).length} Out</span>
            </div>
            <div className="flex items-center gap-1.5 text-orange-600">
              <span>🔥</span>
              <span className="font-bold">{products.filter(p => p.isPopular).length} Popular</span>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div 
            className="text-center py-20 rounded-2xl backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}
          >
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-600 mb-2">
              {searchQuery || categoryFilter !== "all" ? 'No products match your filters' : 'No products yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery && `No products found matching "${searchQuery}"`}
              {!searchQuery && categoryFilter !== "all" && `No products in ${categoryFilter} category`}
              {!searchQuery && categoryFilter === "all" && 'Add your first product to get started'}
            </p>
            {(searchQuery || categoryFilter !== "all") ? (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                  }}
                  className="px-6 py-3 rounded-xl font-bold bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all"
                >
                  Clear Filters
                </button>
                <motion.button
                  onClick={() => setShowAddProductModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                    color: 'white',
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Add Product Anyway
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => setShowAddProductModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
                style={{
                  background: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(255, 159, 64, 0.3)',
                }}
              >
                <Plus className="w-5 h-5" />
                Add Your First Product
              </motion.button>
            )}
          </div>
        ) : productViewMode === 'list' ? (
          // List View - Table
          <div 
            className="rounded-3xl overflow-hidden backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-50/50">
                  <tr>
                    <th className="text-left py-4 px-6 font-bold text-gray-700">Product</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700">Category</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700">Price</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700">Rating</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product.id} 
                      className="border-t border-gray-100 hover:bg-orange-50/30 transition-all"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{product.name}</div>
                            {product.isPopular && <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1 rounded">POPULAR</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{product.category}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">
                        Rs {product.price}
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through ml-2">Rs {product.originalPrice}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${product.inStock !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                          ⭐ {product.rating}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowEditProductModal(true);
                            }}
                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(`Delete ${product.name}? This action cannot be undone.`)) {
                                onDeleteProduct(product.id);
                                toast.success(`${product.name} deleted successfully! 🗑️`);
                              }
                            }}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Grid View (Updated with smaller cards)
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-xl overflow-hidden backdrop-blur-xl hover:shadow-lg transition-all group"
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
              >
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100 relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.discount && (
                    <div 
                      className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ background: '#EF4444' }}
                    >
                      {product.discount}% OFF
                    </div>
                  )}
                  {product.inStock === false && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                       <span className="text-white font-bold border border-white px-2 py-1 rounded">OUT OF STOCK</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate" title={product.name}>{product.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{product.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-orange-500">Rs {product.price}</span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through">Rs {product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                      ⭐ {product.rating}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowEditProductModal(true);
                      }}
                      className="flex-1 py-1.5 rounded-lg font-bold bg-orange-100 text-orange-600 text-xs flex items-center justify-center gap-1 hover:bg-orange-200 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${product.name}? This action cannot be undone.`)) {
                          onDeleteProduct(product.id);
                          toast.success(`${product.name} deleted successfully! 🗑️`);
                        }
                      }}
                      className="flex-1 py-1.5 rounded-lg font-bold bg-red-100 text-red-600 text-xs flex items-center justify-center gap-1 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Del
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (onUpdateOrder) {
      try {
        await onUpdateOrder(orderId, { status: newStatus });
        toast.success(`Order status updated to ${newStatus}`);
        console.log('✅ Order status updated:', orderId, 'to', newStatus);
      } catch (error) {
        console.error('Error updating order status:', error);
        toast.error('Failed to update order status');
      }
    } else {
      console.warn('onUpdateOrder function not provided');
      toast.error('Order update function not available');
    }
  };

  // Move order to next step in pipeline
  const handleMoveToNextStep = (orderId: string, currentStatus: string) => {
    const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      handleStatusChange(orderId, nextStatus);
    }
  };

  const renderOrders = () => {
    // Pipeline stages configuration
    const pipelineStages = [
      { 
        id: 'pending', 
        label: 'New Orders', 
        color: '#FF9F40',
        bgColor: 'rgba(255, 159, 64, 0.1)',
        icon: <Clock className="w-4 h-4" />
      },
      { 
        id: 'confirmed', 
        label: 'Confirmed', 
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
        icon: <CheckCircle className="w-4 h-4" />
      },
      { 
        id: 'preparing', 
        label: 'Preparing', 
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: <Loader className="w-4 h-4" />
      },
      { 
        id: 'ready', 
        label: 'Ready', 
        color: '#8B5CF6',
        bgColor: 'rgba(139, 92, 246, 0.1)',
        icon: <Package className="w-4 h-4" />
      },
      { 
        id: 'out-for-delivery', 
        label: 'Out for Delivery', 
        color: '#14B8A6',
        bgColor: 'rgba(20, 184, 166, 0.1)',
        icon: <ShoppingBag className="w-4 h-4" />
      },
      { 
        id: 'delivered', 
        label: 'Delivered', 
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: <CheckCircle className="w-4 h-4" />
      },
    ];

    const filterOrders = (ordersToFilter: any[]) => {
      if (!orderSearchQuery) return ordersToFilter;
      const query = orderSearchQuery.toLowerCase();
      return ordersToFilter.filter(order => 
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.customerPhone?.toLowerCase().includes(query)
      );
    };

    return (
      <div className="relative flex h-[calc(100vh-120px)] overflow-hidden -mx-6 px-6">
        {/* Main Content Area - Pipeline */}
        <div className={`flex-1 overflow-x-auto transition-all duration-300 pr-2 ${selectedOrder ? 'mr-[400px]' : ''}`}>
          <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Order Management</h2>
                  <p className="text-gray-600">{(() => {
                    const ordersToUse = localOrders.length > 0 ? localOrders : orders;
                    return `${ordersToUse.length} total orders • Total Revenue: Rs ${ordersToUse.reduce((sum: number, order: any) => sum + (Number(order.total) || Number(order.total_amount) || 0), 0).toLocaleString()}`;
                  })()}</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* View Toggle */}
                  <div className="flex items-center gap-2 p-1 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60">
                    <button
                      onClick={() => setOrderViewMode('pipeline')}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        orderViewMode === 'pipeline' 
                          ? 'bg-orange-500 text-white shadow-lg' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Layers className="w-4 h-4 inline mr-2" />
                      Pipeline
                    </button>
                    <button
                      onClick={() => setOrderViewMode('list')}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        orderViewMode === 'list' 
                          ? 'bg-orange-500 text-white shadow-lg' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 inline mr-2" />
                      List
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by number, customer name, phone, or items..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl font-medium text-sm outline-none transition-all focus:ring-2 focus:ring-orange-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                  }}
                />
                {orderSearchQuery && (
                  <button
                    onClick={() => setOrderSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {orderViewMode === 'list' ? (
              // List View - Table
              <div 
                className="rounded-3xl overflow-hidden backdrop-blur-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                {(() => {
                  const ordersToUse = localOrders.length > 0 ? localOrders : orders;
                  const filteredOrders = filterOrders(ordersToUse);
                  return filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-10 h-10 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {orderSearchQuery ? 'No Orders Found' : 'No Orders Yet'}
                      </h3>
                      <p className="text-gray-500">
                        {orderSearchQuery 
                          ? 'Try adjusting your search terms' 
                          : 'Orders placed by customers will appear here.'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-orange-50/50">
                          <tr>
                            <th className="text-left py-4 px-6 font-bold text-gray-700">Order ID</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-700">Customer</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-700">Items</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-700">Total</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-700">Status</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => (
                          <tr 
                            key={order.id} 
                            className={`border-t border-gray-100 hover:bg-orange-50/30 transition-all cursor-pointer ${selectedOrder?.id === order.id ? 'bg-orange-50/50' : ''}`}
                            onClick={() => setSelectedOrder(order)}
                          >
                            <td className="py-4 px-6 font-bold text-gray-900">{order.orderNumber}</td>
                            <td className="py-4 px-6 text-gray-700">
                              <div>{order.customerName || order.customer}</div>
                              <div className="text-xs text-gray-500">{order.customerPhone}</div>
                            </td>
                            <td className="py-4 px-6 text-gray-700">
                              {order.items && Array.isArray(order.items) ? order.items.length : (typeof order.items === 'number' ? order.items : 1)} items
                            </td>
                            <td className="py-4 px-6 font-bold text-green-600">Rs {order.total}</td>
                            <td className="py-4 px-6">
                              <div 
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                                style={{ 
                                  background: `${getStatusColor(order.status)}20`,
                                  color: getStatusColor(order.status)
                                }}
                              >
                                {getStatusIcon(order.status)}
                                <span className="text-xs font-bold capitalize">{order.status}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex gap-2">
                                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveToNextStep(order.id, order.status);
                                    }}
                                    className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-all"
                                    title="Move to Next Step"
                                  >
                                    <ArrowDown className="w-4 h-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrder(order);
                                  }}
                                  className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            ) : (() => {
              const ordersToUse = localOrders.length > 0 ? localOrders : orders;
              const filteredOrders = filterOrders(ordersToUse);
              
              if (filteredOrders.length === 0) {
                return (
                  // Empty State for Pipeline
                  <div 
                    className="text-center py-20 rounded-3xl backdrop-blur-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-10 h-10 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {orderSearchQuery ? 'No Orders Found' : 'No Orders Yet'}
                    </h3>
                    <p className="text-gray-500">
                      {orderSearchQuery 
                        ? 'Try adjusting your search terms' 
                        : 'Orders placed by customers will appear here.'}
                    </p>
                  </div>
                );
              }
              
              // Helper function to filter orders by status
              const getFilteredOrdersByStatus = (status: string) => {
                return filteredOrders.filter(order => {
                  if (status === 'pending') return order.status === 'pending';
                  if (status === 'confirmed') return order.status === 'confirmed';
                  if (status === 'preparing') return order.status === 'preparing';
                  if (status === 'ready') return order.status === 'ready';
                  if (status === 'out-for-delivery') return order.status === 'out-for-delivery' || order.status === 'delivering';
                  if (status === 'delivered') return order.status === 'delivered' || order.status === 'completed';
                  return false;
                });
              };
              
              return (
                // Pipeline View
                <div className="flex gap-4 min-w-max pb-4">
                  {pipelineStages.map((stage) => {
                    const stageOrders = getFilteredOrdersByStatus(stage.id);
                  
                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex-shrink-0 w-[280px]"
                    >
                      {/* Stage Header */}
                      <div 
                        className="rounded-2xl p-4 mb-3 backdrop-blur-xl"
                        style={{
                          background: stage.bgColor,
                          border: `2px solid ${stage.color}30`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ 
                                background: stage.color,
                                color: 'white' 
                              }}
                            >
                              {stage.icon}
                            </div>
                            <div>
                              <h3 className="font-black text-gray-900">{stage.label}</h3>
                              <p className="text-xs text-gray-500">{stageOrders.length} orders</p>
                            </div>
                          </div>
                          <div 
                            className="px-3 py-1 rounded-full font-black text-sm"
                            style={{ 
                              background: stage.color,
                              color: 'white'
                            }}
                          >
                            {stageOrders.length}
                          </div>
                        </div>
                      </div>

                      {/* Orders in Stage */}
                      <div className="space-y-3 min-h-[200px]">
                        {stageOrders.map((order) => (
                          <motion.div
                            layoutId={order.id}
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden group ${
                              selectedOrder?.id === order.id ? 'ring-2 ring-orange-500 shadow-xl' : 'shadow-sm hover:shadow-md'
                            }`}
                            style={{
                              background: 'rgba(255, 255, 255, 0.9)',
                              border: '1px solid rgba(255, 255, 255, 0.8)',
                            }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-black text-gray-900 text-lg block">{order.orderNumber}</span>
                                <span className="text-xs text-gray-500">{order.time}</span>
                              </div>
                              <div className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs">
                                Rs {order.total}
                              </div>
                            </div>

                            <div className="mb-3">
                              <p className="font-bold text-gray-800 text-sm line-clamp-1">{order.customerName || order.customer}</p>
                              <p className="text-xs text-gray-500">{order.items && Array.isArray(order.items) ? order.items.length : order.items} items</p>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveToNextStep(order.id, order.status);
                                  }}
                                  className="flex-1 py-1.5 rounded-lg bg-green-100 text-green-700 font-bold text-xs hover:bg-green-200"
                                >
                                  Next Step
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs hover:bg-blue-200"
                              >
                                View
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Side Panel - Order Details */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-24 bottom-6 right-6 w-[380px] rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden z-20 flex flex-col"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-white/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{selectedOrder.orderNumber}</h3>
                    <p className="text-gray-500 text-sm">{selectedOrder.date} at {selectedOrder.time}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Status Badge */}
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl w-full justify-center font-bold"
                  style={{ 
                    background: `${getStatusColor(selectedOrder.status)}15`,
                    color: getStatusColor(selectedOrder.status)
                  }}
                >
                  {getStatusIcon(selectedOrder.status)}
                  <span className="capitalize">{selectedOrder.status}</span>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Customer Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="font-bold text-gray-900 text-right">{selectedOrder.customerName || selectedOrder.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-bold text-gray-900">{selectedOrder.customerPhone}</span>
                    </div>
                    {selectedOrder.deliveryAddress && (
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <span className="text-gray-500 block mb-1">Delivery Address</span>
                        <p className="font-medium text-gray-900 text-xs leading-relaxed">
                          {selectedOrder.deliveryAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gray-500" />
                    Items ({selectedOrder.items && Array.isArray(selectedOrder.items) ? selectedOrder.items.length : selectedOrder.items})
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
                      selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.quantity} x Rs {item.price}</p>
                          </div>
                          <p className="font-bold text-gray-900 text-sm">Rs {item.price * item.quantity}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Items details unavailable</p>
                    )}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-orange-50 p-4 rounded-2xl space-y-3">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-orange-500" />
                    Payment Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-bold text-gray-900">Rs {selectedOrder.subtotal || selectedOrder.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-bold text-gray-900">Rs {selectedOrder.deliveryFee || 0}</span>
                    </div>
                    <div className="pt-2 border-t border-orange-200 mt-2 flex justify-between items-center">
                      <span className="font-black text-gray-900">Total Amount</span>
                      <span className="font-black text-orange-600 text-lg">Rs {selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-md grid grid-cols-2 gap-3">
                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => handleMoveToNextStep(selectedOrder.id, selectedOrder.status)}
                    className="col-span-2 py-3 rounded-xl font-black text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    Advance Order <ArrowDown className="w-4 h-4" />
                  </button>
                )}
                
                <button className="py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all">
                  Print Receipt
                </button>
                <button className="py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all">
                  Cancel Order
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9F40';
      case 'confirmed': return '#3B82F6';
      case 'preparing': return '#F59E0B';
      case 'ready': return '#8B5CF6';
      case 'out-for-delivery': return '#14B8A6';
      case 'delivered': return '#10B981';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Loader className="w-4 h-4 animate-spin" />;
      case 'ready': return <Package className="w-4 h-4" />;
      case 'out-for-delivery': return <ShoppingBag className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };


  // Marketing Tab State
  const [marketingTab, setMarketingTab] = useState<'deals' | 'banners'>('deals');

  // Helper to get content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return renderDashboard();
      case "products": return renderProducts();
      case "orders": return renderOrders();
      case "categories": return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Category Management</h2>
              <p className="text-gray-600">Organize your menu with categories</p>
            </div>
            <motion.button
              onClick={() => setShowAddCategoryModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
              }}
            >
              <Plus className="w-5 h-5" />
              Add Category
            </motion.button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((category) => (
              <div 
                key={category.id}
                className="rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4 group"
                style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl shadow-inner">
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
                  <p className="text-sm text-gray-500">{products.filter(p => p.category === category.name).length} products</p>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowEditCategoryModal(true);
                    }}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm(`Delete category ${category.name}?`)) {
                        handleDeleteCategory(category.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      case "marketing": return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Marketing & Promotions</h2>
              <p className="text-gray-600">Manage your banners, deals, and special offers</p>
            </div>
            
            {marketingTab === 'deals' ? (
              <motion.button
                onClick={() => setShowAddDealModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(236, 72, 153, 0.3)',
                }}
              >
                <Plus className="w-5 h-5" />
                Add Deal
              </motion.button>
            ) : (
              <motion.button
                onClick={() => setShowAddBannerModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
                }}
              >
                <Plus className="w-5 h-5" />
                Add Banner
              </motion.button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 w-fit">
            <button
              onClick={() => setMarketingTab('deals')}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                marketingTab === 'deals'
                  ? 'bg-white text-pink-600 shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Gift className="w-4 h-4" />
              Deals & Offers
            </button>
            <button
              onClick={() => setMarketingTab('banners')}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                marketingTab === 'banners'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Hero Banners
            </button>
          </div>
          
          {marketingTab === 'deals' ? (
            // DEALS SECTION
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map(deal => (
                <div 
                  key={deal.id} 
                  className={`relative rounded-2xl overflow-hidden group transition-all ${!deal.isActive ? 'opacity-60 grayscale' : ''}`}
                  style={{
                    background: deal.backgroundColor,
                    color: deal.textColor || 'white',
                    minHeight: '180px'
                  }}
                >
                  <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-md text-xs font-bold border border-white/30">
                          {deal.couponCode}
                        </span>
                        {!deal.isActive && (
                          <span className="px-2 py-1 rounded-lg bg-black/40 text-white text-xs font-bold">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 p-1 rounded-lg backdrop-blur-sm">
                        {/* Quick Toggle Status */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateDeal(deal.id, { isActive: !deal.isActive });
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${deal.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
                          title={deal.isActive ? "Deactivate" : "Activate"}
                        >
                          {deal.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedDeal(deal);
                            setShowEditDealModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this deal?')) handleDeleteDeal(deal.id);
                          }}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium opacity-70 uppercase tracking-wider">
                        Order: {deal.displayOrder || 0}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/40"></span>
                      <span className="text-xs font-medium opacity-70 uppercase tracking-wider">
                        {deal.template ? deal.template.replace('_', ' ') : 'Default'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black mb-1 leading-tight">{deal.title}</h3>
                    <p className="opacity-90 text-sm mb-4 line-clamp-2">{deal.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                      <Clock className="w-3 h-3" />
                      Expires: {new Date(deal.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  {/* Decorative Circle */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                </div>
              ))}
            </div>
          ) : (
            // BANNERS SECTION - IMPROVED
            <div className="space-y-6">
              {/* Banner Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-sm text-gray-500 font-medium mb-1">Total Banners</div>
                  <div className="text-2xl font-black text-gray-900">{banners.length}</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="text-sm text-purple-600 font-medium mb-1">Hero Banners</div>
                  <div className="text-2xl font-black text-purple-700">
                    {banners.filter(b => b.type === 'hero').length}
                  </div>
                  <div className="text-xs text-purple-500 mt-1">
                    {banners.filter(b => b.type === 'hero' && b.isActive).length} active
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="text-sm text-orange-600 font-medium mb-1">Promo Banners</div>
                  <div className="text-2xl font-black text-orange-700">
                    {banners.filter(b => b.type === 'promo').length}
                  </div>
                  <div className="text-xs text-orange-500 mt-1">
                    {banners.filter(b => b.type === 'promo' && b.isActive).length} active
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-sm text-green-600 font-medium mb-1">Active Banners</div>
                  <div className="text-2xl font-black text-green-700">
                    {banners.filter(b => b.isActive).length}
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    {banners.filter(b => !b.isActive).length} inactive
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="flex flex-wrap gap-4 items-center">
                {/* Search */}
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={bannerSearchQuery}
                    onChange={(e) => setBannerSearchQuery(e.target.value)}
                    placeholder="Search banners..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition-all bg-white"
                  />
                </div>

                {/* Type Filter */}
                <div className="flex gap-2 p-1 rounded-xl bg-white border border-gray-200">
                  <button
                    onClick={() => setBannerFilterType('all')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      bannerFilterType === 'all'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setBannerFilterType('hero')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      bannerFilterType === 'hero'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Hero
                  </button>
                  <button
                    onClick={() => setBannerFilterType('promo')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      bannerFilterType === 'promo'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Promo
                  </button>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 p-1 rounded-xl bg-white border border-gray-200">
                  <button
                    onClick={() => setBannerFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      bannerFilterStatus === 'all'
                        ? 'bg-green-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setBannerFilterStatus('active')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      bannerFilterStatus === 'active'
                        ? 'bg-green-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setBannerFilterStatus('inactive')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      bannerFilterStatus === 'inactive'
                        ? 'bg-gray-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              {/* Filtered Banners */}
              {(() => {
                const filteredBanners = banners
                  .filter(banner => {
                    // Type filter
                    if (bannerFilterType !== 'all' && banner.type !== bannerFilterType) return false;
                    // Status filter
                    if (bannerFilterStatus === 'active' && !banner.isActive) return false;
                    if (bannerFilterStatus === 'inactive' && banner.isActive) return false;
                    // Search filter
                    if (bannerSearchQuery) {
                      const query = bannerSearchQuery.toLowerCase();
                      return (
                        banner.title?.toLowerCase().includes(query) ||
                        banner.subtitle?.toLowerCase().includes(query) ||
                        banner.description?.toLowerCase().includes(query)
                      );
                    }
                    return true;
                  })
                  .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

                if (filteredBanners.length === 0) {
                  return (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                      <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-bold text-lg">No banners found</p>
                      <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredBanners.map(banner => (
                      <div 
                        key={banner.id} 
                        className={`relative rounded-2xl overflow-hidden group shadow-lg transition-all ${
                          !banner.isActive ? 'opacity-60 grayscale' : ''
                        }`}
                      >
                        {/* Banner Image */}
                        <div className="relative aspect-[21/9]">
                          <img 
                            src={banner.image} 
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-6">
                            <div className="max-w-md text-white">
                              <h3 className="text-2xl font-black mb-1">{banner.title}</h3>
                              {banner.subtitle && (
                                <p className="text-lg opacity-90 mb-2">{banner.subtitle}</p>
                              )}
                              {banner.buttonText && (
                                <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 font-bold text-sm inline-block">
                                  {banner.buttonText}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Banner Info Badge */}
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md border ${
                              banner.type === 'hero' 
                                ? 'bg-purple-500/80 text-white border-purple-400/50' 
                                : 'bg-orange-500/80 text-white border-orange-400/50'
                            }`}>
                              {banner.type === 'hero' ? '🏠 Hero' : '📢 Promo'}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md border ${
                              banner.isActive 
                                ? 'bg-green-500/80 text-white border-green-400/50' 
                                : 'bg-gray-500/80 text-white border-gray-400/50'
                            }`}>
                              {banner.isActive ? '✓ Active' : '✗ Inactive'}
                            </span>
                            {banner.displayOrder && (
                              <span className="px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md bg-blue-500/80 text-white border border-blue-400/50">
                                Order: {banner.displayOrder}
                              </span>
                            )}
                          </div>

                          {/* Display Location Info */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-black/60 backdrop-blur-md rounded-lg p-3 border border-white/20">
                              <p className="text-white text-xs font-bold mb-1">📍 Display Location:</p>
                              <div className="flex flex-wrap gap-2">
                                {banner.type === 'hero' ? (
                                  <>
                                    <span className="px-2 py-1 rounded bg-white/20 text-white text-xs font-bold">Mobile Home</span>
                                    <span className="px-2 py-1 rounded bg-white/20 text-white text-xs font-bold">Desktop Home</span>
                                  </>
                                ) : (
                                  <span className="px-2 py-1 rounded bg-white/20 text-white text-xs font-bold">Desktop Only</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setPreviewBanner(banner)}
                              className="p-2 rounded-xl bg-blue-500/80 hover:bg-blue-500 backdrop-blur-md text-white transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedBanner(banner);
                                setShowEditBannerModal(true);
                              }}
                              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateBanner(banner.id, { isActive: !banner.isActive });
                              }}
                              className={`p-2 rounded-xl backdrop-blur-md text-white transition-colors ${
                                banner.isActive 
                                  ? 'bg-green-500/80 hover:bg-green-500' 
                                  : 'bg-gray-500/80 hover:bg-gray-500'
                              }`}
                              title={banner.isActive ? "Deactivate" : "Activate"}
                            >
                              {banner.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Delete this banner?')) handleDeleteBanner(banner.id);
                              }}
                              className="p-2 rounded-xl bg-red-500/80 hover:bg-red-500 backdrop-blur-md text-white transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      );

      case "notifications": return <NotificationsAdmin />;
      case "users": return <UsersAdmin currentUserRole={role} />;
      case "roles": return <RolesAdmin />;
      case "settings": return <SettingsAdmin settings={storeSettings} onUpdateSettings={onUpdateSettings} />;
      default: return <div className="text-center text-gray-500 mt-20">Section under construction 🚧</div>;
    }
  };

  const renderSidebarContent = () => (
    <div 
      className="flex flex-col h-full bg-white"
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '100%'
      }}
    >
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-xl text-gray-900 tracking-tight">Admin Panel</h1>
            <p className="text-xs text-gray-500 font-medium">v2.0.0 • <span className="capitalize">{user?.user_metadata?.role || 'Admin'}</span></p>
          </div>
        </div>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto py-6 px-4 space-y-1"
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch' // Smooth scrolling in Chrome
        }}
      >
        {menuItems && menuItems.length > 0 ? menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as AdminSection)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-orange-50 text-orange-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className={`font-bold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500"
                />
              )}
            </button>
          );
        }) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>Loading menu items...</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button 
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
        >
          <ArrowDown className="w-4 h-4 rotate-90" />
          Exit to App
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex bg-[#F3F4F6]"
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
      {/* Sidebar - Desktop */}
      <div 
        className="flex w-72 bg-white border-r border-gray-200 flex-col"
        style={{ 
          width: '18rem',
          minWidth: '18rem',
          maxWidth: '18rem',
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
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>
            <h2 className="text-2xl font-black text-gray-900 capitalize">
              {menuItems.find(i => i.id === activeSection)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900">{user?.user_metadata?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@idealpoint.com'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black border-2 border-white shadow-sm overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.email?.[0].toUpperCase() || 'A'}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

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
              {/* Helper functions for preview */}
              {(() => {
                const getButtonStyleClasses = (style: string = 'gradient') => {
                  switch (style) {
                    case 'solid':
                      return 'bg-purple-500 text-white border-none';
                    case 'outline':
                      return 'bg-transparent text-white border-2 border-white';
                    case 'gradient':
                      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none';
                    case 'ghost':
                      return 'bg-white/10 backdrop-blur-md text-white border border-white/30';
                    case 'rounded':
                      return 'bg-purple-500 text-white border-none rounded-full';
                    default:
                      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none';
                  }
                };

                const getTextPositionClasses = (position: string = 'left') => {
                  switch (position) {
                    case 'left':
                      return 'text-left items-start';
                    case 'center':
                      return 'text-center items-center';
                    case 'right':
                      return 'text-right items-end';
                  }
                };

                const getAnimationVariants = (type: string = 'fade') => {
                  switch (type) {
                    case 'fade':
                      return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
                    case 'slide':
                      return { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 50 } };
                    case 'zoom':
                      return { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.2 } };
                    default:
                      return { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } };
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
                        {/* Overlay - only show if text is displayed */}
                        {(displayStyle === 'image-text' || displayStyle === 'image-text-button') && (
                          <div 
                            className={`absolute inset-0 flex flex-col justify-center p-4 ${getTextPositionClasses(textPosition)}`}
                            style={{
                              background: `linear-gradient(to right, rgba(0,0,0,${overlayOpacity / 100}) 0%, rgba(0,0,0,${overlayOpacity / 200}) 100%)`,
                            }}
                          >
                            <div className="text-white">
                              {previewBanner.title && (
                                <h4 className="text-lg font-black mb-1">{previewBanner.title}</h4>
                              )}
                              {previewBanner.subtitle && (
                                <p className="text-sm opacity-90 mb-2">{previewBanner.subtitle}</p>
                              )}
                              {previewBanner.description && (
                                <p className="text-xs opacity-80 mb-2">{previewBanner.description}</p>
                              )}
                              {displayStyle === 'image-text-button' && previewBanner.buttonText && (
                                <span className={`px-3 py-1 text-xs font-bold ${
                                  buttonStyle === 'rounded' ? 'rounded-full' : 'rounded-lg'
                                } ${getButtonStyleClasses(buttonStyle)}`}>
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
                        {/* Overlay - only show if text is displayed */}
                        {(displayStyle === 'image-text' || displayStyle === 'image-text-button') && (
                          <div 
                            className={`absolute inset-0 flex flex-col justify-center p-8 ${getTextPositionClasses(textPosition)}`}
                            style={{
                              background: `linear-gradient(to right, rgba(0,0,0,${overlayOpacity / 100}) 0%, rgba(0,0,0,${overlayOpacity / 200}) 100%)`,
                            }}
                          >
                            <div className="max-w-md text-white">
                              {previewBanner.title && (
                                <h4 className="text-4xl font-black mb-2">{previewBanner.title}</h4>
                              )}
                              {previewBanner.subtitle && (
                                <p className="text-xl opacity-90 mb-4">{previewBanner.subtitle}</p>
                              )}
                              {previewBanner.description && (
                                <p className="text-lg opacity-80 mb-4">{previewBanner.description}</p>
                              )}
                              {displayStyle === 'image-text-button' && previewBanner.buttonText && (
                                <span className={`px-6 py-3 font-bold ${
                                  buttonStyle === 'rounded' ? 'rounded-full' : 'rounded-lg'
                                } ${getButtonStyleClasses(buttonStyle)}`}>
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
