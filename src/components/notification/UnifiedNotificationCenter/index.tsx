import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  LayoutDashboard, 
  Send, 
  Zap, 
  Megaphone, 
  FileText,
  BarChart3,
  Users,
  Calendar,
  TestTube,
  Eye,
  History,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { UnifiedNotificationCenterProps, WorkflowSection, NotificationStats, AnalyticsData } from './types';
import { Dashboard } from './Dashboard';
import { ComposeSection } from './ComposeSection';
import { AutomationsSection } from './AutomationsSection';
import { CampaignsSection } from './CampaignsSection';
import { TemplatesSection } from './TemplatesSection';
import { AnalyticsPanel } from './AnalyticsPanel';
import { BulkOperations } from './BulkOperations';
import { AdvancedScheduler } from './AdvancedScheduler';
import { UserSegmentation } from './UserSegmentation';
import { ABTesting } from './ABTesting';
import { LivePreview } from './LivePreview';
import { ActivityHistory } from './ActivityHistory';
import { unifiedNotificationService } from '../../utils/unifiedNotificationService';

export const UnifiedNotificationCenter: React.FC<UnifiedNotificationCenterProps> = ({ 
  products = [], 
  deals = [],
  users = []
}) => {
  const [activeSection, setActiveSection] = useState<WorkflowSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
  // Enterprise feature panels
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBulkOps, setShowBulkOps] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showSegmentation, setShowSegmentation] = useState(false);
  const [showABTesting, setShowABTesting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, analyticsData] = await Promise.all([
        unifiedNotificationService.getStats(),
        unifiedNotificationService.getAnalytics()
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const workflowSections = [
    { id: 'dashboard' as WorkflowSection, label: 'Dashboard', icon: LayoutDashboard, color: 'blue' },
    { id: 'compose' as WorkflowSection, label: 'Compose', icon: Send, color: 'orange' },
    { id: 'automations' as WorkflowSection, label: 'Automations', icon: Zap, color: 'purple' },
    { id: 'campaigns' as WorkflowSection, label: 'Campaigns', icon: Megaphone, color: 'green' },
    { id: 'templates' as WorkflowSection, label: 'Templates', icon: FileText, color: 'amber' },
  ];

  const enterpriseFeatures = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, action: () => setShowAnalytics(true) },
    { id: 'bulk', label: 'Bulk Operations', icon: Users, action: () => setShowBulkOps(true) },
    { id: 'schedule', label: 'Scheduler', icon: Calendar, action: () => setShowScheduler(true) },
    { id: 'segments', label: 'Segmentation', icon: Users, action: () => setShowSegmentation(true) },
    { id: 'abtest', label: 'A/B Testing', icon: TestTube, action: () => setShowABTesting(true) },
    { id: 'preview', label: 'Preview', icon: Eye, action: () => setShowPreview(true) },
    { id: 'history', label: 'History', icon: History, action: () => setShowHistory(true) },
  ];

  const renderActiveSection = () => {
    const commonProps = { products, deals, users, onRefresh: loadDashboardData };
    
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard stats={stats} analytics={analytics} loading={loading} {...commonProps} />;
      case 'compose':
        return <ComposeSection {...commonProps} />;
      case 'automations':
        return <AutomationsSection {...commonProps} />;
      case 'campaigns':
        return <CampaignsSection {...commonProps} />;
      case 'templates':
        return <TemplatesSection {...commonProps} />;
      default:
        return <Dashboard stats={stats} analytics={analytics} loading={loading} {...commonProps} />;
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0 }}
        className="bg-white border-r border-gray-200 overflow-hidden flex-shrink-0"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-gray-900">Notification Center</h2>
                  <p className="text-xs text-gray-600">Enterprise</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Workflow Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Workflows</p>
              {workflowSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all ${
                      isActive
                        ? section.color === 'blue' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm' :
                          section.color === 'orange' ? 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 shadow-sm' :
                          section.color === 'purple' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 shadow-sm' :
                          section.color === 'green' ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm' :
                          'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? '' : 'text-gray-400'}`} />
                    <span className="font-semibold text-sm">{section.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Enterprise Features */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Enterprise</p>
              {enterpriseFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.button
                    key={feature.id}
                    onClick={feature.action}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-sm">{feature.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {workflowSections.find(s => s.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {activeSection === 'dashboard' && 'Overview and analytics'}
                {activeSection === 'compose' && 'Create and send notifications'}
                {activeSection === 'automations' && 'Automated notification rules'}
                {activeSection === 'campaigns' && 'Marketing campaigns'}
                {activeSection === 'templates' && 'Notification templates'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section Content */}
        <div className="p-6">
          {renderActiveSection()}
        </div>
      </div>

      {/* Enterprise Feature Panels */}
      <AnimatePresence>
        {showAnalytics && (
          <AnalyticsPanel
            analytics={analytics}
            onClose={() => setShowAnalytics(false)}
            onRefresh={loadDashboardData}
          />
        )}
        {showBulkOps && (
          <BulkOperations
            onClose={() => setShowBulkOps(false)}
            onRefresh={loadDashboardData}
          />
        )}
        {showScheduler && (
          <AdvancedScheduler
            onClose={() => setShowScheduler(false)}
          />
        )}
        {showSegmentation && (
          <UserSegmentation
            users={users}
            onClose={() => setShowSegmentation(false)}
          />
        )}
        {showABTesting && (
          <ABTesting
            onClose={() => setShowABTesting(false)}
            onRefresh={loadDashboardData}
          />
        )}
        {showPreview && (
          <LivePreview
            onClose={() => setShowPreview(false)}
          />
        )}
        {showHistory && (
          <ActivityHistory
            onClose={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

