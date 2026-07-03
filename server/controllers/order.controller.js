/**
 * Order Controller
 * ─────────────────────────────────
 * HTTP layer for order and coupon endpoints.
 */

import { success, paginated, error } from '../utils/apiResponse.js';
import orderService from '../services/order.service.js';

/** GET /api/orders — list user's orders */
export async function listOrders(req, res) {
  // TODO: Wire to orderService.getUserOrders(req.user.id)
  return error(res, 501, 'Not implemented — order.controller.listOrders');
}

/** GET /api/orders/:id — get single order */
export async function getOrder(req, res) {
  // TODO: Wire to orderService.getOrder(req.query.id, req.user.id)
  return error(res, 501, 'Not implemented — order.controller.getOrder');
}

/** POST /api/orders — create a new order */
export async function createOrder(req, res) {
  // TODO: Wire to orderService.createOrder(req.user.id, req.validatedBody)
  return error(res, 501, 'Not implemented — order.controller.createOrder');
}

/** PATCH /api/orders/:id/status — update status (admin) */
export async function updateStatus(req, res) {
  // TODO: Wire to orderService.updateOrderStatus(req.body.id, req.body.status)
  return error(res, 501, 'Not implemented — order.controller.updateStatus');
}

/** POST /api/coupons/validate — validate a coupon code */
export async function validateCoupon(req, res) {
  // TODO: Wire to orderService.validateCoupon(req.body.code, req.body.subtotal)
  return error(res, 501, 'Not implemented — order.controller.validateCoupon');
}

export default {
  listOrders,
  getOrder,
  createOrder,
  updateStatus,
  validateCoupon,
};
