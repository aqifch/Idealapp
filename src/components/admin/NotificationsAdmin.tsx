import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Plus, Send, Trash, Edit2, Eye, Package, Gift, ShoppingCart, Star, X, Save, AlertCircle, Image as ImageIcon, Tag, Zap, Megaphone, FileText } from 'lucide-react';
import { getProjectId, getPublicAnonKey, getFunctionUrl } from '../../config/supabase';
import { toast } from 'sonner';
import { localNotifications } from '../../utils/notifications/localNotifications';
import { Product, Deal } from '../../data/mockData';
import { NotificationAutomationAdmin } from './NotificationAutomationAdmin';
import { NotificationCampaignsAdmin } from './NotificationCampaignsAdmin';
import { NotificationTemplatesAdmin } from './NotificationTemplatesAdmin';

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'reward' | 'delivery' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isNew: boolean;
  isRead: boolean;
  targetUserId?: string;
  actionUrl?: string | null;
  imageUrl?: string | null;
  productId?: string | null;
  dealId?: string | null;
  createdBy?: string;
  isBroadcast?: boolean;
}

interface NotificationStats {
  total: number;
  new: number;
  read: number;
  byType: {
    order: number;
    promo: number;
    reward: number;
    delivery: number;
    system: number;
  };
  broadcast: number;
}

interface NotificationsAdminProps {
  products?: Product[];
  deals?: Deal[];
}

