import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Reads from environment variables or localStorage (if user configured via UI)
export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('medsync_supabase_url') || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('medsync_supabase_key') || '' : '';

  const url = storedUrl || envUrl;
  const anonKey = storedKey || envKey;

  const isConfigured = Boolean(
    url && 
    url !== 'https://your-project.supabase.co' && 
    anonKey && 
    anonKey !== 'your-anon-key'
  );

  return { url, anonKey, isConfigured };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('medsync_supabase_url', url);
    localStorage.setItem('medsync_supabase_key', anonKey);
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('medsync_supabase_url');
    localStorage.removeItem('medsync_supabase_key');
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (err) {
      console.warn('Erro ao inicializar Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}
