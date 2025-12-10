import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Plus, Edit2, Trash, X, Save, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchActiveAutomations,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  NotificationAutomation,
  triggerAutomation,
} from '../utils/notificationAutomation';
import { fetchTemplates, NotificationTemplate } from '../utils/notificationTemplates';
import { supabase } from '../config/supabase';

export const NotificationAutomationAdmin = () => {
  const [automations, setAutomations] = useState<NotificationAutomation[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<NotificationAutomation | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'order_placed' as NotificationAutomation['trigger_type'],
    conditions: {} as Record<string, any>,
    template_id: '',
    notification_data: {
      title: '',
      message: '',
      image_url: '',
      action_url: '',
    },
    target_audience: 'all' as 'all' | 'user' | 'admin' | 'segment',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [automationsData, templatesData] = await Promise.all([
      fetchActiveAutomations(),
      fetchTemplates(),
    ]);
    setAutomations(automationsData);
    setTemplates(templatesData);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.trigger_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newAutomation = await createAutomation({
      ...formData,
      template_id: formData.template_id || null,
      conditions: formData.conditions,
      notification_data: formData.notification_data,
    });

    if (newAutomation) {
      setShowCreateModal(false);
      resetForm();
      loadData();
    }
  };

  const handleUpdate = async () => {
    if (!selectedAutomation) return;

    const updated = await updateAutomation(selectedAutomation.id, {
      ...formData,
      template_id: formData.template_id || null,
      conditions: formData.conditions,
      notification_data: formData.notification_data,
    });

    if (updated) {
      setSelectedAutomation(null);
      resetForm();
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;
    
    const success = await deleteAutomation(id);
    if (success) {
      loadData();
    }
  };

  const handleToggleActive = async (automation: NotificationAutomation) => {
    const updated = await updateAutomation(automation.id, {
      is_active: !automation.is_active,
    });
    if (updated) {
      loadData();
    }
  };

  const handleTest = async (automation: NotificationAutomation) => {
    try {
      toast.info('Testing automation...');
      
      // Get current user ID for testing
      const { data: { user } } = await supabase.auth.getUser();
      const testUserId = user?.id || 'all';
      
      console.log('🧪 Testing automation:', automation.name, 'Trigger:', automation.trigger_type, 'User:', testUserId);
      
      await triggerAutomation(automation.trigger_type, {
        orderNumber: 'TEST-123',
        orderId: 'test-order-123',
        status: 'confirmed',
        newStatus: 'confirmed',
        estimatedTime: '30 minutes',
        total: 500,
        customerName: 'Test User',
      }, testUserId);
      
      // Force refresh notifications
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }, 1000);
      
      toast.success('Test notification sent! Check your notifications.');
      console.log('✅ Test notification sent successfully');
    } catch (error: any) {
      console.error('❌ Error testing automation:', error);
      toast.error(`Test failed: ${error.message || 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger_type: 'order_placed',
      conditions: {},
      template_id: '',
      notification_data: {
        title: '',
        message: '',
        image_url: '',
        action_url: '',
      },
      target_audience: 'all',
      is_active: true,
    });
  };

  const openEditModal = (automation: NotificationAutomation) => {
    setSelectedAutomation(automation);
    setFormData({
      name: automation.name,
      description: automation.description || '',
      trigger_type: automation.trigger_type,
      conditions: automation.conditions,
      template_id: automation.template_id || '',
      notification_data: automation.notification_data,
      target_audience: automation.target_audience,
      is_active: automation.is_active,
    });
  };

  const getTriggerLabel = (trigger: NotificationAutomation['trigger_type']) => {
    const labels: Record<string, string> = {
      order_placed: 'Order Placed',
      order_status_changed: 'Order Status Changed',
      order_confirmed: 'Order Confirmed',
      order_preparing: 'Order Preparing',
      order_ready: 'Order Ready',
      order_completed: 'Order Completed',
      order_cancelled: 'Order Cancelled',
      product_added: 'Product Added',
      deal_started: 'Deal Started',
      deal_ended: 'Deal Ended',
      scheduled: 'Scheduled',
      product_low_stock: 'Product Low Stock',
      user_registered: 'User Registered',
    };
    return labels[trigger] || trigger;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading automations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Notification Automations</h2>
          <p className="text-gray-600 mt-1">Set up automated notifications based on triggers</p>
        </div>
        <motion.button
          onClick={() => {
            resetForm();
            setSelectedAutomation(null);
            setShowCreateModal(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30"
        >
          <Plus className="w-5 h-5" />
          New Automation
        </motion.button>
      </div>

      {/* Automations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((automation) => (
          <motion.div
            key={automation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  automation.is_active 
                    ? 'from-green-400 to-emerald-500' 
                    : 'from-gray-400 to-gray-500'
                } flex items-center justify-center`}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{automation.name}</h3>
                  <p className="text-xs text-gray-500">{getTriggerLabel(automation.trigger_type)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => handleToggleActive(automation)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {automation.is_active ? (
                    <ToggleRight className="w-6 h-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </motion.button>
              </div>
            </div>

            {automation.description && (
              <p className="text-sm text-gray-600 mb-4">{automation.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Target:</span>
                <span className="font-bold text-gray-700 capitalize">{automation.target_audience}</span>
              </div>
              {automation.template_id && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Template:</span>
                  <span className="font-bold text-gray-700">
                    {templates.find(t => t.id === automation.template_id)?.name || 'N/A'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => handleTest(automation)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Test
              </motion.button>
              <motion.button
                onClick={() => openEditModal(automation)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-bold text-sm hover:bg-orange-100 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button
                onClick={() => handleDelete(automation.id)}
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

      {automations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">No automations yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first automation to get started</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || selectedAutomation) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreateModal(false);
                setSelectedAutomation(null);
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
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-gray-900">
                          {selectedAutomation ? 'Edit Automation' : 'Create Automation'}
                        </h3>
                        <p className="text-sm text-gray-600">Configure automated notification triggers</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => {
                        setShowCreateModal(false);
                        setSelectedAutomation(null);
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
                      <label className="block font-bold text-gray-700 mb-2">Automation Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Order Confirmation"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe what this automation does..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors resize-none"
                      />
                    </div>

                    {/* Trigger Type */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Trigger Type *</label>
                      <select
                        value={formData.trigger_type}
                        onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      >
                        <optgroup label="Order Events">
                          <option value="order_placed">Order Placed</option>
                          <option value="order_confirmed">Order Confirmed</option>
                          <option value="order_preparing">Order Preparing</option>
                          <option value="order_ready">Order Ready</option>
                          <option value="order_completed">Order Completed</option>
                          <option value="order_cancelled">Order Cancelled</option>
                          <option value="order_status_changed">Order Status Changed</option>
                        </optgroup>
                        <optgroup label="Product & Deals">
                          <option value="product_added">Product Added</option>
                          <option value="deal_started">Deal Started</option>
                          <option value="deal_ended">Deal Ended</option>
                          <option value="product_low_stock">Product Low Stock</option>
                        </optgroup>
                        <optgroup label="User Events">
                          <option value="user_registered">User Registered</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="scheduled">Scheduled</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Template Selection */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Notification Template (Optional)</label>
                      <select
                        value={formData.template_id}
                        onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      >
                        <option value="">No Template (Use Custom Data)</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name} ({template.type})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        If no template selected, use custom notification data below
                      </p>
                    </div>

                    {/* Custom Notification Data (if no template) */}
                    {!formData.template_id && (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm font-bold text-gray-700">Custom Notification Data</p>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={formData.notification_data.title}
                            onChange={(e) => setFormData({
                              ...formData,
                              notification_data: { ...formData.notification_data, title: e.target.value }
                            })}
                            placeholder="Notification title"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                          <textarea
                            value={formData.notification_data.message}
                            onChange={(e) => setFormData({
                              ...formData,
                              notification_data: { ...formData.notification_data, message: e.target.value }
                            })}
                            placeholder="Notification message"
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
                    )}

                    {/* Target Audience */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Target Audience</label>
                      <select
                        value={formData.target_audience}
                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      >
                        <option value="all">All Users (Broadcast)</option>
                        <option value="user">Specific User</option>
                        <option value="admin">Admin Only</option>
                        <option value="segment">User Segment</option>
                      </select>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <label htmlFor="is_active" className="text-sm font-bold text-gray-700">
                        Activate this automation
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                  <motion.button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedAutomation(null);
                      resetForm();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={selectedAutomation ? handleUpdate : handleCreate}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30"
                  >
                    <Save className="w-5 h-5" />
                    {selectedAutomation ? 'Update' : 'Create'}
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

