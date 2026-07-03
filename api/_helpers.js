/**
 * _helpers.js — Shared backend utilities for all API routes.
 *
 * Exports:
 *   setCORS, requireAuth, requireRole, getUser,
 *   rateLimit, sanitize, validate, whitelist,
 *   handleError, ok, created, badRequest, unauthorized, forbidden, notFound, conflict,
 *   parsePagination, sanitizeSearch
 */

import supabase from './db-client.js';

/* ════════════════════════════════════════════════════════════
   CORS
   ════════════════════════════════════════════════════════════ */

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

export function setCORS(req, res) {
  const origin = req.headers.origin;
  // Use specific origin if allowlisted, otherwise fall back to wildcard
  // (Vercel preview URLs are dynamic, so wildcard is needed for dev)
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

/* ════════════════════════════════════════════════════════════
   AUTHENTICATION & AUTHORIZATION
   ════════════════════════════════════════════════════════════ */

/**
 * Verify the Bearer token and return the user object or null.
 */
export async function getUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

/**
 * Require authentication. Sends 401 if unauthenticated.
 * Returns { user, error }.
 */
export async function requireAuth(req, res) {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return { user: null, error: true };
  }
  return { user, error: false };
}

/**
 * Require a specific role (or admin override).
 * Returns { user, error }.
 */
export async function requireRole(req, res, requiredRole) {
  const { user, error } = await requireAuth(req, res);
  if (error) return { user: null, error: true };

  const { data, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError || !data) {
    res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    return { user: null, error: true };
  }

  // Admins can access everything; otherwise exact role match
  if (data.role !== requiredRole && data.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    return { user: null, error: true };
  }

  return { user, error: false };
}

/**
 * Get the role for a user (without sending error responses).
 */
export async function getUserRole(userId) {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  return data?.role || 'customer';
}

/* ════════════════════════════════════════════════════════════
   RATE LIMITING (in-memory token bucket, per IP)
   ════════════════════════════════════════════════════════════ */

const rateBuckets = new Map();
const RATE_CLEANUP_INTERVAL = 60_000; // 1 min

// Periodic cleanup of expired buckets
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now > bucket.resetAt) {
      rateBuckets.delete(key);
    }
  }
}, RATE_CLEANUP_INTERVAL);

/**
 * Rate limit middleware. Returns true if the request should be
 * allowed, false if rate-limited (caller should return 429).
 *
 * @param {object} req - Express-like request
 * @param {object} res - Express-like response
 * @param {object} opts - { max: number, windowMs: number }
 * @returns {boolean} allowed
 */
export function rateLimit(req, res, opts = {}) {
  const max = opts.max || 60;
  const windowMs = opts.windowMs || 60_000; // 1 minute default

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';

  const now = Date.now();
  let bucket = rateBuckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    rateBuckets.set(ip, bucket);
  }

  bucket.count++;

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', max);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, max - bucket.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));

  if (bucket.count > max) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter,
    });
    return false;
  }

  return true;
}

/* ════════════════════════════════════════════════════════════
   INPUT SANITIZATION & VALIDATION
   ════════════════════════════════════════════════════════════ */

/**
 * Strip HTML tags and trim whitespace from a string.
 */
export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[\x00-\x1f\x7f]/g, '') // strip control chars
    .trim();
}

/**
 * Escape special characters for use in PostgREST ilike filters.
 * Prevents wildcard injection (% and _ are special in ilike).
 */
export function sanitizeSearch(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[%_\\]/g, '\\$&') // escape SQL LIKE wildcards
    .replace(/<[^>]*>/g, '')    // strip HTML
    .trim()
    .slice(0, 100);             // limit length
}

/**
 * Validate email format.
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/**
 * Validate password strength.
 * Returns error message or null if valid.
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  if (password.length > 128) {
    return 'Password must be at most 128 characters';
  }
  return null;
}

/**
 * Validate that a value is a positive integer.
 */
export function isPositiveInt(val) {
  const n = Number(val);
  return Number.isInteger(n) && n > 0;
}

/**
 * Validate that a value is a non-negative number.
 */
export function isNonNegativeNumber(val) {
  const n = Number(val);
  return typeof n === 'number' && !isNaN(n) && n >= 0;
}

/**
 * Parse and clamp pagination parameters.
 */
export function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 20;
  if (limit > 100) limit = 100; // hard cap

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Whitelist fields from an object to prevent mass assignment.
 * Returns a new object with only allowed keys.
 */
export function whitelist(obj, allowedFields) {
  if (!obj || typeof obj !== 'object') return {};
  const result = {};
  for (const key of allowedFields) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Validate a phone number (basic — digits, spaces, dashes, parens, +).
 */
export function isValidPhone(phone) {
  if (!phone) return true; // optional
  return /^[+]?[\d\s\-()]{7,20}$/.test(phone);
}

/**
 * Validate a date string is a valid date and optionally not in the past.
 */
export function isValidDate(dateStr, allowPast = true) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  if (!allowPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return false;
  }
  return true;
}

/* ════════════════════════════════════════════════════════════
   ERROR HANDLING & RESPONSE HELPERS
   ════════════════════════════════════════════════════════════ */

/**
 * Sanitized error message — never leaks internal details.
 */
const SAFE_ERROR = 'An unexpected error occurred. Please try again.';

/**
 * Wrap an async handler with try/catch that sends a safe error response.
 * Logs the real error server-side.
 */
export function handleError(err, res, context = 'API') {
  console.error(`[${context}] Error:`, err?.message || err);

  // Supabase errors have a code property
  if (err?.code === '23505') {
    return res.status(409).json({ error: 'This item already exists.' });
  }
  if (err?.code === '23503') {
    return res.status(400).json({ error: 'Referenced item does not exist.' });
  }
  if (err?.code === '42501') {
    return res.status(403).json({ error: 'Permission denied.' });
  }

  // Never expose raw error messages to the client
  res.status(500).json({ error: SAFE_ERROR });
}

/* ── Response helpers ───────────────────────────────────────── */

export function ok(res, data) {
  return res.status(200).json(data);
}

export function created(res, data) {
  return res.status(201).json(data);
}

export function badRequest(res, message) {
  return res.status(400).json({ error: message || 'Bad request' });
}

export function unauthorized(res, message) {
  return res.status(401).json({ error: message || 'Authentication required' });
}

export function forbidden(res, message) {
  return res.status(403).json({ error: message || 'Forbidden' });
}

export function notFound(res, message) {
  return res.status(404).json({ error: message || 'Not found' });
}

export function conflict(res, message) {
  return res.status(409).json({ error: message || 'Conflict' });
}
