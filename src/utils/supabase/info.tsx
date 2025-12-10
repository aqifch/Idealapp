/**
 * Supabase Info
 * 
 * This file is kept for backward compatibility.
 * New code should import from @/config/supabase instead.
 * 
 * @deprecated Use config/supabase.ts instead
 */

import { projectId as getProjectId, publicAnonKey as getPublicAnonKey } from "../../config/supabase";

// Export for backward compatibility
export const projectId = getProjectId();
export const publicAnonKey = getPublicAnonKey();