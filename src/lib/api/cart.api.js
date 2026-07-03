/**
 * Cart API Client
 * ─────────────────────────────────
 * Frontend functions for shopping cart operations.
 */

import { apiClient } from './client.js';

export const cartApi = {
  /** Get the current user's cart. */
  getCart: () => apiClient.get('/cart'),

  /** Add an item to the cart. */
  addToCart: (productId, quantity = 1) =>
    apiClient.post('/cart', { body: { product_id: productId, quantity } }),

  /** Update cart item quantity. */
  updateQuantity: (productId, quantity) =>
    apiClient.put('/cart', { body: { product_id: productId, quantity } }),

  /** Remove an item from the cart. */
  removeFromCart: (productId) =>
    apiClient.delete('/cart', { body: { product_id: productId } }),
};

export default cartApi;
