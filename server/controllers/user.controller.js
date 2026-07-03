/**
 * User Controller
 * ─────────────────────────────────
 * HTTP layer for user profile and wishlist endpoints.
 */

import { success, error } from '../utils/apiResponse.js';
import userService from '../services/user.service.js';

/** GET /api/users/profile — get current user's profile */
export async function getProfile(req, res) {
  // TODO: Wire to userService.getProfile(req.user.id)
  return error(res, 501, 'Not implemented — user.controller.getProfile');
}

/** PUT /api/users/profile — update profile */
export async function updateProfile(req, res) {
  // TODO: Wire to userService.updateProfile(req.user.id, req.validatedBody)
  return error(res, 501, 'Not implemented — user.controller.updateProfile');
}

/** GET /api/users/wishlist — get user's wishlist */
export async function getWishlist(req, res) {
  // TODO: Wire to userService.getWishlist(req.user.id)
  return error(res, 501, 'Not implemented — user.controller.getWishlist');
}

/** POST /api/users/wishlist — toggle wishlist item */
export async function toggleWishlist(req, res) {
  // TODO: Wire to userService.toggleWishlist(req.user.id, req.body.product_id)
  return error(res, 501, 'Not implemented — user.controller.toggleWishlist');
}

export default {
  getProfile,
  updateProfile,
  getWishlist,
  toggleWishlist,
};
