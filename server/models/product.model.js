/**
 * Product Model
 * ─────────────────────────────────
 * Table: products
 * Relationships:
 *   - belongs to category (via `category` string field)
 *   - has many reviews
 *   - has many order_items
 *   - has many cart_items
 *   - has many wishlists
 */

import BaseModel from './BaseModel.js';

class ProductModel extends BaseModel {
  constructor() {
    super('products');
  }

  static schema = {
    id:               { type: 'text',     primary: true },
    name:             { type: 'text',     required: true },
    description:      { type: 'text',     required: true },
    long_description: { type: 'text' },
    price:            { type: 'numeric',  required: true },
    image:            { type: 'text' },
    category:         { type: 'text',     required: true, index: true },
    rating:           { type: 'numeric',  default: 0 },
    review_count:     { type: 'integer',  default: 0 },
    calories:         { type: 'integer' },
    prep_time:        { type: 'text' },
    tags:             { type: 'jsonb',    default: [] },
    ingredients:      { type: 'jsonb',    default: [] },
    is_popular:       { type: 'boolean',  default: false },
    is_new:           { type: 'boolean',  default: false },
    is_active:        { type: 'boolean',  default: true },
    created_at:       { type: 'timestamptz', default: 'now()' },
  };

  static relations = {
    reviews:    { type: 'hasMany', model: 'Review',    foreignKey: 'product_id' },
    orderItems: { type: 'hasMany', model: 'OrderItem', foreignKey: 'product_id' },
    cartItems:  { type: 'hasMany', model: 'CartItem',  foreignKey: 'product_id' },
    wishlist:   { type: 'hasMany', model: 'Wishlist',  foreignKey: 'product_id' },
  };

  /** Find products by category slug. */
  async findByCategory(category) {
    return this.findMany('category', category);
  }

  /** Search products by name or description. */
  async search(query, { limit = 20 } = {}) {
    const { data, error } = this.query
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /** Find popular products. */
  async findPopular(limit = 10) {
    const { data, error } = this.query
      .select('*')
      .eq('is_popular', true)
      .order('review_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

export default new ProductModel();
