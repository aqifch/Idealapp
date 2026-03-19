/**
 * Google Maps Configuration
 * 
 * Centralized Google Maps API configuration.
 * Uses environment variables from .env file.
 */

import { googleMapsConfig } from "./index";
import logger from '../utils/logger';

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
      logger.log('✅ Google Maps API key configured');
    } else {
      logger.warn('⚠️ Google Maps API key not found. Running in manual entry mode.');
      logger.log('To enable Google Maps features:');
      logger.log('1. Get API key from https://console.cloud.google.com/');
      logger.log('2. Create .env file with: VITE_GOOGLE_MAPS_API_KEY=your_key');
      logger.log('3. Restart dev server');
    }
  }
}
