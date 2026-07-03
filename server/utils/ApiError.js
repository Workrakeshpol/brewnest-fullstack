/**
 * ApiError — custom error class for structured API error responses.
 *
 * Usage:
 *   throw new ApiError(404, 'Product not found');
 *   throw new ApiError(400, 'Validation failed', { field: 'email' });
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // expected error, safe to expose

    Error.captureStackTrace?.(this, this.constructor);
  }

  /** Convenience factories */
  static badRequest(msg = 'Bad request', details = null) {
    return new ApiError(400, msg, details);
  }

  static unauthorized(msg = 'Authentication required') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'You do not have permission to perform this action') {
    return new ApiError(403, msg);
  }
  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Resource already exists') {
    return new ApiError(409, msg);
  }

  static tooMany(msg = 'Too many requests, please slow down') {
    return new ApiError(429, msg);
  }

  static internal(msg = 'Internal server error') {
    return new ApiError(500, msg);
  }
}

export default ApiError;
