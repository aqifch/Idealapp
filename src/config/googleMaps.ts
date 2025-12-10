/**
 * Google Maps Configuration
 * 
 * Centralized Google Maps API configuration.
 * Uses environment variables from .env file.
 */

import { googleMapsConfig } from "./index";

/**
 * Google Maps Configuration Object
 * Re-exported from main config for backward compatibility
 */
export const GOOGLE_MAPS_CONFIG = {
  apiKey: googleMapsConfig.apiKey,
  isAvailable: () => googleMapsConfig.isAvailable(),
  setApiKey: (key: string) => googleMapsConfig.setApiKey(key),
  getScriptUrl: (libraries?: string[]) => googleMapsConfig.getScriptUrl(libraries),
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
