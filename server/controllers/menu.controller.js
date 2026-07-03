/**
 * Menu Controller
 * ─────────────────────────────────
 * HTTP layer for product catalog and review endpoints.
 */

import { success, paginated, error } from '../utils/apiResponse.js';
import menuService from '../services/menu.service.js';

/** GET /api/products — list with filters, sort, pagination */
export async function listProducts(req, res) {
  // TODO: Wire to menuService.listProducts(req.query)
  return error(res, 501, 'Not implemented — menu.controller.listProducts');
}

/** GET /api/products/:id — single product with reviews */
export async function getProduct(req, res) {
  // TODO: Wire to menuService.getProduct(req.query.id)
  return error(res, 501, 'Not implemented — menu.controller.getProduct');
}

/** POST /api/products — create (admin) */
export async function createProduct(req, res) {
  // TODO: Wire to menuService.createProduct(req.validatedBody)
  return error(res, 501, 'Not implemented — menu.controller.createProduct');
}

/** PUT /api/products — update (admin) */
export async function updateProduct(req, res) {
  // TODO: Wire to menuService.updateProduct(req.body.id, req.validatedBody)
  return error(res, 501, 'Not implemented — menu.controller.updateProduct');
}

/** DELETE /api/products — delete (admin) */
export async function deleteProduct(req, res) {
  // TODO: Wire to menuService.deleteProduct(req.body.id)
  return error(res, 501, 'Not implemented — menu.controller.deleteProduct');
}

/** GET /api/reviews?product_id=... — list reviews for a product */
export async function listReviews(req, res) {
  // TODO: Wire to menuService.getProductReviews(req.query.product_id, req.query)
  return error(res, 501, 'Not implemented — menu.controller.listReviews');
}

/** POST /api/reviews — create a review (auth required) */
export async function createReview(req, res) {
  // TODO: Wire to menuService.createReview(req.user.id, req.validatedBody)
  return error(res, 501, 'Not implemented — menu.controller.createReview');
}

export default {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listReviews,
  createReview,
};
