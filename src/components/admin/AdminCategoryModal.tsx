import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Category } from '../../data/mockData';
import { toast } from 'sonner';
import { supabase } from '../../config/supabase';

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
    image: '',
    displayOrder: 0,
    description: '',
    isActive: true,
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP, and SVG images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // @ts-ignore
      const config = await import('../../config');
      const UPLOAD_API_URL = config.UPLOAD_API_URL || config.default?.UPLOAD_API_URL || 'http://localhost:5000/api/upload';

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(UPLOAD_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.url) {
        setFormData((prev: Partial<Category>) => ({ ...prev, image: data.url }));
        toast.success('Icon uploaded! ✅');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Upload failed: ' + (err?.message || 'Check if local server is running'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        name: '',
        icon: '🍔',
        image: '',
        displayOrder: 0,
        description: '',
        isActive: true,
      });
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
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
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
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

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
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

                {/* Category Icon — Upload or Emoji */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category Icon</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex gap-3 items-start">
                    {/* Preview */}
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {formData.image ? (
                        <img src={formData.image} alt="Icon" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <span className="text-3xl">{formData.icon || '🍔'}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      {/* Upload button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-sm transition-all disabled:opacity-60 w-full"
                      >
                        {isUploading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload className="w-4 h-4" /> Upload Icon</>
                        )}
                      </button>
                      <span className="text-xs text-gray-400">JPG, PNG, WebP, SVG · Max 5MB</span>
                    </div>
                  </div>

                  {/* Image URL input */}
                  {formData.image && (
                    <div className="mt-2 flex gap-2">
                      <div className="flex-1 relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.image || ''}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-xs bg-gray-50"
                          placeholder="Image URL"
                          readOnly
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="px-3 py-2 rounded-lg bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Emoji Fallback</label>
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
