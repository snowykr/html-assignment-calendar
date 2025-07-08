// Supabase configuration management
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let supabaseConfig: SupabaseConfig | null = null;

// Load Supabase configuration
export async function loadSupabaseConfig(): Promise<SupabaseConfig> {
  // In Next.js, environment variables are available directly
  const config: SupabaseConfig = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  };

  // Also check localStorage as fallback (for compatibility)
  if (!config.url || !config.anonKey) {
    config.url = config.url || localStorage.getItem('SUPABASE_URL') || '';
    config.anonKey = config.anonKey || localStorage.getItem('SUPABASE_ANON_KEY') || '';
  }

  // Store in localStorage as backup
  if (config.url && config.anonKey) {
    localStorage.setItem('SUPABASE_URL', config.url);
    localStorage.setItem('SUPABASE_ANON_KEY', config.anonKey);
  }

  // Validate configuration
  validateConfig(config);

  return config;
}

// Validate Supabase configuration
function validateConfig(config: SupabaseConfig): void {
  if (!config.url || !config.anonKey) {
    console.error('❌ Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  }
}


// Get cached config
export function getCachedConfig(): SupabaseConfig | null {
  return supabaseConfig;
}

// Set cached config
export function setCachedConfig(config: SupabaseConfig): void {
  supabaseConfig = config;
}