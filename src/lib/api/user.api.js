/**
 * User & Wishlist API Client
 * ─────────────────────────────────
 * Frontend functions for user profile and wishlist.
 */

import { apiClient } from './client.js';

export const userApi = {
  /** Get the current user's profile. */
  getProfile: () => apiClient.get('/users'),

  /** Update the user's profile. */
  updateProfile: (updates) => apiClient.put('/users', { body: updates }),
};

export const wishlistApi = {
  /** Get the user's wishlist. */
  getWishlist: () => apiClient.get('/wishlist'),

  /** Toggle a product in the wishlist. */
  toggle: (productId) =>
    apiClient.post('/wishlist', { body: { product_id: productId } }),
};

export default { userApi, wishlistApi };
