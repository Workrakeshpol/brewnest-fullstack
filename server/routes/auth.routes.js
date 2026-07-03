/**
 * Auth Routes
 * ─────────────────────────────────
 * Maps HTTP methods to controller functions.
 * Route map is consumed by createHandler() in api/auth.js.
 */

import authController from '../controllers/auth.controller.js';
import { withMiddleware } from '../utils/handler.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator.js';

/**
 * Route map for /api/auth
 * The `action` query param selects the sub-handler.
 * This mirrors the existing api/auth.js pattern.
 */
export function resolveAuthRoute(req) {
  const action = req.query?.action || req.body?.action;

  const actionMap = {
    signup:          { POST: authController.signUp },
    signin:          { POST: authController.signIn },
    'forgot-password': { POST: authController.forgotPassword },
    'reset-password':  { POST: authController.resetPassword },
    signout:         { POST: authController.signOut },
  };

  if (action && actionMap[action]) {
    return actionMap[action];
  }

  // Default: GET returns current user (requires auth), PUT updates profile
  return {
    GET: withMiddleware(authMiddleware, authController.getCurrentUser),
    PUT: withMiddleware(authMiddleware, validateBody(updateProfileSchema), authController.updateProfile),
  };
}

export default resolveAuthRoute;
