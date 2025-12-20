import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Image as ImageIcon, Play, Sparkles } from 'lucide-react';
import { Banner } from '../../data/mockData';
import { toast } from 'sonner';

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
    displayStyle: 'image-text-button',
    animationType: 'fade',
    buttonStyle: 'gradient',
    textPosition: 'left',
    overlayOpacity: 70,
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
        displayStyle: 'image-text-button',
        animationType: 'fade',
        buttonStyle: 'gradient',
        textPosition: 'left',
        overlayOpacity: 70,
      });
    }
  }, [banner, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      toast.error('Image URL is required');
      return;
    }
    // Title only required if display style includes text
    if (formData.displayStyle !== 'image-only' && !formData.title) {
      toast.error('Title is required when text is displayed');
      return;
    }
    onSave(formData);
    onClose();
  };

  // Get button style classes
  const getButtonStyleClasses = (style: string) => {
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
        return 'bg-purple-500 text-white border-none';
    }
  };

  // Get text position classes
  const getTextPositionClasses = (position: string) => {
    switch (position) {
      case 'left':
        return 'text-left items-start';
      case 'center':
        return 'text-center items-center';
      case 'right':
        return 'text-right items-end';
      default:
        return 'text-left items-start';
    }
  };

  // Get animation variants
  const getAnimationVariants = (type: string) => {
    switch (type) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case 'slide':
        return {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 50 },
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.2 },
        };
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
        };
    }
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
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white flex justify-between items-center flex-shrink-0">
                <div>
                  <h3 className="text-xl font-black text-gray-900">{banner ? 'Edit Banner' : 'Add New Banner'}</h3>
                  <p className="text-sm text-gray-500">Manage home sliders</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Banner Type *</label>
                  <select 
                    value={formData.type || 'hero'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'hero' | 'promo' })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  >
                    <option value="hero">🏠 Hero Banner (Home Page - Mobile & Desktop)</option>
                    <option value="promo">📢 Promo Banner (Desktop Only)</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    {formData.type === 'hero' 
                      ? '✅ Will display on home page for all devices' 
                      : '⚠️ Will only display on desktop home page'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder || ''}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || undefined })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="1, 2, 3... (lower numbers show first)"
                    min="1"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Lower numbers appear first. Leave empty to add at the end.
                  </p>
                </div>

                {/* Display Style Selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Style *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, displayStyle: 'image-only' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.displayStyle === 'image-only'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <ImageIcon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-xs font-bold text-gray-700">Image Only</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, displayStyle: 'image-text' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.displayStyle === 'image-text'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <ImageIcon className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-bold text-gray-600">+</span>
                        <span className="text-xs font-bold text-gray-600">Text</span>
                      </div>
                      <div className="text-xs font-bold text-gray-700">Image + Text</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, displayStyle: 'image-text-button' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.displayStyle === 'image-text-button'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <ImageIcon className="w-3 h-3 text-gray-600" />
                        <span className="text-xs font-bold text-gray-600">+</span>
                        <span className="text-xs font-bold text-gray-600">T</span>
                        <span className="text-xs font-bold text-gray-600">+</span>
                        <div className="w-3 h-3 rounded bg-purple-500"></div>
                      </div>
                      <div className="text-xs font-bold text-gray-700">Full Featured</div>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Choose what elements to display on the banner
                  </p>
                </div>

                {/* Animation Type Selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Animation Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['fade', 'slide', 'zoom', 'none'] as const).map((anim) => (
                      <button
                        key={anim}
                        type="button"
                        onClick={() => setFormData({ ...formData, animationType: anim })}
                        className={`p-3 rounded-xl border-2 transition-all text-xs font-bold ${
                          formData.animationType === anim
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Play className="w-4 h-4 mx-auto mb-1" />
                        {anim.charAt(0).toUpperCase() + anim.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Position Selector */}
                {(formData.displayStyle === 'image-text' || formData.displayStyle === 'image-text-button') && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Text Position</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['left', 'center', 'right'] as const).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setFormData({ ...formData, textPosition: pos })}
                          className={`p-3 rounded-xl border-2 transition-all text-xs font-bold ${
                            formData.textPosition === pos
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          {pos.charAt(0).toUpperCase() + pos.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overlay Opacity Slider */}
                {(formData.displayStyle === 'image-text' || formData.displayStyle === 'image-text-button') && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Overlay Opacity: {formData.overlayOpacity || 70}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.overlayOpacity || 70}
                      onChange={(e) => setFormData({ ...formData, overlayOpacity: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Transparent</span>
                      <span>Opaque</span>
                    </div>
                  </div>
                )}

                {/* Button Style Selector */}
                {formData.displayStyle === 'image-text-button' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Button Style</label>
                    <div className="grid grid-cols-5 gap-2">
                      {(['solid', 'outline', 'gradient', 'ghost', 'rounded'] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setFormData({ ...formData, buttonStyle: style })}
                          className={`p-3 rounded-xl border-2 transition-all text-xs font-bold ${
                            formData.buttonStyle === style
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-full h-8 rounded mb-2 ${getButtonStyleClasses(style)}`}></div>
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Title {formData.displayStyle !== 'image-only' ? '*' : ''}
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="e.g. THE ULTIMATE"
                  />
                </div>

                {(formData.displayStyle === 'image-text' || formData.displayStyle === 'image-text-button') && (
                  <>
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
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="Optional description text"
                        rows={2}
                      />
                    </div>
                  </>
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

                {formData.displayStyle === 'image-text-button' && (
                  <>
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

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Button Link (Optional)</label>
                      <input
                        type="text"
                        value={formData.buttonLink || ''}
                        onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="/products or https://example.com"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">
                    Active (Banner will be visible to users)
                  </label>
                </div>

                {/* Preview Section */}
                {formData.image && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Live Preview</label>
                    <motion.div 
                      className="relative rounded-xl overflow-hidden border-2 border-gray-200" 
                      style={{ height: '180px' }}
                      {...getAnimationVariants(formData.animationType || 'fade')}
                      transition={{ duration: 0.5 }}
                    >
                      <img 
                        src={formData.image} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay */}
                      {(formData.displayStyle === 'image-text' || formData.displayStyle === 'image-text-button') && (
                        <div 
                          className="absolute inset-0 flex flex-col justify-center p-4"
                          style={{
                            background: `linear-gradient(to right, rgba(0,0,0,${(formData.overlayOpacity || 70) / 100}) 0%, rgba(0,0,0,${(formData.overlayOpacity || 70) / 200}) 100%)`,
                          }}
                        >
                          <div className={`text-white ${getTextPositionClasses(formData.textPosition || 'left').split(' ')[0]}`}>
                            {formData.title && (
                              <h4 className="text-base font-black mb-1">{formData.title}</h4>
                            )}
                            {formData.subtitle && (
                              <p className="text-xs opacity-90 mb-2">{formData.subtitle}</p>
                            )}
                            {formData.description && (
                              <p className="text-xs opacity-80 mb-2">{formData.description}</p>
                            )}
                            {formData.displayStyle === 'image-text-button' && formData.buttonText && (
                              <button 
                                className={`mt-2 px-3 py-1 text-xs font-bold transition-all ${
                                  formData.buttonStyle === 'rounded' ? 'rounded-full' : 'rounded-lg'
                                } ${getButtonStyleClasses(formData.buttonStyle || 'gradient')}`}
                              >
                                {formData.buttonText}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className={`px-2 py-1 rounded ${formData.type === 'hero' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                        {formData.type === 'hero' ? '🏠 Hero' : '📢 Promo'}
                      </span>
                      <span className={`px-2 py-1 rounded ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {formData.isActive ? '✓ Active' : '✗ Inactive'}
                      </span>
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">
                        {formData.displayStyle === 'image-only' ? '🖼️ Image Only' : 
                         formData.displayStyle === 'image-text' ? '📝 Image+Text' : 
                         '✨ Full Featured'}
                      </span>
                      <span className="px-2 py-1 rounded bg-pink-100 text-pink-700">
                        🎬 {formData.animationType?.charAt(0).toUpperCase() + formData.animationType?.slice(1) || 'Fade'}
                      </span>
                      {formData.displayOrder && (
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                          Order: {formData.displayOrder}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all z-10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 rounded-xl font-bold bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2 z-10"
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
