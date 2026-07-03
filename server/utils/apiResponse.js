/**
 * API Response Utilities
 * ─────────────────────────────────
 * Standardized response helpers for consistent API output.
 * Every controller uses these — never call res.json() directly.
 */

/**
 * Send a success response.
 * @param {object} res - Express/Vercel response object
 * @param {number} statusCode - HTTP status code
 * @param {*} data - response payload
 * @param {object} meta - optional metadata (pagination, etc.)
 */
export function success(res, statusCode = 200, data = null, meta = null) {
 const response = {
    success: true,
    data,
  };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

/**
 * Send a paginated success response.
 */
export function paginated(res, data, { page, limit, total }) {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    data,
    meta: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
}

/**
 * Send an error response.
 */
export function error(res, statusCode = 500, message = 'Internal server error', details = null) {
  const response = {
    success: false,
    error: { message },
  };
  if (details) response.error.details = details;
  return res.status(statusCode).json(response);
}

/**
 * Send a created (201) response.
 */
export function created(res, data = null, meta = null) {
  return success(res, 201, data, meta);
}

/**
 * Send a no-content (204) response.
 */
export function noContent(res) {
  return res.status(204).end();
}

export default { success, paginated, error, created, noContent };
