/**
 * Review Model
 * ─────────────────────────────────
 * Table: reviews
 * Relationships:
 *   - belongs to product
 *   - belongs to user
 */

import BaseModel from './BaseModel.js';

class ReviewModel extends BaseModel {
  constructor() {
    super('reviews');
  }

  static schema = {
    id:           { type: 'serial',  primary: true },
    product_id:   { type: 'text',    required: true, index: true },
    user_id:      { type: 'uuid',    required: true, index: true },
    author:       { type: 'text',    required: true },
    rating:       { type: 'integer', required: true, min: 1, max: 5 },
    title:        { type: 'text' },
    body:         { type: 'text' },
    helpful_count:{ type: 'integer', default: 0 },
    verified:     { type: 'boolean', default: false },
    created_at:   { type: 'timestamptz', default: 'now()' },
  };

  static relations = {
    product: { type: 'belongsTo', model: 'Product', foreignKey: 'product_id' },
    user:    { type: 'belongsTo', model: 'User',    foreignKey: 'user_id' },
  };

  /** Find reviews for a product. */
  async findByProduct(productId) {
    const { data, error } = this.query
      .select('*')
      .eq('product_id', productId)
      .order('helpful_count', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export default new ReviewModel();
