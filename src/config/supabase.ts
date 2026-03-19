/**
 * Supabase Configuration
 * 
 * Centralized Supabase client configuration.
 * Uses environment variables from .env file.
 */

import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./index";

/**
 * Create Supabase client instance
 */
export const createSupabaseClient = () => {
  const url = supabaseConfig.url();
  const key = supabaseConfig.publicAnonKey;

  if (!supabaseConfig.isValid()) {
    console.warn('⚠️ Supabase configuration is incomplete. Some features may not work.');
  }

  return createClient(url, key);
};

/**
 * Default Supabase client instance
 */
export const supabase = createSupabaseClient();

/**
 * Get Supabase project ID
 */
export const getProjectId = () => supabaseConfig.projectId;

/**
 * Get Supabase public anon key
 */
export const getPublicAnonKey = () => supabaseConfig.publicAnonKey;

/**
 * Get Supabase URL
 */
export const getSupabaseUrl = () => supabaseConfig.url();

/**
 * Get Edge Function URL
 */
export const getFunctionUrl = (functionName: string) => {
  return supabaseConfig.getFunctionUrl(functionName);
};

/**
 * Get an auth token suitable for calling Edge Functions.
 * 
 * Priority:
 * 1) Logged-in user's access token
 * 2) Fallback to public anon key (for guest / public calls)
 */
export const getAuthToken = async (): Promise<string> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return session.access_token;
    }
  } catch {
    // Swallow and fall back to anon key
  }
  return getPublicAnonKey();
};

// Export for backward compatibility
export const projectId = getProjectId();
export const publicAnonKey = getPublicAnonKey();
