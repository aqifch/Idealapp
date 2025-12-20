import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { Category } from '../data/mockData';
import { toast } from 'sonner';

interface AdminCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSave: (category: any) => void;
}

export const AdminCategoryModal = ({ isOpen, onClose, category, onSave }: AdminCategoryModalProps) => {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    icon: '🍔',
    displayOrder: 0,
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        name: '',
        icon: '🍔',
        displayOrder: 0,
        description: '',
        isActive: true,
      });
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.icon) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
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
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-gray-900">{category ? 'Edit Category' : 'Add New Category'}</h3>
                  <p className="text-sm text-gray-500">Organize your menu</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="e.g. Burgers"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Icon (Emoji) *</label>
                    <input
                      type="text"
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-center text-2xl"
                      placeholder="🍔"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder || ''}
                      onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                    placeholder="Category description..."
                  />
                </div>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span className="font-bold text-gray-700">Active Category</span>
                </label>
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
                  className="px-6 py-3 rounded-xl font-bold bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Category
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
