/**
 * User / Profile Model
 * ─────────────────────────────────
 * Table: profiles
 * Relationships:
 *   - has many orders
 *   - has many cart_items
 *   - has many reviews
 *   - has many wishlists
 */

import BaseModel from './BaseModel.js';

class UserModel extends BaseModel {
  constructor() {
    super('profiles');
  }

  /** Schema definition (for documentation & validation). */
  static schema = {
    id:        { type: 'uuid',    primary: true },
    email:     { type: 'text',    required: true, unique: true },
    name:      { type: 'text' },
    avatar_url:{ type: 'text' },
    phone:     { type: 'text' },
    created_at:{ type: 'timestamptz', default: 'now()' },
  };

  /** Relationship definitions. */
  static relations = {
    orders:    { type: 'hasMany',  model: 'Order',   foreignKey: 'user_id' },
    cartItems: { type: 'hasMany',  model: 'CartItem',foreignKey: 'user_id' },
    reviews:   { type: 'hasMany',  model: 'Review',  foreignKey: 'user_id' },
    wishlist:  { type: 'hasMany',  model: 'Wishlist',foreignKey: 'user_id' },
    role:      { type: 'hasOne',   model: 'UserRole',foreignKey: 'user_id' },
  };

  /** Find profile by email. */
  async findByEmail(email) {
    return this.findBy('email', email);
  }
}

export default new UserModel();
