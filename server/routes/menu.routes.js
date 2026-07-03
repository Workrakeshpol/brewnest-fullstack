/**
 * Menu / Product Routes
 * ─────────────────────────────────
 * Route map for /api/products and /api/reviews.
 */

import menuController from '../controllers/menu.controller.js';
import { withMiddleware } from '../utils/handler.js';
import { requireRole, authMiddleware } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  createReviewSchema,
} from '../validators/menu.validator.js';

export const productRoutes = {
  GET:    menuController.listProducts,
  POST:   withMiddleware(requireRole('admin'), validateBody(createProductSchema), menuController.createProduct),
  PUT:    withMiddleware(requireRole('admin'), validateBody(updateProductSchema), menuController.updateProduct),
  DELETE: withMiddleware(requireRole('admin'), menuController.deleteProduct),
};

export const reviewRoutes = {
  GET:  menuController.listReviews,
  POST: withMiddleware(authMiddleware, validateBody(createReviewSchema), menuController.createReview),
};

export default { productRoutes, reviewRoutes };
