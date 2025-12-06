/**
 * Google Maps Configuration
 * 
 * This file provides a safe way to access Google Maps API key
 * across different build environments.
 */

// Try multiple methods to get the API key
function getGoogleMapsApiKey(): string {
  // Method 1: Try import.meta.env (Vite)
  try {
    // @ts-ignore - import.meta.env may not exist in all environments
    if (import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
    }
  } catch (e) {
    // Silently fail and try next method
  }

  // Method 2: Try process.env (Webpack/CRA)
  try {
    if (typeof process !== 'undefined' && process.env) {
      return (process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY) as string || '';
    }
  } catch (e) {
    // Silently fail and try next method
  }

  // Method 3: Try window object (manual configuration)
  try {
    if (typeof window !== 'undefined' && (window as any).GOOGLE_MAPS_API_KEY) {
      return (window as any).GOOGLE_MAPS_API_KEY;
    }
  } catch (e) {
    // Silently fail
  }

  // Method 4: Return empty string (manual entry mode)
  return '';
}

export const GOOGLE_MAPS_CONFIG = {
  apiKey: getGoogleMapsApiKey(),
  isAvailable: () => getGoogleMapsApiKey().length > 0,
  
  // For manual configuration (optional)
  setApiKey: (key: string) => {
    if (typeof window !== 'undefined') {
      (window as any).GOOGLE_MAPS_API_KEY = key;
    }
  }
};

// Log configuration status (only in development)
if (typeof window !== 'undefined') {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isDev) {
    if (GOOGLE_MAPS_CONFIG.isAvailable()) {
      console.log('✅ Google Maps API key configured');
    } else {
      console.warn('⚠️ Google Maps API key not found. Running in manual entry mode.');
      console.log('To enable Google Maps features:');
      console.log('1. Get API key from https://console.cloud.google.com/');
      console.log('2. Create .env file with: VITE_GOOGLE_MAPS_API_KEY=your_key');
      console.log('3. Restart dev server');
    }
  }
}
