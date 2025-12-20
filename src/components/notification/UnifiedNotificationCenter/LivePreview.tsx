import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, Smartphone, Monitor, Send } from 'lucide-react';
import { toast } from 'sonner';

interface LivePreviewProps {
  onClose: () => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ onClose }) => {
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [title, setTitle] = useState('🎉 Welcome to IDEAL POINT!');
  const [message, setMessage] = useState('Get 20% off on your first order! Use code: WELCOME20');
  const [imageUrl, setImageUrl] = useState('');

  const handleSendTest = () => {
    toast.success('Test notification sent!');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-cyan-100 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-cyan-600" />
                <h2 className="text-xl font-black text-gray-900">Live Preview</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${
                    previewMode === 'mobile'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 inline mr-1" />
                  Mobile
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${
                    previewMode === 'desktop'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Monitor className="w-4 h-4 inline mr-1" />
                  Desktop
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">Edit Content</h3>
                <div>
                  <label className="block font-bold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-cyan-400 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-2">Image URL (Optional)</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSendTest}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-700 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Test Notification
                </button>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">Preview</h3>
                <div
                  className={`bg-gray-100 rounded-2xl p-6 ${
                    previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                  }`}
                >
                  <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                    {imageUrl && (
                      <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h4 className="font-bold text-gray-900 mb-2">{title || 'Notification Title'}</h4>
                    <p className="text-sm text-gray-600">{message || 'Notification message will appear here'}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Just now</span>
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
