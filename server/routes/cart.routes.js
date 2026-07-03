/**
 * Cart Routes
 * ─────────────────────────────────
 * All routes require authentication.
 */

import cartController from '../controllers/cart.controller.js';
import { withMiddleware } from '../utils/handler.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import {
  addToCartSchema,
  updateCartSchema,
  removeFromCartSchema,
} from '../validators/cart.validator.js';

export const cartRoutes = {
  GET:    withMiddleware(authMiddleware, cartController.getCart),
  POST:   withMiddleware(authMiddleware, validateBody(addToCartSchema), cartController.addToCart),
  PUT:    withMiddleware(authMiddleware, validateBody(updateCartSchema), cartController.updateQuantity),
  DELETE: withMiddleware(authMiddleware, validateBody(removeFromCartSchema), cartController.removeFromCart),
};

export default cartRoutes;
