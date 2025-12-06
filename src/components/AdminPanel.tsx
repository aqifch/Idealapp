import React, { useState } from "react";
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
  Shield
} from "lucide-react";
import { Product, Category, Deal, Banner, categories as defaultCategories, ProductSize } from "../data/mockData";
import { allProducts } from "../data/allProducts";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner@2.0.3";
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
  
  // Order Management State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderViewMode, setOrderViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

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

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, visible: permissions.canViewDashboard },
    { id: "products", label: "Products", icon: Package, visible: permissions.canManageProducts },
    { id: "orders", label: "Orders", icon: ShoppingBag, visible: permissions.canManageOrders },
    { id: "categories", label: "Categories", icon: Layers, visible: permissions.canManageCategories },
    { id: "marketing", label: "Marketing & Promos", icon: Megaphone, visible: permissions.canManageDeals || permissions.canManageBanners },
    { id: "users", label: "Users", icon: Users, visible: permissions.canManageUsers },
    { id: "roles", label: "Roles & Permissions", icon: Shield, visible: permissions.canManageRoles },
    { id: "notifications", label: "Notifications", icon: Bell, visible: permissions.canViewNotifications },
    { id: "settings", label: "Settings", icon: Settings, visible: permissions.canManageSettings },
  ].filter(item => item.visible);

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

    orders.forEach(order => {
      if (order.status !== 'cancelled' && order.date) {
        const date = new Date(order.date);
        if (!isNaN(date.getTime())) {
          salesByDay[date.getDay()] += (order.total || 0);
        }
      }
    });

    return days.map((day, index) => ({
      name: day,
      sales: salesByDay[index]
    }));
  };

  const getStats = () => {
    const activeOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = activeOrders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(o => o.customer)).size;
    
    return {
      revenue: totalRevenue,
      orders: totalOrders,
      products: products.length,
      customers: uniqueCustomers
    };
  };

  const stats = getStats();

  const getCategoryData = () => {
    return categories.map(cat => ({
      name: cat.name,
      value: products.filter(p => p.category === cat.name).length
    }));
  };

  const COLORS = ['#FF9F40', '#FFB74D', '#FFCC80', '#FFE0B2', '#FFF3E0'];

  const renderDashboard = () => (
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
        <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-sm h-[400px]">
          <h3 className="text-lg font-black text-gray-900 mb-6">Weekly Sales</h3>
          {stats.revenue > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
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
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
              <p>No sales data available yet</p>
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

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (onUpdateOrder) {
      onUpdateOrder(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
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
                  <p className="text-gray-600">{orders.length} total orders • Total Revenue: Rs {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</p>
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
                  const filteredOrders = filterOrders(orders);
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
              const filteredOrders = filterOrders(orders);
              
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
            // BANNERS SECTION
            <div className="grid grid-cols-1 gap-6">
              {banners.map(banner => (
                <div 
                  key={banner.id} 
                  className="relative rounded-2xl overflow-hidden group aspect-[21/9] shadow-lg"
                >
                  <img 
                    src={banner.image} 
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-8">
                    <div className="max-w-md text-white">
                      <h3 className="text-3xl font-black mb-2">{banner.title}</h3>
                      <p className="text-lg opacity-90 mb-4">{banner.subtitle}</p>
                      <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 font-bold text-sm">
                        {banner.link}
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setSelectedBanner(banner);
                        setShowEditBannerModal(true);
                      }}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Delete this banner?')) handleDeleteBanner(banner.id);
                      }}
                      className="p-2 rounded-xl bg-red-500/80 hover:bg-red-500 backdrop-blur-md text-white transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
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

  return (
    <div className="fixed inset-0 z-50 flex bg-[#F3F4F6]">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
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
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {menuItems.map((item) => {
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
          })}
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
          >
            <ArrowDown className="w-4 h-4 rotate-90" />
            Exit to App
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top Bar */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-8 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black text-gray-900 capitalize">
            {menuItems.find(i => i.id === activeSection)?.label}
          </h2>
          
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
    </div>
  );
};
