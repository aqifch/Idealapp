import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  Plus, 
  Edit2, 
  Trash, 
  X, 
  Save, 
  Calendar,
  Send,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../config/supabase';
import { NotificationCampaign } from '../../utils/notificationAutomation';

interface CampaignsSectionProps {
  products?: any[];
  deals?: any[];
  users?: any[];
  onRefresh: () => void;
}

export const CampaignsSection: React.FC<CampaignsSectionProps> = ({ onRefresh }) => {
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<NotificationCampaign | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'promo' as NotificationCampaign['type'],
    schedule_type: 'immediate' as 'immediate' | 'scheduled',
    scheduled_at: '',
    notification_data: {
      title: '',
      message: '',
      image_url: '',
      action_url: '',
    },
    target_audience: 'all' as 'all' | 'segment' | 'specific',
    status: 'draft' as NotificationCampaign['status'],
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Suppress RLS errors if table exists but access denied
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          console.warn('⚠️ RLS policy blocking access to campaigns');
          setCampaigns([]);
          return;
        }
        throw error;
      }

      setCampaigns(data || []);
    } catch (error: any) {
      // Only log critical errors
      if (error.code !== 'PGRST116') {
        console.error('Error loading campaigns:', error);
        toast.error('Failed to load campaigns');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.notification_data.title || !formData.notification_data.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const campaignData: any = {
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        notification_data: formData.notification_data,
        schedule_type: formData.schedule_type,
        scheduled_at: formData.schedule_type === 'scheduled' && formData.scheduled_at 
          ? formData.scheduled_at 
          : null,
        status: formData.schedule_type === 'immediate' ? 'active' : 'draft',
        target_audience: formData.target_audience,
        audience_segment: {},
        recurrence_pattern: {},
        sent_count: 0,
      };

      const { error } = await supabase
        .from('notification_campaigns')
        .insert(campaignData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Campaign created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadCampaigns();
      onRefresh();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleUpdate = async () => {
    if (!selectedCampaign) return;

    if (!formData.name || !formData.notification_data.title || !formData.notification_data.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updateData: any = {
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        notification_data: formData.notification_data,
        schedule_type: formData.schedule_type,
        scheduled_at: formData.schedule_type === 'scheduled' && formData.scheduled_at 
          ? formData.scheduled_at 
          : null,
        target_audience: formData.target_audience,
      };

      const { error } = await supabase
        .from('notification_campaigns')
        .update(updateData)
        .eq('id', selectedCampaign.id);

      if (error) throw error;

      toast.success('Campaign updated successfully!');
      setSelectedCampaign(null);
      resetForm();
      loadCampaigns();
      onRefresh();
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const { error } = await supabase
        .from('notification_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Campaign deleted');
      loadCampaigns();
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'promo',
      schedule_type: 'immediate',
      scheduled_at: '',
      notification_data: {
        title: '',
        message: '',
        image_url: '',
        action_url: '',
      },
      target_audience: 'all',
      status: 'draft',
    });
  };

  const openEditModal = (campaign: NotificationCampaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      type: campaign.type,
      schedule_type: campaign.schedule_type as 'immediate' | 'scheduled',
      scheduled_at: campaign.scheduled_at ? new Date(campaign.scheduled_at).toISOString().slice(0, 16) : '',
      notification_data: campaign.notification_data || {
        title: '',
        message: '',
        image_url: '',
        action_url: '',
      },
      target_audience: campaign.target_audience,
      status: campaign.status,
    });
    setShowCreateModal(true);
  };

  const getStatusColor = (status: NotificationCampaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-purple-100 text-purple-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: NotificationCampaign['type']) => {
    const labels: Record<string, string> = {
      promo: 'Promo',
      announcement: 'Announcement',
      seasonal: 'Seasonal',
      product_launch: 'Product Launch',
      deal_alert: 'Deal Alert',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Notification Campaigns</h2>
          <p className="text-gray-600 mt-1">Create and manage marketing campaigns</p>
        </div>
        <motion.button
          onClick={() => {
            resetForm();
            setSelectedCampaign(null);
            setShowCreateModal(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/30"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </motion.button>
      </div>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((campaign) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{campaign.name}</h3>
                  <p className="text-xs text-gray-500">{getTypeLabel(campaign.type)}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>

            {campaign.description && (
              <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>
            )}

            {campaign.notification_data && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-bold text-gray-900 mb-1">
                  {campaign.notification_data.title}
                </p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {campaign.notification_data.message}
                </p>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Schedule:</span>
                <span className="font-bold text-gray-700 capitalize flex items-center gap-1">
                  {campaign.schedule_type === 'scheduled' && campaign.scheduled_at ? (
                    <>
                      <Clock className="w-3 h-3" />
                      {new Date(campaign.scheduled_at).toLocaleString()}
                    </>
                  ) : (
                    'Immediate'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Target:</span>
                <span className="font-bold text-gray-700 capitalize">{campaign.target_audience}</span>
              </div>
              {campaign.sent_count !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Sent:</span>
                  <span className="font-bold text-gray-700">{campaign.sent_count}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => openEditModal(campaign)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-bold text-sm hover:bg-orange-100 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button
                onClick={() => handleDelete(campaign.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100"
              >
                <Trash className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">No campaigns yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first campaign to get started</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || selectedCampaign) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreateModal(false);
                setSelectedCampaign(null);
                resetForm();
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        <Megaphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-gray-900">
                          {selectedCampaign ? 'Edit Campaign' : 'Create Campaign'}
                        </h3>
                        <p className="text-sm text-gray-600">Create and schedule notification campaigns</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => {
                        setShowCreateModal(false);
                        setSelectedCampaign(null);
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

                <div className="p-6 overflow-y-auto flex-1">
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Campaign Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Summer Sale 2024"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe this campaign..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Campaign Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 transition-colors"
                      >
                        <option value="promo">Promo</option>
                        <option value="announcement">Announcement</option>
                        <option value="seasonal">Seasonal</option>
                        <option value="product_launch">Product Launch</option>
                        <option value="deal_alert">Deal Alert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Schedule Type *</label>
                      <select
                        value={formData.schedule_type}
                        onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 transition-colors"
                      >
                        <option value="immediate">Send Immediately</option>
                        <option value="scheduled">Schedule for Later</option>
                      </select>
                    </div>

                    {formData.schedule_type === 'scheduled' && (
                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Scheduled Date & Time *</label>
                        <input
                          type="datetime-local"
                          value={formData.scheduled_at}
                          onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 transition-colors"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Target Audience *</label>
                      <select
                        value={formData.target_audience}
                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 transition-colors"
                      >
                        <option value="all">All Users</option>
                        <option value="segment">Segment</option>
                        <option value="specific">Specific Users</option>
                      </select>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                      <p className="text-sm font-bold text-gray-700">Notification Content *</p>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Title *</label>
                        <input
                          type="text"
                          value={formData.notification_data.title}
                          onChange={(e) => setFormData({
                            ...formData,
                            notification_data: { ...formData.notification_data, title: e.target.value }
                          })}
                          placeholder="Campaign notification title"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-green-400 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Message *</label>
                        <textarea
                          value={formData.notification_data.message}
                          onChange={(e) => setFormData({
                            ...formData,
                            notification_data: { ...formData.notification_data, message: e.target.value }
                          })}
                          placeholder="Campaign notification message"
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-green-400 transition-colors resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Image URL (Optional)</label>
                        <input
                          type="text"
                          value={formData.notification_data.image_url || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            notification_data: { ...formData.notification_data, image_url: e.target.value }
                          })}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-green-400 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Action URL (Optional)</label>
                        <input
                          type="text"
                          value={formData.notification_data.action_url || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            notification_data: { ...formData.notification_data, action_url: e.target.value }
                          })}
                          placeholder="https://example.com/action"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-green-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                  <motion.button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedCampaign(null);
                      resetForm();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={selectedCampaign ? handleUpdate : handleCreate}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/30"
                  >
                    <Save className="w-5 h-5" />
                    {selectedCampaign ? 'Update' : 'Create'}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};




