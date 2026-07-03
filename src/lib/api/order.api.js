/**
 * Order & Coupon API Client
 * ─────────────────────────────────
 * Frontend functions for order creation, history, and coupons.
 */

import { apiClient } from './client.js';

export const orderApi = {
  /** List the current user's orders. */
  listOrders: () => apiClient.get('/orders'),

  /** Get a single order by ID. */
  getOrder: (id) => apiClient.get('/orders', { params: { id } }),

  /** Create a new order. */
  createOrder: (payload) => apiClient.post('/orders', { body: payload }),
};

export const couponApi = {
  /** Validate a coupon code and get discount info. */
  validate: (code, subtotal) =>
    apiClient.post('/coupons', { body: { code, subtotal } }),
};

export default { orderApi, couponApi };
