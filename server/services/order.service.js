/**
 * Order Service
 * ─────────────────────────────────
 * Business logic for order creation and management.
 */

import OrderModel from '../models/order.model.js';
import CouponModel from '../models/coupon.model.js';
import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

class OrderService {
  /** Get all orders for a user. */
  async getUserOrders(userId) {
    // TODO: Implement business logic
    throw new Error('order.service.getUserOrders: not implemented');
  }

  /** Get a single order by ID (with order items). */
  async getOrder(orderId, userId) {
    // TODO: Implement business logic
    // - Verify ownership
    throw new Error('order.service.getOrder: not implemented');
  }

  /** Create a new order from cart items. */
  async createOrder(userId, payload) {
    // TODO: Implement business logic
    // - Validate cart items
    // - Generate order number
    // - Create order record
    // - Create order_items records
    // - Clear user's cart
    // - Mark coupon as used if applicable
    throw new Error('order.service.createOrder: not implemented');
  }

  /** Update order status (admin only). */
  async updateOrderStatus(orderId, status) {
    // TODO: Implement business logic
    throw new Error('order.service.updateOrderStatus: not implemented');
  }

  /** Validate and apply a coupon code. */
  async validateCoupon(code, subtotal) {
    // TODO: Implement business logic
    // - Fetch coupon by code
    // - Check if active and not expired
    // - Calculate discount
    throw new Error('order.service.validateCoupon: not implemented');
  }
}

export default new OrderService();
