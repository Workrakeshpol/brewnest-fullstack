/**
 * Cart Service
 * ─────────────────────────────────
 * Business logic for shopping cart operations.
 */

import CartItemModel from '../models/cart.model.js';
import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

class CartService {
  /** Get all cart items for a user. */
  async getCart(userId) {
    // TODO: Implement business logic
    throw new Error('cart.service.getCart: not implemented');
  }

  /** Add an item to the cart (or increment if exists). */
  async addToCart(userId, { product_id, quantity = 1 }) {
    // TODO: Implement business logic
    // - Check if product exists
    // - Check if already in cart → increment or insert
    throw new Error('cart.service.addToCart: not implemented');
  }

  /** Update cart item quantity. */
  async updateQuantity(userId, { product_id, quantity }) {
    // TODO: Implement business logic
    // - If quantity <= 0, remove item
    throw new Error('cart.service.updateQuantity: not implemented');
  }

  /** Remove an item from the cart. */
  async removeFromCart(userId, { product_id }) {
    // TODO: Implement business logic
    throw new Error('cart.service.removeFromCart: not implemented');
  }

  /** Clear the entire cart. */
  async clearCart(userId) {
    // TODO: Implement business logic
    throw new Error('cart.service.clearCart: not implemented');
  }

  /** Get cart summary (subtotal, item count). */
  async getCartSummary(userId) {
    // TODO: Implement business logic
    throw new Error('cart.service.getCartSummary: not implemented');
  }
}

export default new CartService();
