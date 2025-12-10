import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Plus, Edit2, Trash, X, Save, Calendar, Users, Send, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchCampaigns,
  createCampaign,
  NotificationCampaign,
} from '../utils/notificationAutomation';
import { supabase } from '../config/supabase';

export const NotificationCampaignsAdmin = () => {
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampation] = useState<NotificationCampaign | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'promo' as NotificationCampaign['type'],
    target_audience: 'all' as 'all' | 'segment' | 'specific',
    audience_segment: {} as Record<string, any>,
    schedule_type: 'immediate' as 'immediate' | 'scheduled' | 'recurring',
    scheduled_at: '',
    recurrence_pattern: {} as Record<string, any>,
    notification_data: {
      title: '',
      message: '',
      image_url: '',
      action_url: '',
      product_id: '',
      deal_id: '',
    },
    status: 'draft' as NotificationCampaign['status'],
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Process scheduled campaigns automatically
  useEffect(() => {
    // Process scheduled campaigns every minute
    const interval = setInterval(async () => {
      try {
        const { processScheduledCampaigns } = await import('../utils/notificationAutomation');
        await processScheduledCampaigns();
        // Refresh campaigns list if any were processed
        loadCampaigns();
      } catch (error) {
        console.error('Error processing scheduled campaigns:', error);
      }
    }, 60000); // Every 60 seconds

    // Process immediately on mount
    const processNow = async () => {
      try {
        const { processScheduledCampaigns } = await import('../utils/notificationAutomation');
        await processScheduledCampaigns();
        loadCampaigns();
      } catch (error) {
        console.error('Error processing scheduled campaigns:', error);
      }
    };
    processNow();

    return () => clearInterval(interval);
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    const data = await fetchCampaigns();
    setCampaigns(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.notification_data.title || !formData.notification_data.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const campaignData: any = {
      ...formData,
      scheduled_at: formData.schedule_type === 'scheduled' ? formData.scheduled_at : null,
      notification_data: {
        ...formData.notification_data,
        product_id: formData.notification_data.product_id || null,
        deal_id: formData.notification_data.deal_id || null,
      },
      // Set status based on schedule_type
      status: formData.schedule_type === 'immediate' ? 'active' : 'draft',
    };

    const newCampaign = await createCampaign(campaignData);

    if (newCampaign) {
      // If immediate, send notifications right away
      if (newCampaign.schedule_type === 'immediate') {
        try {
          const { sendCampaignNotifications } = await import('../utils/notificationAutomation');
          await sendCampaignNotifications(newCampaign);
          
          // Update status to completed
          await supabase
            .from('notification_campaigns')
            .update({ status: 'completed', sent_count: 1 })
            .eq('id', newCampaign.id);
          
          toast.success('Campaign sent successfully!');
        } catch (error) {
          console.error('Error sending immediate campaign:', error);
          toast.error('Campaign created but failed to send');
        }
      }
      
      setShowCreateModal(false);
      resetForm();
      loadCampaigns();
    }
  };

  const handleUpdateStatus = async (id: string, status: NotificationCampaign['status']) => {
    try {
      const campaign = campaigns.find(c => c.id === id);
      if (!campaign) return;

      // If changing to 'scheduled' and schedule_type is 'immediate', send immediately
      if (status === 'scheduled' && campaign.schedule_type === 'immediate') {
        try {
          const { sendCampaignNotifications } = await import('../utils/notificationAutomation');
          await sendCampaignNotifications(campaign);
          
          // Update to completed
          const { error } = await supabase
            .from('notification_campaigns')
            .update({ status: 'completed', sent_count: campaign.sent_count + 1 })
            .eq('id', id);

          if (error) throw error;
          toast.success('Campaign sent successfully!');
          loadCampaigns();
          return;
        } catch (error) {
          console.error('Error sending campaign:', error);
          toast.error('Failed to send campaign');
          return;
        }
      }

      const { error } = await supabase
        .from('notification_campaigns')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Campaign ${status}`);
      loadCampaigns();
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
      target_audience: 'all',
      audience_segment: {},
      schedule_type: 'immediate',
      scheduled_at: '',
      recurrence_pattern: {},
      notification_data: {
        title: '',
        message: '',
        image_url: '',
        action_url: '',
        product_id: '',
        deal_id: '',
      },
      status: 'draft',
    });
  };

  const getStatusColor = (status: NotificationCampaign['status']) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      completed: 'bg-purple-100 text-purple-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
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
          <h2 className="text-3xl font-black text-gray-900">Marketing Campaigns</h2>
          <p className="text-gray-600 mt-1">Create and manage marketing notification campaigns</p>
        </div>
        <motion.button
          onClick={() => {
            resetForm();
            setSelectedCampation(null);
            setShowCreateModal(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </motion.button>
      </div>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{campaign.name}</h3>
                  <span className="text-xs text-gray-500 uppercase">{campaign.type}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>

            {campaign.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Target:
                </span>
                <span className="font-bold text-gray-700 capitalize">{campaign.target_audience}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Schedule:
                </span>
                <span className="font-bold text-gray-700 capitalize">{campaign.schedule_type}</span>
              </div>
              {campaign.scheduled_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Scheduled:</span>
                  <span className="font-bold text-gray-700">
                    {new Date(campaign.scheduled_at).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Send className="w-4 h-4" />
                  Sent:
                </span>
                <span className="font-bold text-gray-700">{campaign.sent_count}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {campaign.status === 'draft' && (
                <motion.button
                  onClick={() => handleUpdateStatus(campaign.id, 'scheduled')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg font-bold text-sm hover:bg-green-100 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Schedule
                </motion.button>
              )}
              {campaign.status === 'scheduled' && (
                <motion.button
                  onClick={() => handleUpdateStatus(campaign.id, 'draft')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-100 flex items-center justify-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </motion.button>
              )}
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
          <p className="text-gray-400 text-sm mt-1">Create your first marketing campaign</p>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreateModal(false);
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
                className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                        <Megaphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-gray-900">Create Campaign</h3>
                        <p className="text-sm text-gray-600">Set up a marketing notification campaign</p>
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

                {/* Form Content */}
                <div className="p-6 overflow-y-auto flex-1">
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Campaign Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Summer Sale 2024"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe this campaign..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors resize-none"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Campaign Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      >
                        <option value="promo">Promotion</option>
                        <option value="announcement">Announcement</option>
                        <option value="seasonal">Seasonal</option>
                        <option value="product_launch">Product Launch</option>
                        <option value="deal_alert">Deal Alert</option>
                      </select>
                    </div>

                    {/* Schedule Type */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Schedule Type *</label>
                      <select
                        value={formData.schedule_type}
                        onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      >
                        <option value="immediate">Send Immediately</option>
                        <option value="scheduled">Schedule for Later</option>
                        <option value="recurring">Recurring</option>
                      </select>
                    </div>

                    {/* Scheduled At */}
                    {formData.schedule_type === 'scheduled' && (
                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Scheduled Date & Time *</label>
                        <input
                          type="datetime-local"
                          value={formData.scheduled_at}
                          onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                        />
                      </div>
                    )}

                    {/* Target Audience */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Target Audience</label>
                      <select
                        value={formData.target_audience}
                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      >
                        <option value="all">All Users</option>
                        <option value="segment">User Segment</option>
                        <option value="specific">Specific Users</option>
                      </select>
                    </div>

                    {/* Notification Data */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                      <p className="font-bold text-gray-700">Notification Content *</p>
                      
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
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-orange-400 transition-colors"
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
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-orange-400 transition-colors resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                        <input
                          type="text"
                          value={formData.notification_data.image_url}
                          onChange={(e) => setFormData({
                            ...formData,
                            notification_data: { ...formData.notification_data, image_url: e.target.value }
                          })}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Action URL</label>
                        <input
                          type="text"
                          value={formData.notification_data.action_url}
                          onChange={(e) => setFormData({
                            ...formData,
                            notification_data: { ...formData.notification_data, action_url: e.target.value }
                          })}
                          placeholder="https://example.com/action"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
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
                  <motion.button
                    onClick={handleCreate}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/30"
                  >
                    <Save className="w-5 h-5" />
                    Create Campaign
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

