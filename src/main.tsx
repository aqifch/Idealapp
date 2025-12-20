
  import { createRoot } from "react-dom/client";
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
    
    // Only log unexpected errors in development
    if (import.meta.env.DEV) {
      console.warn('Unhandled promise rejection:', reason);
    }
    
    // Prevent default browser error logging for production
    event.preventDefault();
  });

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:68',message:'Before React render',data:{hasRoot:!!document.getElementById("root")},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  );
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:74',message:'After React render',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  