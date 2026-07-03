/**
 * Coupon Service
 * ─────────────────────────────────
 * Business logic for coupon validation and management.
 */

import CouponModel from '../models/coupon.model.js';
import { ApiError } from '../utils/ApiError.js';

class CouponService {
  /** List all active coupons (admin). */
  async listCoupons() {
    // TODO: Implement business logic
    throw new Error('coupon.service.listCoupons: not implemented');
  }

  /** Validate a coupon code and return discount info. */
  async validateCoupon(code, subtotal) {
    // TODO: Implement business logic
    // - Fetch coupon by code
    // - Check active + not expired
    // - Calculate discount based on type (percentage/fixed)
    throw new Error('coupon.service.validateCoupon: not implemented');
  }

  /** Create a new coupon (admin). */
  async createCoupon(payload) {
    // TODO: Implement business logic
    throw new Error('coupon.service.createCoupon: not implemented');
  }

  /** Increment used count when an order uses a coupon. */
  async markUsed(code) {
    // TODO: Implement business logic
    throw new Error('coupon.service.markUsed: not implemented');
  }
}

export default new CouponService();
