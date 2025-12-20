import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Product, Category } from '../data/mockData';
import { toast } from 'sonner';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: any) => void;
  categories: Category[];
}

export const AdminProductModal = ({ isOpen, onClose, product, onSave, categories }: AdminProductModalProps) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: '',
    description: '',
    image: '',
    inStock: true,
    isPopular: false,
    isVeg: false,
    isSpicy: false,
    discount: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        price: 0,
        category: categories[0]?.name || '',
        description: '',
        image: '',
        inStock: true,
        isPopular: false,
        isVeg: false,
        isSpicy: false,
        discount: 0,
      });
    }
  }, [product, categories, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Ensure numeric values
    const dataToSave = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount || 0),
      rating: product?.rating || 5.0, // Default rating
    };

    onSave(dataToSave);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h3>
                  <p className="text-sm text-gray-500">Fill in the details below</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="e.g. Double Cheeseburger"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Price (Rs) *</label>
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Discount %</label>
                      <input
                        type="number"
                        value={formData.discount || ''}
                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="0"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                      <select
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.image || ''}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        {formData.image && (
                          <div className="w-12 h-12 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                        placeholder="Product description..."
                      />
                    </div>

                    {/* Toggles */}
                    <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.inStock || false}
                          onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                          className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                        />
                        <span className="font-bold text-sm text-gray-700">In Stock</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.isPopular || false}
                          onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                          className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                        />
                        <span className="font-bold text-sm text-gray-700">Popular</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.isVeg || false}
                          onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                          className="w-5 h-5 rounded text-green-500 focus:ring-green-500"
                        />
                        <span className="font-bold text-sm text-gray-700">Veg</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.isSpicy || false}
                          onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
                          className="w-5 h-5 rounded text-red-500 focus:ring-red-500"
                        />
                        <span className="font-bold text-sm text-gray-700">Spicy</span>
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 rounded-xl font-bold bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Product
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
