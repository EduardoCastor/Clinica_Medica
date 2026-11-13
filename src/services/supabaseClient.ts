import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_ENV_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const DEFAULT_ENV_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

function isValidCredential(value: string, placeholder: string): boolean {
  return Boolean(value && value !== placeholder);
}

// Reads from environment variables by default, with localStorage fallback if manually configured via UI
export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = isValidCredential(DEFAULT_ENV_URL, 'https://your-project.supabase.co') ? DEFAULT_ENV_URL : '';
  const envKey = isValidCredential(DEFAULT_ENV_ANON_KEY, 'your-anon-key') ? DEFAULT_ENV_ANON_KEY : '';

  const storedUrl = typeof window !== 'undefined' ? (localStorage.getItem('medsync_supabase_url') || '').trim() : '';
  const storedKey = typeof window !== 'undefined' ? (localStorage.getItem('medsync_supabase_key') || '').trim() : '';

  const url = envUrl || storedUrl;
  const anonKey = envKey || storedKey;

  const isConfigured = Boolean(
    isValidCredential(url, 'https://your-project.supabase.co') &&
    isValidCredential(anonKey, 'your-anon-key')
  );

  return { url, anonKey, isConfigured };
}

let supabaseInstance: SupabaseClient | null = null;
let lastCredentialsKey = '';

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('medsync_supabase_url', url.trim());
    localStorage.setItem('medsync_supabase_key', anonKey.trim());
    supabaseInstance = null;
    lastCredentialsKey = '';
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('medsync_supabase_url');
    localStorage.removeItem('medsync_supabase_key');
    supabaseInstance = null;
    lastCredentialsKey = '';
  }
}

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  const credentialsKey = `${url}|${anonKey}`;
  if (!supabaseInstance || lastCredentialsKey !== credentialsKey) {
    try {
      supabaseInstance = createClient(url, anonKey);
      lastCredentialsKey = credentialsKey;
    } catch (err) {
      console.warn('Erro ao inicializar Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export const supabase = getSupabase();
