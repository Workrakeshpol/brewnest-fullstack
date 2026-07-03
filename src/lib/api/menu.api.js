/**
 * Menu / Product API Client
 * ─────────────────────────────────
 * Frontend functions for product catalog and reviews.
 */

import { apiClient } from './client.js';

export const menuApi = {
  /** List products with optional filters, sorting, and pagination. */
  listProducts: (params = {}) =>
    apiClient.get('/products', { params }),

  /** Get a single product by ID (includes reviews). */
  getProduct: (id) =>
    apiClient.get('/products', { params: { id } }),

  /** Create a new product (admin only). */
  createProduct: (payload) =>
    apiClient.post('/products', { body: payload }),

  /** Update an existing product (admin only). */
  updateProduct: (id, updates) =>
    apiClient.put('/products', { body: { id, ...updates } }),

  /** Delete a product (admin only). */
  deleteProduct: (id) =>
    apiClient.delete('/products', { body: { id } }),

  /** Get reviews for a product. */
  listReviews: (productId, params = {}) =>
    apiClient.get('/reviews', { params: { product_id: productId, ...params } }),

  /** Create a review for a product. */
  createReview: (payload) =>
    apiClient.post('/reviews', { body: payload }),
};

export default menuApi;
