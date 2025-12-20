import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TestTube, Plus, TrendingUp, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { ABTest, ABTestVariant } from './types';

interface ABTestingProps {
  onClose: () => void;
  onRefresh: () => void;
}

export const ABTesting: React.FC<ABTestingProps> = ({ onClose, onRefresh }) => {
  const [testName, setTestName] = useState('');
  const [variants, setVariants] = useState<Array<{ title: string; message: string }>>([
    { title: '', message: '' },
    { title: '', message: '' },
  ]);
  const [splitRatio, setSplitRatio] = useState(50);
  const [tests, setTests] = useState<ABTest[]>([]);

  const addVariant = () => {
    setVariants([...variants, { title: '', message: '' }]);
  };

  const updateVariant = (index: number, field: 'title' | 'message', value: string) => {
    setVariants(variants.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleCreate = async () => {
    if (!testName || variants.some(v => !v.title || !v.message)) {
      toast.error('Please fill in all fields');
      return;
    }

    // In a real implementation, this would call the service
    toast.success('A/B test created successfully');
    onClose();
    onRefresh();
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
          className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-pink-100 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TestTube className="w-6 h-6 text-pink-600" />
                <h2 className="text-xl font-black text-gray-900">A/B Testing</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block font-bold text-gray-700 mb-2">Test Name *</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="e.g., Welcome Message Test"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-pink-400 transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Split Ratio</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="10"
                  value={splitRatio}
                  onChange={(e) => setSplitRatio(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-bold text-gray-700 w-20 text-right">
                  {splitRatio}/{100 - splitRatio}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {splitRatio}% will see variant A, {100 - splitRatio}% will see variant B
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block font-bold text-gray-700">Variants</label>
                <button
                  onClick={addVariant}
                  className="px-3 py-1 bg-pink-50 text-pink-600 rounded-lg text-sm font-bold hover:bg-pink-100 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-700">Variant {String.fromCharCode(65 + index)}</span>
                      {variants.length > 1 && (
                        <button
                          onClick={() => removeVariant(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-bold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Title *</label>
                        <input
                          type="text"
                          value={variant.title}
                          onChange={(e) => updateVariant(index, 'title', e.target.value)}
                          placeholder="Variant title"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-pink-400 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Message *</label>
                        <textarea
                          value={variant.message}
                          onChange={(e) => updateVariant(index, 'message', e.target.value)}
                          placeholder="Variant message"
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-pink-400 resize-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Preview */}
            {tests.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-pink-600" />
                  Test Performance
                </h3>
                <div className="space-y-3">
                  {tests.map((test) => (
                    <div key={test.id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-bold text-gray-900 mb-2">{test.name}</p>
                      <div className="grid grid-cols-2 gap-4">
                        {test.variants.map((variant) => (
                          <div key={variant.id} className="text-sm">
                            <p className="font-bold text-gray-700 mb-1">{variant.title}</p>
                            <div className="space-y-1 text-xs">
                              <p className="text-gray-600">Open Rate: {variant.openRate.toFixed(1)}%</p>
                              <p className="text-gray-600">Click Rate: {variant.clickRate.toFixed(1)}%</p>
                              {test.winnerId === variant.id && (
                                <p className="text-green-600 font-bold flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Winner
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-700 text-white rounded-xl font-bold shadow-lg shadow-pink-500/30"
              >
                Create A/B Test
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
