/**
 * Order & Coupon Routes
 * ─────────────────────────────────
 */

import orderController from '../controllers/order.controller.js';
import { withMiddleware } from '../utils/handler.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { createOrderSchema, applyCouponSchema } from '../validators/order.validator.js';

export const orderRoutes = {
  GET:  withMiddleware(authMiddleware, orderController.listOrders),
  POST: withMiddleware(authMiddleware, validateBody(createOrderSchema), orderController.createOrder),
};

export const couponRoutes = {
  POST: withMiddleware(authMiddleware, validateBody(applyCouponSchema), orderController.validateCoupon),
};

export default { orderRoutes, couponRoutes };