export const NotificationsAdmin = ({ products = [], deals = [] }: NotificationsAdminProps) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'automations' | 'campaigns' | 'templates'>('manual');
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    return localNotifications.getAll().sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });
  const [stats, setStats] = useState<NotificationStats | null>(() => {
    return localNotifications.getStats();
  });
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [viewDetailsNotification, setViewDetailsNotification] = useState<Notification | null>(null);
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'promo' as 'order' | 'promo' | 'reward' | 'delivery' | 'system',
    title: '',
    message: '',
    targetUserId: 'all',
    actionUrl: '',
    imageUrl: '',
    linkedItemType: 'none' as 'none' | 'product' | 'deal',
    selectedItemId: '',
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        getFunctionUrl('make-server-b09ae082/notifications'),
        {
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const serverNotifs = data.notifications || [];
          
          // Get local-only notifications (those created when offline/fallback)
          const localNotifs = localNotifications.getAll();
          const localOnly = localNotifs.filter(n => n.id.startsWith('local:'));
          
          // Merge server notifications with local-only ones
          // We prioritize server notifications if there's a conflict (unlikely due to ID format)
          const merged = [...serverNotifs, ...localOnly].sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          setNotifications(merged);
          // Sync the merged list back to local storage so we don't lose local items
          localNotifications.sync(merged);
          
          setUseLocalFallback(false);
          return;
        }
      }
      
      throw new Error('Server unavailable');
    } catch (error) {
      console.log('ℹ️ Server unavailable, using local storage fallback');
      setUseLocalFallback(true);
      // We already loaded from local, but let's refresh just in case
      const localNotifs = localNotifications.getAll().sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setNotifications(localNotifs);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      if (useLocalFallback) {
        setStats(localNotifications.getStats());
        return;
      }
      
      const response = await fetch(
        getFunctionUrl('make-server-b09ae082/notifications/stats'),
        {
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          return;
        }
      }
      
      // Fallback to local
      setStats(localNotifications.getStats());
    } catch (error) {
      console.log('ℹ️ Error fetching stats, falling back to local');
      setStats(localNotifications.getStats());
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (notifications.length === 0) {
        setLoading(true);
      }
      await Promise.all([fetchNotifications(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Create notification
  const handleCreateNotification = async (isBroadcast: boolean = false) => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const notificationData = {
      type: formData.type,
      title: formData.title,
      message: formData.message,
      targetUserId: isBroadcast ? 'all' : formData.targetUserId,
      actionUrl: formData.actionUrl || null,
      imageUrl: formData.imageUrl || null,
      productId: formData.linkedItemType === 'product' ? formData.selectedItemId : null,
      dealId: formData.linkedItemType === 'deal' ? formData.selectedItemId : null,
    };

    try {
      if (useLocalFallback) {
        // Use local storage
        localNotifications.create({
          ...notificationData,
          createdBy: 'admin',
          isBroadcast: isBroadcast,
        });
        
        toast.success(isBroadcast ? '📢 Broadcast sent to all users!' : '✅ Notification created!');
        setShowCreateModal(false);
        resetForm();
        await Promise.all([fetchNotifications(), fetchStats()]);
        return;
      }
      
      const endpoint = isBroadcast
        ? getFunctionUrl('make-server-b09ae082/notifications/broadcast')
        : getFunctionUrl('make-server-b09ae082/notifications');

      console.log('📤 Creating notification:', {
        endpoint,
        isBroadcast,
        data: notificationData
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notification created:', data);
        
        if (data.success) {
          toast.success(isBroadcast ? '📢 Broadcast sent to all users!' : '✅ Notification created!');
          setShowCreateModal(false);
          resetForm();
          await Promise.all([fetchNotifications(), fetchStats()]);
          return;
        }
      }
      
      throw new Error('Server unavailable');
    } catch (error) {
      console.log('ℹ️ Error creating notification, falling back to local');
      // Fallback to local
      console.log('ℹ️ Using local storage fallback');
      localNotifications.create({
        ...notificationData,
        createdBy: 'admin',
        isBroadcast: isBroadcast,
      });
      
      toast.success(isBroadcast ? '📢 Broadcast sent (local mode)' : '✅ Notification created (local mode)');
      setShowCreateModal(false);
      resetForm();
      setUseLocalFallback(true);
      await Promise.all([fetchNotifications(), fetchStats()]);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'promo',
      title: '',
      message: '',
      targetUserId: 'all',
      actionUrl: '',
      imageUrl: '',
      linkedItemType: 'none',
      selectedItemId: '',
    });
    setSelectedNotification(null);
    setViewDetailsNotification(null);
  };

  // Edit notification - populate form with existing data
  const handleEdit = (notification: Notification) => {
    // Close details modal if open
    setViewDetailsNotification(null);
    // Populate the form and open the edit modal
    setFormData({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      targetUserId: notification.targetUserId || 'all',
      actionUrl: notification.actionUrl || '',
      imageUrl: notification.imageUrl || '',
      linkedItemType: notification.productId ? 'product' : notification.dealId ? 'deal' : 'none',
      selectedItemId: notification.productId || notification.dealId || '',
    });
    // Store the notification for update
    setSelectedNotification(notification);
    setShowCreateModal(true);
  };

  // View notification details (Eye icon)
  const handleViewDetails = (notification: Notification) => {
    // Close edit modal if open
    setShowCreateModal(false);
    setSelectedNotification(null);
    // Show details modal
    setViewDetailsNotification(notification);
  };

  // Update notification
  const handleUpdateNotification = async () => {
    if (!selectedNotification || !formData.title || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const notificationData = {
      type: formData.type,
      title: formData.title,
      message: formData.message,
      targetUserId: formData.targetUserId,
      actionUrl: formData.actionUrl || null,
      imageUrl: formData.imageUrl || null,
      productId: formData.linkedItemType === 'product' ? formData.selectedItemId : null,
      dealId: formData.linkedItemType === 'deal' ? formData.selectedItemId : null,
    };

    try {
      if (useLocalFallback || selectedNotification.id.startsWith('local:')) {
        // Update in local storage
        localNotifications.update(selectedNotification.id, {
          ...notificationData,
          isBroadcast: formData.targetUserId === 'all',
        });
        toast.success('✅ Notification updated!');
        setShowCreateModal(false);
        resetForm();
        await Promise.all([fetchNotifications(), fetchStats()]);
        return;
      }
      
      // Try to update via server (if it's a database notification)
      const response = await fetch(
        getFunctionUrl(`make-server-b09ae082/notifications/${selectedNotification.id.replace('notification:', '')}`),
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notificationData),
        }
      );

      if (response.ok) {
        toast.success('✅ Notification updated!');
        setShowCreateModal(false);
        resetForm();
        await Promise.all([fetchNotifications(), fetchStats()]);
      } else {
        throw new Error('Failed to update notification');
      }
    } catch (error) {
      console.log('ℹ️ Error updating notification, falling back to local');
      // Fallback to local
      localNotifications.update(selectedNotification.id, {
        ...notificationData,
        isBroadcast: formData.targetUserId === 'all',
      });
      toast.success('✅ Notification updated (local mode)!');
      setShowCreateModal(false);
      resetForm();
      setUseLocalFallback(true);
      await Promise.all([fetchNotifications(), fetchStats()]);
    }
  };

  // Delete notification
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      if (useLocalFallback) {
        localNotifications.delete(id);
        toast.success('🗑️ Notification deleted');
        await Promise.all([fetchNotifications(), fetchStats()]);
        return;
      }
      
      const response = await fetch(
        getFunctionUrl(`make-server-b09ae082/notifications/${id}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getPublicAnonKey()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete notification');

      toast.success('🗑️ Notification deleted');
      await Promise.all([fetchNotifications(), fetchStats()]);
    } catch (error) {
      console.log('ℹ️ Error deleting notification, falling back to local');
      // Fallback to local
      localNotifications.delete(id);
      toast.success('🗑️ Notification deleted (local mode)');
      setUseLocalFallback(true);
      await Promise.all([fetchNotifications(), fetchStats()]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-5 h-5 text-orange-600" />;
      case 'promo': return <Gift className="w-5 h-5 text-amber-600" />;
      case 'reward': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'delivery': return <ShoppingCart className="w-5 h-5 text-green-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'order': return 'from-orange-50 to-orange-100';
      case 'promo': return 'from-amber-50 to-orange-100';
      case 'reward': return 'from-yellow-50 to-amber-100';
      case 'delivery': return 'from-green-50 to-green-100';
      default: return 'from-gray-50 to-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Notification Management</h2>
          <p className="text-gray-600 mt-1">Complete notification system with automation and campaigns</p>
        </div>
        {activeTab === 'manual' && (
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30"
          >
            <Plus className="w-5 h-5" />
            New Notification
          </motion.button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1">
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'manual'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            whileHover={{ scale: activeTab === 'manual' ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Bell className="w-5 h-5" />
            Manual
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('automations')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'automations'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            whileHover={{ scale: activeTab === 'automations' ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap className="w-5 h-5" />
            Automations
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'campaigns'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            whileHover={{ scale: activeTab === 'campaigns' ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Megaphone className="w-5 h-5" />
            Campaigns
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            whileHover={{ scale: activeTab === 'templates' ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText className="w-5 h-5" />
            Templates
          </motion.button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'manual' && (
        <>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatsCard title="Total" value={stats.total} icon={<Bell />} color="bg-blue-500" />
          <StatsCard title="Unread" value={stats.new} icon={<Bell />} color="bg-red-500" />
          <StatsCard title="Orders" value={stats.byType.order} icon={<Package />} color="bg-orange-500" />
          <StatsCard title="Promos" value={stats.byType.promo} icon={<Gift />} color="bg-amber-500" />
          <StatsCard title="Rewards" value={stats.byType.reward} icon={<Star />} color="bg-yellow-500" />
          <StatsCard title="Broadcasts" value={stats.broadcast} icon={<Send />} color="bg-purple-500" />
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <h3 className="font-black text-xl text-gray-900">All Notifications ({notifications.length})</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon/Image */}
                  {notification.imageUrl ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img src={notification.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeBgColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                      {getTypeIcon(notification.type)}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{notification.title}</h4>
                          {notification.isNew && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">NEW</span>
                          )}
                          {notification.isBroadcast && (
                            <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">BROADCAST</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="font-medium uppercase">{notification.type}</span>
                          <span>•</span>
                          <span>{new Date(notification.timestamp).toLocaleString()}</span>
                          {notification.targetUserId === 'all' ? (
                            <>
                              <span>•</span>
                              <span className="text-purple-600 font-medium">All Users</span>
                            </>
                          ) : notification.targetUserId && (
                            <>
                              <span>•</span>
                              <span>User: {notification.targetUserId}</span>
                            </>
                          )}
                          {notification.productId && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600 font-medium flex items-center gap-1">
                                <Package className="w-3 h-3" /> Product Linked
                              </span>
                            </>
                          )}
                          {notification.dealId && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 font-medium flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Deal Linked
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => handleEdit(notification)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Edit Notification"
                        >
                          <Edit2 className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleViewDetails(notification)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(notification.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">No notifications yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first notification to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-gray-900">
                          {selectedNotification ? 'Edit Notification' : 'Create Notification'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedNotification ? 'Update notification details' : 'Send a notification to users'}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                  {/* Type */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                    >
                      <option value="order">Order Update</option>
                      <option value="promo">Promotion</option>
                      <option value="reward">Reward</option>
                      <option value="delivery">Delivery</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter notification title"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Message *</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Enter notification message"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors resize-none"
                    />
                  </div>

                  {/* Image URL (Optional) */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Image URL (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      />
                      {formData.imageUrl && (
                         <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden">
                           <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                         </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Paste a link to an image to display it in the notification</p>
                  </div>

                  {/* Link to Product/Deal */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">Link to Item (Optional)</label>
                    <select
                      value={formData.linkedItemType}
                      onChange={(e) => setFormData({ ...formData, linkedItemType: e.target.value as any, selectedItemId: '' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors mb-3"
                    >
                      <option value="none">No Link</option>
                      <option value="product">Link to Product</option>
                      <option value="deal">Link to Deal</option>
                    </select>

                    {formData.linkedItemType === 'product' && (
                      <select
                        value={formData.selectedItemId}
                        onChange={(e) => setFormData({ ...formData, selectedItemId: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      >
                        <option value="">Select a product...</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - Rs {product.price}
                          </option>
                        ))}
                      </select>
                    )}

                    {formData.linkedItemType === 'deal' && (
                      <select
                        value={formData.selectedItemId}
                        onChange={(e) => setFormData({ ...formData, selectedItemId: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      >
                        <option value="">Select a deal...</option>
                        {deals.map(deal => (
                          <option key={deal.id} value={deal.id}>
                            {deal.title} - Rs {deal.price}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Action URL (Optional) */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">External Action URL (Optional)</label>
                    <input
                      type="text"
                      value={formData.actionUrl}
                      onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                      placeholder="https://example.com/action"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                  <motion.button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </motion.button>
                  {selectedNotification ? (
                    <motion.button
                      onClick={handleUpdateNotification}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30"
                    >
                      <Save className="w-5 h-5" />
                      Update Notification
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        onClick={() => handleCreateNotification(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30"
                      >
                        <Save className="w-5 h-5" />
                        Create
                      </motion.button>
                      <motion.button
                        onClick={() => handleCreateNotification(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/30"
                      >
                        <Send className="w-5 h-5" />
                        Broadcast to All
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewDetailsNotification && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewDetailsNotification(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-xl text-gray-900">Notification Details</h3>
                    <motion.button
                      onClick={() => setViewDetailsNotification(null)}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br ${getTypeBgColor(viewDetailsNotification.type)}`}>
                    {getTypeIcon(viewDetailsNotification.type)}
                    <span className="font-bold text-gray-700 uppercase text-sm">{viewDetailsNotification.type}</span>
                  </div>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                  {viewDetailsNotification.imageUrl && (
                    <div className="w-full h-48 rounded-xl overflow-hidden mb-4 shadow-md">
                      <img src={viewDetailsNotification.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">Title</label>
                    <p className="font-bold text-gray-900 text-lg">{viewDetailsNotification.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">Message</label>
                    <p className="text-gray-700">{viewDetailsNotification.message}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">Timestamp</label>
                    <p className="text-gray-700">{new Date(viewDetailsNotification.timestamp).toLocaleString()}</p>
                  </div>
                  {viewDetailsNotification.actionUrl && (
                    <div>
                      <label className="block text-sm font-bold text-gray-500 mb-1">Action URL</label>
                      <a href={viewDetailsNotification.actionUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline break-all">
                        {viewDetailsNotification.actionUrl}
                      </a>
                    </div>
                  )}
                  {viewDetailsNotification.productId && (
                     <div>
                       <label className="block text-sm font-bold text-gray-500 mb-1">Linked Product</label>
                       <p className="text-gray-700 font-medium flex items-center gap-2">
                         <Package className="w-4 h-4 text-orange-500" /> 
                         {products.find(p => p.id === viewDetailsNotification.productId)?.name || viewDetailsNotification.productId}
                       </p>
                     </div>
                  )}
                  {viewDetailsNotification.dealId && (
                     <div>
                       <label className="block text-sm font-bold text-gray-500 mb-1">Linked Deal</label>
                       <p className="text-gray-700 font-medium flex items-center gap-2">
                         <Tag className="w-4 h-4 text-orange-500" /> 
                         {deals.find(d => d.id === viewDetailsNotification.dealId)?.title || viewDetailsNotification.dealId}
                       </p>
                     </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">Status</label>
                    <div className="flex items-center gap-2">
                      {viewDetailsNotification.isNew && (
                        <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-lg">Unread</span>
                      )}
                      {viewDetailsNotification.isRead && (
                        <span className="px-3 py-1 bg-green-100 text-green-600 text-sm font-bold rounded-lg">Read</span>
                      )}
                      {viewDetailsNotification.isBroadcast && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-600 text-sm font-bold rounded-lg">Broadcast</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">Target</label>
                    <p className="text-gray-700">
                      {viewDetailsNotification.targetUserId === 'all' ? 'All Users' : `User ID: ${viewDetailsNotification.targetUserId}`}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
        </>
      )}

      {activeTab === 'automations' && (
        <NotificationAutomationAdmin />
      )}

      {activeTab === 'campaigns' && (
        <NotificationCampaignsAdmin />
      )}

      {activeTab === 'templates' && (
        <NotificationTemplatesAdmin />
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-bold text-gray-600">{title}</span>
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-black text-gray-900">{value}</p>
  </div>
);
