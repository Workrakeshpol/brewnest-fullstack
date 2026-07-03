/**
 * Error Handling Middleware
 * ─────────────────────────────────
 * Central error handler. Catches all errors thrown in route handlers
 * and returns a standardized JSON error response.
 *
 * Distinguishes between:
 *   - ApiError (operational, safe to expose)
 *   - Supabase errors (Postgres errors)
 *   - Unexpected errors (generic 500, details hidden in production)
 */

import { ApiError } from '../utils/ApiError.js';
import { error as errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/index.js';

export function errorHandler(err, req, res, _next) {
  let statusCode = 500;
  let message = 'Internal server error';
  let details = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err?.code === 'PGRST116') {
    // Supabase: no rows found
    statusCode = 404;
    message = 'Resource not found';
  } else if (err?.code === '23505') {
    // Postgres: unique constraint violation
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err?.code === '23503') {
    // Postgres: foreign key violation
    statusCode = 400;
    message = 'Referenced resource does not exist';
  } else if (err?.code === '42501') {
    // Postgres: insufficient privilege / RLS
    statusCode = 403;
    message = 'You do not have permission for this action';
  } else if (err?.name === 'ZodError' || err?.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = err.errors || err.issues || err.details;
  } else {
    // Unexpected error
    message = env.IS_DEV ? err.message : 'Internal server error';
    logger.error('Unhandled error', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }

  // Log operational errors at warn, unexpected at error
  if (statusCode >= 500) {
    logger.error(`${statusCode} ${message}`, { stack: err.stack });
  } else {
    logger.warn(`${statusCode} ${message}`);
  }

  return errorResponse(res, statusCode, message, details);
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req, res) {
  return errorResponse(res, 404, `Route not found: ${req.method} ${req.url}`);
}

export default errorHandler;
