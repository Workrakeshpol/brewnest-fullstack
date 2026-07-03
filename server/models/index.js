/**
 * Model Registry
 * ─────────────────────────────────
 * Central export point for all models.
 * Also defines the relationship graph for introspection.
 */

import UserModel from './user.model.js';
import ProductModel from './product.model.js';
import OrderModel from './order.model.js';
import CartItemModel from './cart.model.js';
import ReviewModel from './review.model.js';
import CouponModel from './coupon.model.js';
import WishlistModel from './wishlist.model.js';

export const models = {
  User: UserModel,
  Product: ProductModel,
  Order: OrderModel,
  CartItem: CartItemModel,
  Review: ReviewModel,
  Coupon: CouponModel,
  Wishlist: WishlistModel,
};

/**
 * Relationship graph — maps model names to their relations.
 * Used for eager loading, documentation, and validation.
 */
export const relationshipGraph = {
  User: {
    hasMany: ['Order', 'CartItem', 'Review', 'Wishlist'],
    hasOne: ['UserRole'],
  },
  Product: {
    hasMany: ['Review', 'OrderItem', 'CartItem', 'Wishlist'],
    belongsTo: [],
  },
  Order: {
    belongsTo: ['User'],
    hasMany: ['OrderItem'],
  },
  CartItem: {
    belongsTo: ['User', 'Product'],
  },
  Review: {
    belongsTo: ['Product', 'User'],
  },
  Wishlist: {
    belongsTo: ['User', 'Product'],
  },
  Coupon: {
    hasMany: [],
    belongsTo: [],
  },
};

/**
 * Get a model instance by name.
 * @param {string} name — model name (e.g., 'Product')
 */
export function getModel(name) {
  const model = models[name];
  if (!model) throw new Error(`[models] Unknown model: ${name}`);
  return model;
}

export default models;
