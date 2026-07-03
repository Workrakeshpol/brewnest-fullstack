/**
 * API Client Barrel Export
 * ─────────────────────────────────
 * Single import point for all API client modules.
 *
 * Usage:
 *   import { authApi, menuApi, cartApi } from '../lib/api';
 */

export { apiClient, setAuthToken, clearAuthToken } from './client.js';
export { authApi } from './auth.api.js';
export { menuApi } from './menu.api.js';
export { cartApi } from './cart.api.js';
export { orderApi, couponApi } from './order.api.js';
export { userApi, wishlistApi } from './user.api.js';

export default {
  auth: authApi,
  menu: menuApi,
  cart: cartApi,
  order: orderApi,
  coupon: couponApi,
  user: userApi,
  wishlist: wishlistApi,
};
