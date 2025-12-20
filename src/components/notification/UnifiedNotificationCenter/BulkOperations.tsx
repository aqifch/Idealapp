import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Trash, CheckSquare, Square, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { unifiedNotificationService } from '../../utils/unifiedNotificationService';
import { Notification } from './types';

interface BulkOperationsProps {
  onClose: () => void;
  onRefresh: () => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({ onClose, onRefresh }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [operation, setOperation] = useState<'delete' | 'mark_read' | 'mark_unread' | 'archive'>('mark_read');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await unifiedNotificationService.getAllNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
  };

  const handleBulkOperation = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one notification');
      return;
    }

    setProcessing(true);
    try {
      const success = await unifiedNotificationService.bulkOperation(
        Array.from(selectedIds),
        operation
      );

      if (success) {
        toast.success(`Bulk operation completed: ${selectedIds.size} notifications ${operation === 'delete' ? 'deleted' : operation === 'mark_read' ? 'marked as read' : operation === 'mark_unread' ? 'marked as unread' : 'archived'}`);
        setSelectedIds(new Set());
        await loadNotifications();
        onRefresh();
      } else {
        throw new Error('Bulk operation failed');
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      toast.error('Failed to perform bulk operation');
    } finally {
      setProcessing(false);
    }
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
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-black text-gray-900">Bulk Operations</h2>
                {selectedIds.size > 0 && (
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-bold">
                    {selectedIds.size} selected
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Operation Selector */}
            <div className="flex items-center gap-4">
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-gray-200 font-bold text-sm"
              >
                <option value="mark_read">Mark as Read</option>
                <option value="mark_unread">Mark as Unread</option>
                <option value="delete">Delete</option>
                <option value="archive">Archive</option>
              </select>
              <button
                onClick={handleBulkOperation}
                disabled={selectedIds.size === 0 || processing}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Apply to ${selectedIds.size}`
                )}
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Select All */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-gray-700 hover:text-purple-600"
                  >
                    {selectedIds.size === notifications.length ? (
                      <CheckSquare className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                    <span className="font-bold text-sm">
                      {selectedIds.size === notifications.length ? 'Deselect All' : 'Select All'}
                    </span>
                  </button>
                </div>

                {/* Notifications List */}
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <button
                      onClick={() => toggleSelect(notification.id)}
                      className="flex-shrink-0"
                    >
                      {selectedIds.has(notification.id) ? (
                        <CheckSquare className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{notification.title}</p>
                      <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No notifications available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
