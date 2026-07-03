/**
 * Async Handler Wrapper
 * ─────────────────────────────────
 * Wraps an async route handler so rejected promises are
 * forwarded to the error-handling middleware automatically.
 *
 * Usage:
 *   router.get('/products', asyncHandler(controller.getAll));
 */

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (next) {
        next(err);
      } else {
        // Vercel serverless: no next() — handle inline
        const { errorHandler } = require('../middleware/error.js');
        errorHandler(err, req, res);
      }
    });
  };
}

export default asyncHandler;
