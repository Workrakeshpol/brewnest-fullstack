/**
 * Handler Factory — creates Vercel-compatible serverless handlers
 * from a declarative route map.
 * ─────────────────────────────────
 * This is the glue between api/*.js entry points and the
 * server/controllers layer. It applies CORS, error handling,
 * and method dispatch automatically.
 *
 * Usage in api/products.js:
 *
 *   import { createHandler } from '../server/utils/handler.js';
 *   import productRoutes from '../server/routes/product.routes.js';
 *
 *   export default createHandler(productRoutes);
 */

import { corsMiddleware } from '../middleware/cors.js';
import { errorHandler } from '../middleware/error.js';
import { asyncHandler } from './asyncHandler.js';
import { error as errorResponse } from './apiResponse.js';

/**
 * @param {Record<string, Function>} routeMap
 *   Keys are HTTP methods: 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'
 *   Values are async controller functions: (req, res) => void
 * @returns {Function} Vercel serverless handler
 */
export function createHandler(routeMap) {
  return async (req, res) => {
    // ── CORS preflight ────────────────────────────────────────
    if (corsMiddleware(req, res)) return;

    // ── Method dispatch ────────────────────────────────────────
    const method = req.method?.toUpperCase();
    const handler = routeMap[method];

    if (!handler) {
      const allowed = Object.keys(routeMap).join(', ');
      res.setHeader('Allow', allowed);
      return errorResponse(res, 405, `Method ${method} not allowed. Allowed: ${allowed}`);
    }

    // ── Execute with error catching ────────────────────────────
    try {
      await handler(req, res);
    } catch (err) {
      errorHandler(err, req, res);
    }
  };
}

/**
 * Wrap a controller with middleware chain.
 * Usage: { GET: withMiddleware(authMiddleware, controller.getAll) }
 */
export function withMiddleware(...middlewares) {
  const controller = middlewares.pop();
  return async (req, res) => {
    for (const mw of middlewares) {
      await mw(req, res);
      if (res.headersSent) return; // middleware short-circuited
    }
    await controller(req, res);
  };
}

export default createHandler;
