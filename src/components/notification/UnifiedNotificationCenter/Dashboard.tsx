import React from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  Send, 
  Eye, 
  MousePointerClick, 
  TrendingUp, 
  TrendingDown,
  Package,
  Gift,
  Star,
  ShoppingCart,
  Settings,
  Plus,
  Zap,
  Megaphone,
  FileText,
  BarChart3
} from 'lucide-react';
import { NotificationStats, AnalyticsData } from './types';
import { toast } from 'sonner';

interface DashboardProps {
  stats: NotificationStats | null;
  analytics: AnalyticsData | null;
  loading: boolean;
  products?: any[];
  deals?: any[];
  users?: any[];
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  analytics, 
  loading,
  onRefresh 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { 
      label: 'Compose Notification', 
      icon: Send, 
      color: 'orange',
      action: () => toast.info('Navigate to Compose section')
    },
    { 
      label: 'Create Campaign', 
      icon: Megaphone, 
      color: 'green',
      action: () => toast.info('Navigate to Campaigns section')
    },
    { 
      label: 'New Automation', 
      icon: Zap, 
      color: 'purple',
      action: () => toast.info('Navigate to Automations section')
    },
    { 
      label: 'View Analytics', 
      icon: BarChart3, 
      color: 'blue',
      action: () => toast.info('Open Analytics panel')
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-5 h-5" />;
      case 'promo': return <Gift className="w-5 h-5" />;
      case 'reward': return <Star className="w-5 h-5" />;
      case 'delivery': return <ShoppingCart className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-600 mb-1">Total Sent</h3>
          <p className="text-3xl font-black text-gray-900">
            {analytics?.totalSent.toLocaleString() || stats?.sent || 0}
          </p>
          {analytics?.trends && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              {getTrendIcon(analytics.trends.engagementTrend)}
              <span className={`font-semibold ${
                analytics.trends.engagementTrend > 0 ? 'text-green-600' : 
                analytics.trends.engagementTrend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {analytics.trends.engagementTrend > 0 ? '+' : ''}
                {analytics.trends.engagementTrend.toFixed(1)}%
              </span>
              <span className="text-gray-500">vs last period</span>
            </div>
          )}
        </motion.div>

        {/* Open Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-600 mb-1">Open Rate</h3>
          <p className="text-3xl font-black text-gray-900">
            {analytics?.openRate.toFixed(1) || stats?.openRate?.toFixed(1) || '0.0'}%
          </p>
          {analytics?.trends && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              {getTrendIcon(analytics.trends.openRateTrend)}
              <span className={`font-semibold ${
                analytics.trends.openRateTrend > 0 ? 'text-green-600' : 
                analytics.trends.openRateTrend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {analytics.trends.openRateTrend > 0 ? '+' : ''}
                {analytics.trends.openRateTrend.toFixed(1)}%
              </span>
            </div>
          )}
        </motion.div>

        {/* Click Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <MousePointerClick className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-600 mb-1">Click Rate</h3>
          <p className="text-3xl font-black text-gray-900">
            {analytics?.clickRate.toFixed(1) || stats?.clickRate?.toFixed(1) || '0.0'}%
          </p>
          {analytics?.trends && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              {getTrendIcon(analytics.trends.clickRateTrend)}
              <span className={`font-semibold ${
                analytics.trends.clickRateTrend > 0 ? 'text-green-600' : 
                analytics.trends.clickRateTrend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {analytics.trends.clickRateTrend > 0 ? '+' : ''}
                {analytics.trends.clickRateTrend.toFixed(1)}%
              </span>
            </div>
          )}
        </motion.div>

        {/* Engagement Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-600 mb-1">Engagement</h3>
          <p className="text-3xl font-black text-gray-900">
            {analytics?.engagementRate.toFixed(1) || stats?.engagementRate?.toFixed(1) || '0.0'}%
          </p>
          {analytics?.trends && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              {getTrendIcon(analytics.trends.engagementTrend)}
              <span className={`font-semibold ${
                analytics.trends.engagementTrend > 0 ? 'text-green-600' : 
                analytics.trends.engagementTrend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {analytics.trends.engagementTrend > 0 ? '+' : ''}
                {analytics.trends.engagementTrend.toFixed(1)}%
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-black text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                onClick={action.action}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-xl border hover:shadow-md transition-all ${
                  action.color === 'orange' ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200' :
                  action.color === 'green' ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' :
                  action.color === 'purple' ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200' :
                  'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${
                  action.color === 'orange' ? 'text-orange-600' :
                  action.color === 'green' ? 'text-green-600' :
                  action.color === 'purple' ? 'text-purple-600' :
                  'text-blue-600'
                }`} />
                <p className="text-sm font-bold text-gray-900">{action.label}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Stats by Type */}
      {stats && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-4">Notifications by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="text-center p-4 rounded-xl bg-gray-50">
                <div className="flex justify-center mb-2 text-gray-600">
                  {getTypeIcon(type)}
                </div>
                <p className="text-2xl font-black text-gray-900">{count}</p>
                <p className="text-xs font-bold text-gray-500 uppercase mt-1">{type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-black text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Activity feed will appear here</p>
        </div>
      </div>
    </div>
  );
};

