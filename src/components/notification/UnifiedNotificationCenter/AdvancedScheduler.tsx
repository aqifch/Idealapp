import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Globe, Repeat } from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedSchedulerProps {
  onClose: () => void;
}

export const AdvancedScheduler: React.FC<AdvancedSchedulerProps> = ({ onClose }) => {
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled' | 'recurring'>('scheduled');
  const [scheduledAt, setScheduledAt] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [recurrencePattern, setRecurrencePattern] = useState({
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    interval: 1,
    daysOfWeek: [] as number[],
    endDate: '',
  });

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Dubai',
    'Asia/Karachi',
    'Asia/Kolkata',
    'Asia/Tokyo',
  ];

  const handleSave = () => {
    toast.success('Schedule saved successfully');
    onClose();
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
          className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-black text-gray-900">Advanced Scheduler</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Schedule Type */}
            <div>
              <label className="block font-bold text-gray-700 mb-2">Schedule Type</label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 transition-colors"
              >
                <option value="immediate">Send Immediately</option>
                <option value="scheduled">Schedule for Later</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 transition-colors"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            {/* Scheduled Date/Time */}
            {scheduleType === 'scheduled' && (
              <div>
                <label className="block font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 transition-colors"
                />
              </div>
            )}

            {/* Recurring Pattern */}
            {scheduleType === 'recurring' && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                <label className="block font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Repeat className="w-4 h-4" />
                  Recurrence Pattern
                </label>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Frequency</label>
                  <select
                    value={recurrencePattern.frequency}
                    onChange={(e) => setRecurrencePattern(prev => ({ ...prev, frequency: e.target.value as any }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 transition-colors"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Interval</label>
                  <input
                    type="number"
                    min="1"
                    value={recurrencePattern.interval}
                    onChange={(e) => setRecurrencePattern(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Repeat every {recurrencePattern.interval} {recurrencePattern.frequency}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={recurrencePattern.endDate}
                    onChange={(e) => setRecurrencePattern(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-400 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm font-bold text-blue-900 mb-2">Schedule Preview</p>
              <p className="text-sm text-blue-700">
                {scheduleType === 'immediate' && 'Will send immediately'}
                {scheduleType === 'scheduled' && scheduledAt && `Will send on ${new Date(scheduledAt).toLocaleString()} (${timezone})`}
                {scheduleType === 'recurring' && `Will repeat ${recurrencePattern.frequency} every ${recurrencePattern.interval} ${recurrencePattern.frequency === 'daily' ? 'day(s)' : recurrencePattern.frequency === 'weekly' ? 'week(s)' : 'month(s)'}`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/30"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
