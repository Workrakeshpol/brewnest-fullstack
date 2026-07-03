/**
 * Wishlist Model
 * ─────────────────────────────────
 * Table: wishlists
 * Relationships:
 *   - belongs to user
 *   - belongs to product
 */

import BaseModel from './BaseModel.js';

class WishlistModel extends BaseModel {
  constructor() {
    super('wishlists');
  }

  static schema = {
    id:         { type: 'serial',  primary: true },
    user_id:    { type: 'uuid',    required: true, index: true },
    product_id: { type: 'text',    required: true, index: true },
    created_at: { type: 'timestamptz', default: 'now()' },
  };

  static relations = {
    user:    { type: 'belongsTo', model: 'User',    foreignKey: 'user_id' },
    product: { type: 'belongsTo', model: 'Product', foreignKey: 'product_id' },
  };

  /** Get wishlist items for a user, joined with product data. */
  async findByUser(userId) {
    const { data, error } = this.query
      .select('*, products(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /** Toggle a product in the user's wishlist. */
  async toggle(userId, productId) {
    const existing = await this.query
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing.data) {
      await this.deleteById(existing.data.id);
      return { favorited: false };
    }

    await this.create({ user_id: userId, product_id: productId });
    return { favorited: true };
  }
}

export default new WishlistModel();
