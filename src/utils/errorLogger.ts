/**
 * Error Logger Utility
 * Stores and retrieves error logs from localStorage for debugging
 */

export interface ErrorLogEntry {
  status: number;
  statusText: string;
  errorData: any;
  url: string;
  timestamp: string;
  automation?: string;
  trigger?: string;
}

const ERROR_LOG_KEY = 'idealpoint_error_log';
const MAX_LOG_ENTRIES = 20;

export const errorLogger = {
  /**
   * Add an error to the log
   */
  add: (error: ErrorLogEntry): void => {
    try {
      const logs = errorLogger.getAll();
      logs.push(error);
      // Keep only last N entries
      if (logs.length > MAX_LOG_ENTRIES) {
        logs.shift();
      }
      localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
  },

  /**
   * Get all error logs
   */
  getAll: (): ErrorLogEntry[] => {
    try {
      const data = localStorage.getItem(ERROR_LOG_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read error log:', e);
      return [];
    }
  },

  /**
   * Get the most recent error
   */
  getLatest: (): ErrorLogEntry | null => {
    const logs = errorLogger.getAll();
    return logs.length > 0 ? logs[logs.length - 1] : null;
  },

  /**
   * Clear all error logs
   */
  clear: (): void => {
    try {
      localStorage.removeItem(ERROR_LOG_KEY);
    } catch (e) {
      console.error('Failed to clear error log:', e);
    }
  },

  /**
   * Print error logs to console
   */
  print: (): void => {
    const logs = errorLogger.getAll();
    if (logs.length === 0) {
      console.log('📋 No error logs found');
      return;
    }
    console.group('📋 Error Logs');
    logs.forEach((log, index) => {
      console.group(`Error ${index + 1} (${new Date(log.timestamp).toLocaleString()})`);
      console.log('Status:', log.status, log.statusText);
      console.log('URL:', log.url);
      console.log('Error Data:', log.errorData);
      if (log.automation) console.log('Automation:', log.automation);
      if (log.trigger) console.log('Trigger:', log.trigger);
      console.groupEnd();
    });
    console.groupEnd();
  }
};

// Auto-print errors on import in development
if (import.meta.env.DEV) {
  // Print errors after a short delay to allow page to load
  setTimeout(() => {
    const latest = errorLogger.getLatest();
    if (latest) {
      console.log('🔍 Latest error detected. Run errorLogger.print() to see all errors.');
      console.log('Latest error:', latest);
    }
  }, 2000);
}

