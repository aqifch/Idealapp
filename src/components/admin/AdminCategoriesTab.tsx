import React from "react";
import { motion } from "motion/react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Product, Category } from "../../data/mockData";

interface AdminCategoriesTabProps {
    categories: Category[];
    products: Product[];
    onDeleteCategory: (categoryId: string) => void;
    onOpenAddModal: () => void;
    onOpenEditModal: (category: Category) => void;
}

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
    categories,
    products,
    onDeleteCategory,
    onOpenAddModal,
    onOpenEditModal,
}) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Category Management</h2>
                    <p className="text-gray-600">Organize your menu with categories</p>
                </div>
                <motion.button
                    onClick={onOpenAddModal}
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
                                onClick={() => onOpenEditModal(category)}
                                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm(`Delete category ${category.name}?`)) {
                                        onDeleteCategory(category.id);
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
};
