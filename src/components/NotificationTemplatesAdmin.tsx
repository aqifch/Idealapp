import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, Edit2, Trash, X, Save, Eye, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  NotificationTemplate,
  renderTemplate,
} from '../utils/notificationTemplates';

export const NotificationTemplatesAdmin = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'order' as NotificationTemplate['type'],
    title_template: '',
    message_template: '',
    variables: [] as string[],
    image_url: '',
    action_url: '',
    is_default: false,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTemplates();
      setTemplates(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading templates:', err);
      setError(err?.message || 'Failed to load templates');
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.title_template || !formData.message_template) {
      toast.error('Please fill in all required fields');
      return;
    }

    const variables = extractVariables(formData.title_template + ' ' + formData.message_template);
    
    const newTemplate = await createTemplate({
      ...formData,
      variables,
      image_url: formData.image_url || null,
      action_url: formData.action_url || null,
    });

    if (newTemplate) {
      setShowCreateModal(false);
      resetForm();
      loadTemplates();
    }
  };

  const handleUpdate = async () => {
    if (!selectedTemplate) return;

    const variables = extractVariables(formData.title_template + ' ' + formData.message_template);
    
    const updated = await updateTemplate(selectedTemplate.id, {
      ...formData,
      variables,
      image_url: formData.image_url || null,
      action_url: formData.action_url || null,
    });

    if (updated) {
      setSelectedTemplate(null);
      resetForm();
      loadTemplates();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    const success = await deleteTemplate(id);
    if (success) {
      loadTemplates();
    }
  };

  const extractVariables = (text: string): string[] => {
    if (!text || typeof text !== 'string') return [];
    try {
      const matches = text.match(/\{\{(\w+)\}\}/g);
      if (!matches) return [];
      const extracted = matches.map(m => {
        const cleaned = m.replace(/[{}]/g, '');
        return cleaned && typeof cleaned === 'string' ? cleaned : null;
      }).filter((v): v is string => v !== null && v !== undefined);
      return [...new Set(extracted)];
    } catch (err) {
      console.error('Error extracting variables:', err);
      return [];
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'order',
      title_template: '',
      message_template: '',
      variables: [],
      image_url: '',
      action_url: '',
      is_default: false,
    });
    setPreviewVariables({});
  };

  const openEditModal = (template: NotificationTemplate) => {
    try {
      if (!template) {
        toast.error('Invalid template data');
        return;
      }

      // Initialize preview variables first
      const vars: Record<string, string> = {};
      
      // Extract variables from templates and initialize preview values
      const titleTemplate = template.title_template || '';
      const messageTemplate = template.message_template || '';
      const allVariables = extractVariables(titleTemplate + ' ' + messageTemplate);
      
      // Use variables from template if available, otherwise use extracted ones
      let variablesToUse: string[] = [];
      if (Array.isArray(template.variables) && template.variables.length > 0) {
        variablesToUse = template.variables.filter(v => v && typeof v === 'string');
      } else {
        variablesToUse = allVariables;
      }
      
      // If still no variables, try extracting again
      if (variablesToUse.length === 0 && allVariables.length > 0) {
        variablesToUse = allVariables;
      }
      
      variablesToUse.forEach(v => {
        if (v && typeof v === 'string' && v.trim() !== '') {
          vars[v] = `Sample ${v}`;
        }
      });
      
      setSelectedTemplate(template);
      setPreviewVariables(vars);
      
      setFormData({
        name: template.name || '',
        type: template.type || 'order',
        title_template: titleTemplate,
        message_template: messageTemplate,
        variables: variablesToUse,
        image_url: template.image_url || '',
        action_url: template.action_url || '',
        is_default: template.is_default || false,
      });
    } catch (err: any) {
      console.error('Error opening edit modal:', err);
      toast.error('Failed to open edit modal');
    }
  };

  const getPreview = () => {
    try {
      if (!formData.title_template || !formData.message_template) return null;
      
      // Ensure all variables in templates have preview values
      const safePreviewVariables = { ...previewVariables };
      if (Array.isArray(formData.variables)) {
        formData.variables.forEach(v => {
          if (v && typeof v === 'string' && !safePreviewVariables[v]) {
            safePreviewVariables[v] = `Sample ${v}`;
          }
        });
      }
      
      const title = renderTemplate(formData.title_template, safePreviewVariables);
      const message = renderTemplate(formData.message_template, safePreviewVariables);
      
      return {
        title,
        message,
      };
    } catch (err: any) {
      console.error('Error in getPreview:', err);
      return null;
    }
  };

  // Error boundary
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-red-50 p-6 rounded-xl border border-red-200 max-w-md">
          <p className="text-red-600 font-bold mb-2">Error loading templates</p>
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadTemplates();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Notification Templates</h2>
          <p className="text-gray-600 mt-1">Create reusable notification templates with variables</p>
        </div>
        <motion.button
          onClick={() => {
            resetForm();
            setSelectedTemplate(null);
            setShowCreateModal(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30"
        >
          <Plus className="w-5 h-5" />
          New Template
        </motion.button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="font-bold text-gray-900">{template.name}</h3>
                  <span className="text-xs text-gray-500 uppercase">{template.type}</span>
                </div>
              </div>
              {template.is_default && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs font-bold text-gray-500">Title Template</p>
                <p className="text-sm text-gray-700 line-clamp-1">{template.title_template}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500">Message Template</p>
                <p className="text-sm text-gray-700 line-clamp-2">{template.message_template}</p>
              </div>
              {Array.isArray(template.variables) && template.variables.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500">Variables</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.variables.filter(v => v && typeof v === 'string').map((v) => (
                      <span key={v} className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => openEditModal(template)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-bold text-sm hover:bg-orange-100 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button
                onClick={() => handleDelete(template.id)}
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

      {templates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">No templates yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first template to get started</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || selectedTemplate) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreateModal(false);
                setSelectedTemplate(null);
                resetForm();
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col pointer-events-auto"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-gray-900">
                          {selectedTemplate ? 'Edit Template' : 'Create Template'}
                        </h3>
                        <p className="text-sm text-gray-600">Use {'{{variable}}'} syntax for dynamic content</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => {
                        setShowCreateModal(false);
                        setSelectedTemplate(null);
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
                      <label className="block font-bold text-gray-700 mb-2">Template Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Order Confirmation"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      >
                        <option value="order">Order</option>
                        <option value="promo">Promo</option>
                        <option value="reward">Reward</option>
                        <option value="delivery">Delivery</option>
                        <option value="system">System</option>
                        <option value="marketing">Marketing</option>
                      </select>
                    </div>

                    {/* Title Template */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Title Template *</label>
                      <input
                        type="text"
                        value={formData.title_template}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          const vars = extractVariables(newTitle + ' ' + formData.message_template);
                          setFormData(prev => ({ 
                            ...prev, 
                            title_template: newTitle,
                            variables: vars
                          }));
                          // Update preview variables for new variables
                          setPreviewVariables(prev => {
                            const updated = { ...prev };
                            if (Array.isArray(vars)) {
                              vars.forEach(v => {
                                if (v && typeof v === 'string' && v.trim() !== '' && !updated[v]) {
                                  updated[v] = `Sample ${v}`;
                                }
                              });
                            }
                            return updated;
                          });
                        }}
                        placeholder="e.g., Order #{{orderNumber}} Confirmed!"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use {'{{variableName}}'} for dynamic values</p>
                    </div>

                    {/* Message Template */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Message Template *</label>
                      <textarea
                        value={formData.message_template}
                        onChange={(e) => {
                          const newMessage = e.target.value;
                          const vars = extractVariables(formData.title_template + ' ' + newMessage);
                          setFormData(prev => ({ 
                            ...prev, 
                            message_template: newMessage,
                            variables: vars
                          }));
                          // Update preview variables for new variables
                          setPreviewVariables(prev => {
                            const updated = { ...prev };
                            if (Array.isArray(vars)) {
                              vars.forEach(v => {
                                if (v && typeof v === 'string' && v.trim() !== '' && !updated[v]) {
                                  updated[v] = `Sample ${v}`;
                                }
                              });
                            }
                            return updated;
                          });
                        }}
                        placeholder="e.g., Your order has been confirmed and will be ready in {{estimatedTime}}"
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors resize-none"
                      />
                    </div>

                    {/* Variables Preview */}
                    {Array.isArray(formData.variables) && formData.variables.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm font-bold text-gray-700 mb-2">Detected Variables:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.variables.map((v) => {
                            if (!v || typeof v !== 'string') return null;
                            return (
                              <div key={v} className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded font-medium">
                                  {`{{${v}}}`}
                                </span>
                                <input
                                  type="text"
                                  value={previewVariables[v] || ''}
                                  onChange={(e) => setPreviewVariables({ ...previewVariables, [v]: e.target.value })}
                                  placeholder={`Sample ${v}`}
                                  className="px-2 py-1 text-sm border border-gray-200 rounded focus:border-orange-400 outline-none"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Preview */}
                    {(() => {
                      const preview = getPreview();
                      if (!preview) return null;
                      return (
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                          <p className="text-sm font-bold text-gray-700 mb-2">Preview:</p>
                          <div className="space-y-2">
                            <p className="font-bold text-gray-900">{preview.title}</p>
                            <p className="text-sm text-gray-700">{preview.message}</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Image URL */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Image URL (Optional)</label>
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      />
                    </div>

                    {/* Action URL */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">Action URL (Optional)</label>
                      <input
                        type="text"
                        value={formData.action_url}
                        onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                        placeholder="https://example.com/action"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-400 transition-colors"
                      />
                    </div>

                    {/* Default Template */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_default"
                        checked={formData.is_default}
                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <label htmlFor="is_default" className="text-sm font-bold text-gray-700">
                        Set as default template for this type
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
                  <motion.button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedTemplate(null);
                      resetForm();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={selectedTemplate ? handleUpdate : handleCreate}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30"
                  >
                    <Save className="w-5 h-5" />
                    {selectedTemplate ? 'Update' : 'Create'}
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
