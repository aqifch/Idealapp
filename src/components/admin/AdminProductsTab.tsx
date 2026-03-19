import React, { useState } from "react";
import { motion } from "motion/react";
import {
    LayoutDashboard,
    Package,
    Search,
    Plus,
    Edit2,
    Trash2,
    Filter,
    Download,
    Layers,
} from "lucide-react";
import { List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { Product, Category } from "../../data/mockData";
import { toast } from "sonner";

interface AdminProductsTabProps {
    products: Product[];
    categories: Category[];
    onDeleteProduct: (productId: string) => void;
    onResetProducts?: () => void;
    onOpenAddModal: () => void;
    onOpenEditModal: (product: Product) => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
    products,
    categories,
    onDeleteProduct,
    onResetProducts,
    onOpenAddModal,
    onOpenEditModal,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');

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
                            className={`px-3 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${productViewMode === 'grid'
                                    ? 'bg-orange-500 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Grid
                        </button>
                        <button
                            onClick={() => setProductViewMode('list')}
                            className={`px-3 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${productViewMode === 'list'
                                    ? 'bg-orange-500 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Layers className="w-4 h-4" />
                            List
                        </button>
                    </div>

                    <motion.button
                        onClick={onOpenAddModal}
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
                                onClick={onOpenAddModal}
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
                            onClick={onOpenAddModal}
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
                            <thead className="bg-orange-50/50 block w-full">
                                <tr className="flex w-full">
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 flex-[2]">Product</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 flex-1">Category</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 flex-1">Price</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 flex-1">Status</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 flex-1">Rating</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 flex-1">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="block w-full">
                                <tr>
                                    <td className="w-full">
                                        <div style={{ height: "500px", width: "100%" }}>
                                            <AutoSizer renderProp={({ height, width }: { height: number | undefined; width: number | undefined }) => (
                                                <List<any>
                                                    style={{ height: height || 500, width: width || 800 }}
                                                    rowCount={filteredProducts.length}
                                                    rowHeight={80} // Approx height of each list row
                                                    rowProps={{}}
                                                    rowComponent={({ index, style }: any) => {
                                                        const product = filteredProducts[index];
                                                        return (
                                                            <div
                                                                key={product.id}
                                                                className="border-t border-gray-100 hover:bg-orange-50/30 transition-all flex items-center"
                                                                style={{
                                                                    ...style,
                                                                    display: 'flex',
                                                                    width: '100%',
                                                                    borderBottom: '1px solid #f3f4f6',
                                                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                                                                }}
                                                            >
                                                                <div className="py-4 px-6 flex-[2] overflow-hidden">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="font-bold text-gray-900 truncate" title={product.name}>{product.name}</div>
                                                                            {product.isPopular && <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1 rounded inline-block mt-0.5">POPULAR</span>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="py-4 px-6 text-gray-700 flex-1 truncate">{product.category}</div>
                                                                <div className="py-4 px-6 font-bold text-gray-900 flex-1 truncate">
                                                                    Rs {product.price}
                                                                    {product.originalPrice && (
                                                                        <span className="text-xs text-gray-400 line-through ml-2">Rs {product.originalPrice}</span>
                                                                    )}
                                                                </div>
                                                                <div className="py-4 px-6 flex-1">
                                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${product.inStock !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                        {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                                                                    </span>
                                                                </div>
                                                                <div className="py-4 px-6 text-gray-700 flex-1">
                                                                    <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                                                                        ⭐ {product.rating}
                                                                    </div>
                                                                </div>
                                                                <div className="py-4 px-6 flex-1">
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => onOpenEditModal(product)}
                                                                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all flex-shrink-0"
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
                                                                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all flex-shrink-0"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            )} />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                // Grid View
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
                                        onClick={() => onOpenEditModal(product)}
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
