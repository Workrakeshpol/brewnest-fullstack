/**
 * Cart Controller
 * ─────────────────────────────────
 * HTTP layer for shopping cart endpoints.
 * All routes require authentication.
 */

import { success, error } from '../utils/apiResponse.js';
import cartService from '../services/cart.service.js';

/** GET /api/cart — get user's cart */
export async function getCart(req, res) {
  // TODO: Wire to cartService.getCart(req.user.id)
  return error(res, 501, 'Not implemented — cart.controller.getCart');
}

/** POST /api/cart — add item to cart */
export async function addToCart(req, res) {
  // TODO: Wire to cartService.addToCart(req.user.id, req.validatedBody)
  return error(res, 501, 'Not implemented — cart.controller.addToCart');
}

/** PUT /api/cart — update item quantity */
export async function updateQuantity(req, res) {
  // TODO: Wire to cartService.updateQuantity(req.user.id, req.validatedBody)
  return error(res, 501, 'Not implemented — cart.controller.updateQuantity');
}

/** DELETE /api/cart — remove item from cart */
export async function removeFromCart(req, res) {
  // TODO: Wire to cartService.removeFromCart(req.user.id, req.validatedBody)
  return error(res, 501, 'Not implemented — cart.controller.removeFromCart');
}

/** DELETE /api/cart/clear — clear entire cart */
export async function clearCart(req, res) {
  // TODO: Wire to cartService.clearCart(req.user.id)
  return error(res, 501, 'Not implemented — cart.controller.clearCart');
}

export default {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};
