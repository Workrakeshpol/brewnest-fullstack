/**
 * Authentication Middleware
 * ─────────────────────────────────
 * Verifies the Supabase JWT from the Authorization header.
 * Attaches `req.user` on success.
 *
 * Variants:
 *   authMiddleware     — requires a valid session
 *   optionalAuth       — attaches user if present, continues if not
 *   requireRole(role)  — requires auth + specific role
 */

import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { error as errorResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Extract and verify the Bearer token.
 * Returns the Supabase user object or null.
 */
export async function extractUser(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  const token = header?.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;

  return { ...data.user, accessToken: token };
}

/**
 * Fetch the user's role from the user_roles table.
 */
export async function getUserRole(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) return 'customer'; // default role
  return data.role;
}

/**
 * Require authentication — returns 401 if no valid token.
 */
export const authMiddleware = asyncHandler(async (req, res, next) => {
  const user = await extractUser(req);
  if (!user) {
    if (next) return next(ApiError.unauthorized());
    return errorResponse(res, 401, 'Authentication required');
  }
  req.user = user;
  req.userRole = await getUserRole(user.id);
  if (next) next();
});

/**
 * Optional auth — attaches user if token is present, continues regardless.
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const user = await extractUser(req);
  if (user) {
    req.user = user;
    req.userRole = await getUserRole(user.id);
  }
  if (next) next();
});

/**
 * Role-based access control.
 * @param {...string} roles — allowed roles (e.g., 'admin', 'barista')
 * Admin always passes.
 */
export function requireRole(...roles) {
  return asyncHandler(async (req, res, next) => {
    // First ensure the user is authenticated
    const user = await extractUser(req);
    if (!user) {
      if (next) return next(ApiError.unauthorized());
      return errorResponse(res, 401, 'Authentication required');
    }

    req.user = user;
    const userRole = await getUserRole(user.id);
    req.userRole = userRole;

    // Admin bypasses all role checks
    if (userRole === 'admin') {
      if (next) return next();
      return;
    }

    if (!roles.includes(userRole)) {
      if (next) return next(ApiError.forbidden(`Requires role: ${roles.join(' or ')}`));
      return errorResponse(res, 403, `Forbidden: requires role ${roles.join(' or ')}`);
    }

    if (next) next();
  });
}

export default authMiddleware;
