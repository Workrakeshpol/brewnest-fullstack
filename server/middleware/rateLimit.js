/**
 * Rate Limiting Middleware
 * ─────────────────────────────────
 * Simple in-memory rate limiter (per IP address).
 * Suitable for serverless — each function instance has its own
 * counter. For production at scale, swap with a Redis-backed limiter.
 */

import { env } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';
import { error as errorResponse } from '../utils/apiResponse.js';

const store = new Map();

/**
 * @param {object} options
 * @param {number} options.windowMs — time window in milliseconds
 * @param {number} options.max — max requests per window
 * @param {string} options.keyGenerator — function (req) => string
 */
export function rateLimit(options = {}) {
  const {
    windowMs = env.RATE_LIMIT_WINDOW_MS,
    max = env.RATE_LIMIT_MAX,
    keyGenerator = (req) => req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Prune expired entries
    if (store.has(key)) {
      const entries = store.get(key).filter((ts) => ts > windowStart);
      store.set(key, entries);

      if (entries.length >= max) {
        const retryAfter = Math.ceil(windowMs / 1000);
        res.setHeader('Retry-After', retryAfter);

        if (next) return next(ApiError.tooMany());
        return errorResponse(res, 429, 'Too many requests, please slow down');
      }

      entries.push(now);
    } else {
      store.set(key, [now]);
    }

    // Set rate limit headers
    const remaining = max - store.get(key).length;
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));

    if (next) next();
  };
}

/** Clear the rate limit store (useful for testing). */
export function clearRateLimitStore() {
  store.clear();
}

export default rateLimit;
