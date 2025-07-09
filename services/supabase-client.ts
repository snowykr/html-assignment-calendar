// Supabase client initialization and management
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { 
  loadSupabaseConfig, 
  getCachedConfig, 
  setCachedConfig 
} from '../config/supabase-config';

// Supabase client instance
let supabase: SupabaseClient | null = null;
// Promise to track ongoing initialization
let initPromise: Promise<SupabaseClient> | null = null;

// Initialize Supabase client
export async function initSupabase(): Promise<SupabaseClient> {
  // Return existing initialization promise if in progress
  if (initPromise) {
    return initPromise;
  }
  
  // Return existing client if already initialized
  if (supabase) {
    return Promise.resolve(supabase);
  }

  // Create and store initialization promise
  initPromise = (async () => {
    try {
      // Get configuration directly from .env.local
      if (!getCachedConfig()) {
        const config = await loadSupabaseConfig();
        setCachedConfig(config);
      }
      const config = getCachedConfig();
      
      if (!config) {
        throw new Error('Failed to load Supabase configuration');
      }

      // Create Supabase client
      supabase = createClient(config.url, config.anonKey);

      // Test connection
      const { error } = await supabase.from('assignments_demo').select('count', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return supabase;

    } catch (error) {
      // Clear promise on error so it can be retried
      initPromise = null;
      console.error('❌ Failed to initialize Supabase:', (error as Error).message || 'Unknown error');
      throw error;
    }
  })();

  return initPromise;
}

// Get Supabase client instance
export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}

