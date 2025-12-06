import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import { Banner } from '../data/mockData';
import { toast } from 'sonner@2.0.3';

interface AdminBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: Banner | null;
  onSave: (banner: any) => void;
}

export const AdminBannerModal = ({ isOpen, onClose, banner, onSave }: AdminBannerModalProps) => {
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: 'Order Now',
    isActive: true,
    type: 'hero',
  });

  useEffect(() => {
    if (banner) {
      setFormData(banner);
    } else {
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        image: '',
        buttonText: 'Order Now',
        isActive: true,
        type: 'hero',
      });
    }
  }, [banner, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
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
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-gray-900">{banner ? 'Edit Banner' : 'Add New Banner'}</h3>
                  <p className="text-sm text-gray-500">Manage home sliders</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Banner Type</label>
                  <select 
                    value={formData.type || 'hero'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'hero' | 'promo' })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  >
                    <option value="hero">Hero Slider</option>
                    <option value="promo">Promo Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="e.g. THE ULTIMATE"
                  />
                </div>

                {formData.type === 'hero' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="e.g. CHEESEBURGER"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image URL *</label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="https://example.com/banner.jpg"
                      />
                    </div>
                  </div>
                  {formData.image && (
                    <div className="mt-2 w-full h-32 rounded-xl border border-gray-200 overflow-hidden">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText || ''}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="Order Now"
                  />
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
                  className="px-6 py-3 rounded-xl font-bold bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Banner
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
