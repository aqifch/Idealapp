/**
 * Shared Utility Helpers
 * Central place for commonly repeated patterns across the app.
 */

// ─── Role Helpers ────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'staff' | 'support' | 'customer';

const ADMIN_ROLES: UserRole[] = ['admin', 'manager', 'staff', 'support'];

/**
 * Check if a role has admin-level access.
 * Single source of truth — replaces repeated array.includes() checks.
 */
export function isAdminRole(role: string | undefined | null): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role as UserRole);
}

// ─── LocalStorage Helpers ────────────────────────────────────────────────────

/**
 * Safely parse JSON from localStorage.
 * Returns fallback value if key is missing, null, or JSON is corrupt.
 * Clears corrupt key automatically.
 */
export function safeParseJSON<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined) return fallback;
    return JSON.parse(item) as T;
  } catch {
    // Corrupt data — clear it
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    return fallback;
  }
}

/**
 * Safely stringify and save JSON to localStorage.
 * Fails silently if storage is full or unavailable.
 */
export function safeSaveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Silently ignore — e.g. storage quota exceeded */
  }
}
