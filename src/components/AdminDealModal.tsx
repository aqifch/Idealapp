import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Calendar, Layout, List, Grid, Zap } from 'lucide-react';
import { Deal, Product } from '../data/mockData';
import { toast } from 'sonner';

interface AdminDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
  onSave: (deal: any) => void;
  products?: Product[];
}

export const AdminDealModal = ({ isOpen, onClose, deal, onSave, products = [] }: AdminDealModalProps) => {
  const [formData, setFormData] = useState<Partial<Deal>>({
    title: '',
    description: '',
    discountPercentage: 0,
    couponCode: '',
    startDate: '',
    endDate: '',
    isActive: true,
    backgroundColor: '#FF9F40',
    textColor: '#FFFFFF',
    displayOrder: 0,
    template: 'featured_grid',
    productId: '',
  });

  useEffect(() => {
    if (deal) {
      setFormData(deal);
    } else {
      setFormData({
        title: '',
        description: '',
        discountPercentage: 0,
        couponCode: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
        isActive: true,
        backgroundColor: '#FF9F40',
        textColor: '#FFFFFF',
        displayOrder: 0,
        template: 'featured_grid',
        productId: '',
      });
    }
  }, [deal, isOpen]);

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProductId = e.target.value;
    const product = products.find(p => p.id === selectedProductId);
    
    if (product) {
      setFormData({
        ...formData,
        productId: selectedProductId,
        title: formData.title || product.name,
        description: formData.description || product.description,
        image: formData.image || product.image,
      });
    } else {
      setFormData({
        ...formData,
        productId: '',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.couponCode) {
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
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-gray-900">{deal ? 'Edit Deal' : 'Add New Deal'}</h3>
                  <p className="text-sm text-gray-500">Manage promotions and templates</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Status and Order Row */}
                <div className="flex gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                            formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                              formData.isActive ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`font-bold text-sm ${formData.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {formData.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                   </div>
                   <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Display Order</label>
                      <input
                        type="number"
                        value={formData.displayOrder || 0}
                        onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-500 outline-none transition-all bg-white"
                      />
                   </div>
                </div>

                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Link Product (Optional)</label>
                  <select
                    value={formData.productId || ''}
                    onChange={handleProductSelect}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  >
                    <option value="">-- No Product Linked --</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.category})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1 ml-1">Selecting a product will auto-fill title, description and image if empty</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deal Title *</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="e.g. Summer Splash"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Code *</label>
                    <input
                      type="text"
                      value={formData.couponCode || ''}
                      onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none transition-all bg-gray-50 focus:bg-white uppercase font-mono"
                      placeholder="SAVE50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Discount %</label>
                    <input
                      type="number"
                      value={formData.discountPercentage || ''}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Display Template</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'flash_sale', label: 'Flash Sale Card', icon: Zap },
                      { id: 'featured_grid', label: 'Featured Grid', icon: Grid },
                      { id: 'minimal_list', label: 'Minimal List', icon: List },
                    ].map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setFormData({ ...formData, template: template.id as any })}
                        className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center ${
                          formData.template === template.id
                            ? 'border-pink-500 bg-pink-50 text-pink-600'
                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        <template.icon className="w-6 h-6" />
                        <span className="text-xs font-bold">{template.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.startDate || ''}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                    placeholder="Deal description..."
                  />
                </div>

                {/* Image URL Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor || '#FF9F40'}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <span className="text-sm text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                      {formData.backgroundColor || '#FF9F40'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.textColor || '#FFFFFF'}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <span className="text-sm text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                      {formData.textColor || '#FFFFFF'}
                    </span>
                  </div>
                </div>
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
                  className="px-6 py-3 rounded-xl font-bold bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Deal
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
