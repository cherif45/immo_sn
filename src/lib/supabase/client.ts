import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('xyzcompany') &&
  !supabaseAnonKey.includes('eyJhbGciOi...')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Storage Helper UI uniquement (thème, navigation, etc.)
 * RÈGLE ABSOLUE : Aucune donnée métier sensible ne doit être stockée dans localStorage.
 */
const UI_STORAGE_PREFIX = 'fital_immo_ui_';

export function getUiPreference<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(UI_STORAGE_PREFIX + key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`Erreur lecture préférence UI ${key}:`, e);
  }
  return defaultValue;
}

export function saveUiPreference<T>(key: string, value: T): void {
  try {
    localStorage.setItem(UI_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Erreur sauvegarde préférence UI ${key}:`, e);
  }
}
