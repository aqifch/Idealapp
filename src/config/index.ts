/**
 * Application Configuration
 * 
 * Centralized configuration management for API keys and environment variables.
 * All sensitive keys should be stored in .env file and accessed through this config.
 * 
 * @example
 * import { config } from '@/config';
 * const apiKey = config.supabase.publicKey;
 */

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, defaultValue: string = ''): string {
  // Vite environment variables (prefixed with VITE_)
  if (import.meta.env?.[key]) {
    return import.meta.env[key] as string;
  }
  
  // Fallback to process.env for compatibility
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key] as string;
  }
  
  return defaultValue;
}

/**
 * Supabase Configuration
 */
export const supabaseConfig = {
  projectId: getEnv('VITE_SUPABASE_PROJECT_ID', 'ugjxqpndvnhbtnbcxzjp'),
  publicAnonKey: getEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnanhxcG5kdm5oYnRuYmN4empwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTQ3MjQsImV4cCI6MjA3OTkzMDcyNH0.nW7ex44_QTCgU11WtKGrs_bToGg7bOAcecl4bkbjT00'),
  publishableKey: getEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_apuWd2u-A3Amf__0nw2daw_c4lK5ZgT'),
  url: () => `https://${supabaseConfig.projectId}.supabase.co`,
  
  /**
   * Get Supabase Edge Function URL
   */
  getFunctionUrl: (functionName: string) => {
    return `https://${supabaseConfig.projectId}.supabase.co/functions/v1/${functionName}`;
  },
  
  /**
   * Validate Supabase configuration
   */
  isValid: () => {
    return supabaseConfig.projectId.length > 0 && supabaseConfig.publicAnonKey.length > 0;
  }
};

/**
 * Google Maps Configuration
 */
export const googleMapsConfig = {
  apiKey: getEnv('VITE_GOOGLE_MAPS_API_KEY', ''),
  
  /**
   * Check if Google Maps API key is available
   */
  isAvailable: () => googleMapsConfig.apiKey.length > 0,
  
  /**
   * Get Google Maps script URL
   */
  getScriptUrl: (libraries: string[] = ['places']) => {
    const libs = libraries.join(',');
    return `https://maps.googleapis.com/maps/api/js?key=${googleMapsConfig.apiKey}&libraries=${libs}`;
  },
  
  /**
   * Set API key manually (for runtime configuration)
   */
  setApiKey: (key: string) => {
    if (typeof window !== 'undefined') {
      (window as any).GOOGLE_MAPS_API_KEY = key;
      googleMapsConfig.apiKey = key;
    }
  }
};

/**
 * Application Environment
 */
export const appConfig = {
  env: getEnv('VITE_APP_ENV', 'development'),
  isDevelopment: () => appConfig.env === 'development',
  isProduction: () => appConfig.env === 'production',
  
  /**
   * API Base URL
   */
  apiBaseUrl: getEnv('VITE_API_BASE_URL', ''),
};

/**
 * Main Configuration Object
 * Export all configs in a single object for easy access
 */
export const config = {
  supabase: supabaseConfig,
  googleMaps: googleMapsConfig,
  app: appConfig,
};

/**
 * Validate all configurations
 * Logs warnings in development if keys are missing
 */
export function validateConfig() {
  if (appConfig.isDevelopment()) {
    console.group('🔧 Configuration Status');
    
    if (supabaseConfig.isValid()) {
      console.log('✅ Supabase: Configured');
    } else {
      console.warn('⚠️ Supabase: Missing configuration');
    }
    
    if (googleMapsConfig.isAvailable()) {
      console.log('✅ Google Maps: Configured');
    } else {
      console.warn('⚠️ Google Maps: API key not found');
      console.info('   To enable: Add VITE_GOOGLE_MAPS_API_KEY to .env file');
    }
    
    console.groupEnd();
  }
}

// Auto-validate on import (only in development)
if (typeof window !== 'undefined' && appConfig.isDevelopment()) {
  validateConfig();
}

// Default export
export default config;

