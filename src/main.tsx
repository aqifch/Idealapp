
import { createRoot } from "react-dom/client";
import logger from './utils/logger';
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

// Global error handlers
window.addEventListener('error', (event) => {
  // Filter out non-critical errors
  const errorMessage = event.message || '';
  const errorSource = event.filename || '';

  // Skip known non-critical errors
  const skipErrors = [
    'Script error', // Cross-origin script errors
    'ResizeObserver loop', // Browser quirk, not a real error
    'Non-Error promise rejection', // Handled by unhandledrejection
  ];

  if (skipErrors.some(msg => errorMessage.includes(msg))) {
    event.preventDefault();
    return;
  }

  // Only log in development
  if (import.meta.env.DEV) {
    console.error('Global error:', {
      message: event.message,
      source: errorSource,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const errorMessage = typeof reason === 'string' ? reason : reason?.message || 'Unknown error';

  // Filter out expected errors
  const skipErrors = [
    'Server unavailable',
    'NetworkError',
    'Failed to fetch',
    'KV store unavailable',
    'PGRST116', // Table does not exist (expected in some cases)
    '42501', // RLS policy (expected for guest users)
  ];

  if (skipErrors.some(msg => errorMessage.includes(msg))) {
    // Suppress known non-critical errors
    event.preventDefault();
    return;
  }

  // In development, log for debugging.
  // In production, do NOT silence: allow default browser logging and surface it for monitoring.
  if (import.meta.env.DEV) {
    logger.warn('Unhandled promise rejection:', reason);
  } else {
    logger.error('Unhandled promise rejection:', reason);
  }
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);

