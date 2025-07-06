// Supabase configuration management
let supabaseConfig = null;

// Load environment variables from .env.local
export async function loadSupabaseConfig() {
    try {
        // Try to fetch .env.local file
        const response = await fetch('./.env.local');

        if (!response.ok) {
            return getConfigFromStorage();
        }

        const envText = await response.text();
        const config = parseEnvFile(envText);

        // Store in localStorage as backup
        localStorage.setItem('SUPABASE_URL', config.SUPABASE_URL || '');
        localStorage.setItem('SUPABASE_ANON_KEY', config.SUPABASE_ANON_KEY || '');

        const result = {
            url: config.SUPABASE_URL || '',
            anonKey: config.SUPABASE_ANON_KEY || ''
        };

        // Validate configuration
        validateConfig(result);

        return result;

    } catch (error) {
        return getConfigFromStorage();
    }
}

// Parse .env file content
function parseEnvFile(content) {
    const config = {};
    const lines = content.split('\n');

    for (const line of lines) {
        // Skip empty lines and comments
        if (!line.trim() || line.trim().startsWith('#')) {
            continue;
        }

        // Parse KEY=VALUE format
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            config[key.trim()] = value;
        }
    }

    return config;
}

// Get configuration from localStorage as fallback
function getConfigFromStorage() {
    const config = {
        url: localStorage.getItem('SUPABASE_URL') || '',
        anonKey: localStorage.getItem('SUPABASE_ANON_KEY') || ''
    };

    // Validate configuration
    validateConfig(config);

    return config;
}

// Validate Supabase configuration
function validateConfig(config) {
    if (!config.url || !config.anonKey) {
        console.error('❌ Missing Supabase configuration.');
    }
}

// Manual configuration setter (for development/testing)
export function setSupabaseConfig(url, anonKey) {
    supabaseConfig = { url, anonKey };

    // Also store in localStorage
    localStorage.setItem('SUPABASE_URL', url);
    localStorage.setItem('SUPABASE_ANON_KEY', anonKey);

    return supabaseConfig;
}

// Get cached config
export function getCachedConfig() {
    return supabaseConfig;
}

// Set cached config
export function setCachedConfig(config) {
    supabaseConfig = config;
}