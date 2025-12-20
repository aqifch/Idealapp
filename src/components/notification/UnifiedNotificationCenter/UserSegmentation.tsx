import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Plus, Save, Trash, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { UserSegment, SegmentFilter } from './types';
import { getSegments, saveSegment, getSegmentUserCount } from '../../utils/notificationSegmentation';

interface UserSegmentationProps {
  users?: any[];
  onClose: () => void;
}

export const UserSegmentation: React.FC<UserSegmentationProps> = ({ onClose }) => {
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  const [filters, setFilters] = useState<SegmentFilter[]>([]);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    loadSegments();
  }, []);

  useEffect(() => {
    if (filters.length > 0) {
      updateUserCount();
    }
  }, [filters]);

  const loadSegments = async () => {
    setLoading(true);
    try {
      const data = await getSegments();
      setSegments(data);
    } catch (error) {
      console.error('Error loading segments:', error);
      toast.error('Failed to load segments');
    } finally {
      setLoading(false);
    }
  };

  const updateUserCount = async () => {
    const count = await getSegmentUserCount(filters);
    setUserCount(count);
  };

  const addFilter = () => {
    setFilters([...filters, { field: 'role', operator: 'equals', value: '' }]);
  };

  const updateFilter = (index: number, filter: SegmentFilter) => {
    setFilters(filters.map((f, i) => i === index ? filter : f));
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!segmentName || filters.length === 0) {
      toast.error('Please provide segment name and at least one filter');
      return;
    }

    const segment = await saveSegment({
      name: segmentName,
      description: segmentDescription,
      filters,
    });

    if (segment) {
      toast.success('Segment saved successfully');
      setShowCreateModal(false);
      resetForm();
      loadSegments();
    }
  };

  const resetForm = () => {
    setSegmentName('');
    setSegmentDescription('');
    setFilters([]);
    setUserCount(0);
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
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-black text-gray-900">User Segmentation</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Segment
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
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading segments...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {segments.map((segment) => (
                  <div key={segment.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{segment.name}</h3>
                        {segment.description && (
                          <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                        {segment.userCount} users
                      </span>
                    </div>
                    <div className="space-y-2">
                      {segment.filters.map((filter, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {filter.field} {filter.operator} {String(filter.value)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {segments.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No segments yet</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700"
                    >
                      Create First Segment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Create Segment Modal */}
          <AnimatePresence>
            {showCreateModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
                onClick={() => setShowCreateModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-gray-900">Create Segment</h3>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Segment Name *</label>
                      <input
                        type="text"
                        value={segmentName}
                        onChange={(e) => setSegmentName(e.target.value)}
                        placeholder="e.g., VIP Customers"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={segmentDescription}
                        onChange={(e) => setSegmentDescription(e.target.value)}
                        placeholder="Describe this segment..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 resize-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-bold text-gray-700">Filters</label>
                        <button
                          onClick={addFilter}
                          className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Filter
                        </button>
                      </div>

                      <div className="space-y-2">
                        {filters.map((filter, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <select
                              value={filter.field}
                              onChange={(e) => updateFilter(index, { ...filter, field: e.target.value })}
                              className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                            >
                              <option value="role">Role</option>
                              <option value="created_at">Registration Date</option>
                              <option value="email">Email</option>
                            </select>
                            <select
                              value={filter.operator}
                              onChange={(e) => updateFilter(index, { ...filter, operator: e.target.value as any })}
                              className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                            >
                              <option value="equals">Equals</option>
                              <option value="not_equals">Not Equals</option>
                              <option value="contains">Contains</option>
                              <option value="greater_than">Greater Than</option>
                              <option value="less_than">Less Than</option>
                            </select>
                            <input
                              type="text"
                              value={filter.value}
                              onChange={(e) => updateFilter(index, { ...filter, value: e.target.value })}
                              placeholder="Value"
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                            />
                            <button
                              onClick={() => removeFilter(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {filters.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-bold text-blue-900 mb-1">Estimated Users: {userCount}</p>
                          <p className="text-xs text-blue-700">This segment will target {userCount} users</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowCreateModal(false);
                          resetForm();
                        }}
                        className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Save Segment
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
