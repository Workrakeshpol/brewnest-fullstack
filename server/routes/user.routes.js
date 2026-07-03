/**
 * User Routes
 * ─────────────────────────────────
 * Profile and wishlist endpoints — all require auth.
 */

import userController from '../controllers/user.controller.js';
import { withMiddleware } from '../utils/handler.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { updateProfileSchema } from '../validators/auth.validator.js';

export const userRoutes = {
  GET: withMiddleware(authMiddleware, userController.getProfile),
  PUT: withMiddleware(authMiddleware, validateBody(updateProfileSchema), userController.updateProfile),
};

export const wishlistRoutes = {
  GET:  withMiddleware(authMiddleware, userController.getWishlist),
  POST: withMiddleware(authMiddleware, userController.toggleWishlist),
};

export default { userRoutes, wishlistRoutes };
