/**
 * Cart Item Model
 * ─────────────────────────────────
 * Table: cart_items
 * Relationships:
 *   - belongs to user
 *   - belongs to product
 */

import BaseModel from './BaseModel.js';

class CartItemModel extends BaseModel {
  constructor() {
    super('cart_items');
  }

  static schema = {
    id:         { type: 'serial',  primary: true },
    user_id:    { type: 'uuid',    required: true, index: true },
    product_id: { type: 'text',    required: true, index: true },
    quantity:   { type: 'integer', required: true, default: 1 },
    created_at: { type: 'timestamptz', default: 'now()' },
  };

  static relations = {
    user:    { type: 'belongsTo', model: 'User',    foreignKey: 'user_id' },
    product: { type: 'belongsTo', model: 'Product', foreignKey: 'product_id' },
  };

  /** Get all cart items for a user, joined with product data. */
  async findByUser(userId) {
    const { data, error } = this.query
      .select('*, products(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export default new CartItemModel();
