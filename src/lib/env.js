/**
 * Centralized environment variable validation
 * All env vars are validated at module load time to fail fast
 */

const requiredEnvVars = {
  VITE_SUPABASE_URL: 'Supabase project URL',
  VITE_SUPABASE_ANON_KEY: 'Supabase anonymous key',
};

/**
 * Validates that all required environment variables are present
 * Throws a clear error if any are missing
 */
function validateRequiredEnvVars() {
  const missing = [];

  for (const [key, description] of Object.entries(requiredEnvVars)) {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      missing.push(`${key} (${description})`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(m => `  - ${m}`).join('\n')}\n\n` +
      `Please create a .env file in the project root with these variables.\n` +
      `See .env.example for the required format.`
    );
  }
}

/**
 * Gets an environment variable value
 * For required vars, validates first
 */
export function getEnv(key, required = false) {
  if (required) {
    validateRequiredEnvVars();
  }
  return import.meta.env[key];
}

/**
 * Safe getter for Supabase URL
 */
export function getSupabaseUrl() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) {
    throw new Error('VITE_SUPABASE_URL is not set. Check your .env file.');
  }
  return url;
}

/**
 * Safe getter for Supabase Anon Key
 */
export function getSupabaseAnonKey() {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('VITE_SUPABASE_ANON_KEY is not set. Check your .env file.');
  }
  return key;
}

/**
 * Safe getter for Razorpay Key ID
 * Returns null if not set (payments may be disabled)
 */
export function getRazorpayKeyId() {
  return import.meta.env.VITE_RAZORPAY_KEY_ID || null;
}

/**
 * Checks if Razorpay is configured
 */
export function isRazorpayConfigured() {
  const keyId = getRazorpayKeyId();
  return keyId && keyId !== 'TO_BE_ADDED_LATER';
}

/**
 * Safe getter for Worker URL
 * Returns null if not set (worker features may be disabled)
 */
export function getWorkerUrl() {
  const url = import.meta.env.VITE_WORKER_URL;
  if (!url || url === 'TO_BE_ADDED_LATER') {
    return null;
  }
  return url;
}

/**
 * Checks if Worker is configured
 */
export function isWorkerConfigured() {
  return getWorkerUrl() !== null;
}

// Validate required vars on module load
validateRequiredEnvVars();

export default {
  getSupabaseUrl,
  getSupabaseAnonKey,
  getRazorpayKeyId,
  isRazorpayConfigured,
  getWorkerUrl,
  isWorkerConfigured,
};
