/**
 * Server-Side Supabase Client
 * ─────────────────────────────────
 * Uses the service-role key for privileged server operations.
 * Separate from api/db-client.js (which has resilience logic).
 *
 * This client is used by the model and service layers.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from './index.js';

/** Privileged client — bypasses RLS. Server-side only. */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/** Anonymous client — respects RLS. Used for user-scoped queries. */
export const supabaseAnon = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Create a user-scoped client that carries the user's JWT.
 * RLS policies will apply to all queries through this client.
 */
export function createUserClient(accessToken) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export default supabaseAdmin;
