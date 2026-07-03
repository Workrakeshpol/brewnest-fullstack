/**
 * Environment Configuration
 * ─────────────────────────────────
 * Centralized, validated environment access for the entire backend.
 * Every module imports from here — never access process.env directly.
 */

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEV: (process.env.NODE_ENV || 'development') === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',

  // ── Supabase ──────────────────────────────────────────────
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // ── App ───────────────────────────────────────────────────
  APP_NAME: 'BrewNest',
  APP_URL: process.env.VITE_APP_URL || 'http://localhost:5173',
  API_PREFIX: '/api',

  // ── Security ──────────────────────────────────────────────
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // ── Rate Limiting ─────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // ── Pagination ────────────────────────────────────────────
  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
};

/**
 * Validate that required environment variables are set.
 * Called once at startup — throws on missing critical vars.
 */
export function validateEnv() {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[config] Missing required environment variables: ${missing.join(', ')}`,
    );
  }
  return true;
}

export default env;
