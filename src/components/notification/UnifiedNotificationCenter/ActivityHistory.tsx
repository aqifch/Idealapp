import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Filter, Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { ActivityLog } from './types';

interface ActivityHistoryProps {
  onClose: () => void;
}

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({ onClose }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'notification' | 'campaign' | 'automation' | 'template'>('all');

  useEffect(() => {
    loadActivities();
  }, [filter]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the database
      // For now, we'll use mock data
      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          action: 'created',
          entityType: 'notification',
          entityId: 'notif-1',
          userId: 'user-1',
          userName: 'Admin User',
          details: { title: 'Welcome Notification' },
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          action: 'updated',
          entityType: 'campaign',
          entityId: 'campaign-1',
          userId: 'user-1',
          userName: 'Admin User',
          details: { status: 'active' },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Failed to load activity history');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      'Timestamp,Action,Entity Type,Entity ID,User,Details',
      ...activities.map(a => 
        `${a.timestamp},${a.action},${a.entityType},${a.entityId},${a.userName},"${JSON.stringify(a.details)}"`
      ),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Activity history exported');
  };

  const handleRollback = (activity: ActivityLog) => {
    if (confirm(`Rollback ${activity.action} on ${activity.entityType}?`)) {
      toast.info('Rollback functionality would be implemented here');
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.entityType === filter);

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
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-black text-gray-900">Activity History</h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold"
                >
                  <option value="all">All</option>
                  <option value="notification">Notifications</option>
                  <option value="campaign">Campaigns</option>
                  <option value="automation">Automations</option>
                  <option value="template">Templates</option>
                </select>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg font-bold text-sm hover:bg-gray-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
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
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading activity history...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold capitalize">
                            {activity.action}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold capitalize">
                            {activity.entityType}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-bold">{activity.userName}</span> {activity.action} {activity.entityType} {activity.entityId}
                        </p>
                        {Object.keys(activity.details).length > 0 && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                            {JSON.stringify(activity.details, null, 2)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRollback(activity)}
                        className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                        title="Rollback"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredActivities.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No activity history available</p>
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
