// Supabase client initialization and management
import { loadSupabaseConfig, getCachedConfig, setCachedConfig } from '../config/supabase-config.js';

// Supabase client instance
let supabase = null;

// Wait for Supabase CDN to load
function waitForSupabase(timeout = 10000) {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.supabase) {
            resolve(window.supabase);
            return;
        }

        const startTime = Date.now();

        const checkInterval = setInterval(() => {
            if (window.supabase) {
                clearInterval(checkInterval);
                resolve(window.supabase);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                console.error(`❌ Supabase CDN loading timeout after ${timeout}ms`);
                reject(new Error(`Supabase CDN loading timeout after ${timeout}ms`));
            }
        }, 100);
    });
}

// Initialize Supabase client with CDN loading check
export async function initSupabase() {
    try {
        // Wait for Supabase CDN to load
        await waitForSupabase();

        // Get configuration directly from .env.local
        if (!getCachedConfig()) {
            const config = await loadSupabaseConfig();
            setCachedConfig(config);
        }
        const config = getCachedConfig();

        // Create Supabase client
        supabase = window.supabase.createClient(config.url, config.anonKey);

        // Test connection
        const { error } = await supabase.from('assignments').select('count', { count: 'exact', head: true });

        if (error) {
            throw error;
        }

        return supabase;

    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error.message || 'Unknown error');
        throw error;
    }
}

// Get Supabase client instance
export function getSupabaseClient() {
    return supabase;
}

// Reset Supabase client (for configuration updates)
export function resetSupabaseClient() {
    supabase = null;
}