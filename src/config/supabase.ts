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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:14',message:'createSupabaseClient entry',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const url = supabaseConfig.url();
  const key = supabaseConfig.publicAnonKey;
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:17',message:'Supabase config check',data:{isValid:supabaseConfig.isValid(),hasUrl:!!url,hasKey:!!key,urlLength:url.length,keyLength:key.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  if (!supabaseConfig.isValid()) {
    console.warn('⚠️ Supabase configuration is incomplete. Some features may not work.');
  }
  
  const client = createClient(url, key);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:23',message:'Supabase client created',data:{hasClient:!!client},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return client;
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

// Export for backward compatibility
export const projectId = getProjectId();
export const publicAnonKey = getPublicAnonKey();

