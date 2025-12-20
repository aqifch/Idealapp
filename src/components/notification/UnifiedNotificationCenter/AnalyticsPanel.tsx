import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BarChart3, Download, Calendar, Filter } from 'lucide-react';
import { AnalyticsData } from './types';
import { getAnalytics, exportAnalyticsToCSV, exportAnalyticsToJSON, AnalyticsFilters } from '../../utils/notificationAnalytics';
import { toast } from 'sonner';

interface AnalyticsPanelProps {
  analytics: AnalyticsData | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ analytics: initialAnalytics, onClose, onRefresh }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(initialAnalytics);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    if (!analytics) {
      loadAnalytics();
    }
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getAnalytics({
        ...filters,
        dateFrom: dateRange.from || undefined,
        dateTo: dateRange.to || undefined,
      });
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!analytics) return;
    const csv = exportAnalyticsToCSV(analytics);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics exported to CSV');
  };

  const handleExportJSON = () => {
    if (!analytics) return;
    const json = exportAnalyticsToJSON(analytics);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics exported to JSON');
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
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-black text-gray-900">Analytics & Reporting</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, from: e.target.value }));
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, to: e.target.value }));
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </div>
              <button
                onClick={loadAnalytics}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Apply
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  JSON
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading analytics...</p>
                </div>
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                    <p className="text-sm font-bold text-gray-600 mb-1">Total Sent</p>
                    <p className="text-3xl font-black text-gray-900">{analytics.totalSent.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                    <p className="text-sm font-bold text-gray-600 mb-1">Open Rate</p>
                    <p className="text-3xl font-black text-gray-900">{analytics.openRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                    <p className="text-sm font-bold text-gray-600 mb-1">Click Rate</p>
                    <p className="text-3xl font-black text-gray-900">{analytics.clickRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                    <p className="text-sm font-bold text-gray-600 mb-1">Engagement</p>
                    <p className="text-3xl font-black text-gray-900">{analytics.engagementRate.toFixed(1)}%</p>
                  </div>
                </div>

                {/* By Type */}
                {Object.keys(analytics.byType).length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-4">Performance by Type</h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.byType).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-bold text-gray-900 capitalize">{type}</p>
                            <p className="text-sm text-gray-500">
                              {data.sent} sent • {data.opened} opened • {data.clicked} clicked
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-600">{data.openRate.toFixed(1)}% open</p>
                            <p className="text-sm font-bold text-gray-600">{data.clickRate.toFixed(1)}% click</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Trends */}
                {analytics.byDate.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-4">Daily Trends</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {analytics.byDate.slice(-30).map((item) => (
                        <div key={item.date} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-bold text-gray-700">{item.date}</span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">{item.sent} sent</span>
                            <span className="text-green-600">{item.opened} opened</span>
                            <span className="text-blue-600">{item.clicked} clicked</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No analytics data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
