/**
 * Order Model
 * ─────────────────────────────────
 * Table: orders
 * Relationships:
 *   - belongs to user
 *   - has many order_items
 */

import BaseModel from './BaseModel.js';

class OrderModel extends BaseModel {
  constructor() {
    super('orders');
  }

  static schema = {
    id:              { type: 'serial',  primary: true },
    user_id:         { type: 'uuid',    required: true, index: true },
    order_number:    { type: 'text',    unique: true },
    status:          { type: 'text',    default: 'pending' },
    delivery_type:   { type: 'text' },
    delivery_address:{ type: 'text' },
    pickup_location: { type: 'text' },
    customer_name:   { type: 'text' },
    customer_email:  { type: 'text' },
    customer_phone:  { type: 'text' },
    notes:           { type: 'text' },
    payment_method:  { type: 'text',    default: 'card' },
    card_last4:      { type: 'text' },
    subtotal:        { type: 'numeric', required: true },
    discount:        { type: 'numeric', default: 0 },
    tax_amount:      { type: 'numeric', required: true },
    delivery_fee:    { type: 'numeric', default: 0 },
    total:           { type: 'numeric', required: true },
    coupon_code:     { type: 'text' },
    created_at:      { type: 'timestamptz', default: 'now()' },
  };

  static relations = {
    user:       { type: 'belongsTo', model: 'User',      foreignKey: 'user_id' },
    orderItems: { type: 'hasMany',   model: 'OrderItem',  foreignKey: 'order_id' },
  };

  /** Find orders for a user, including order items. */
  async findByUser(userId) {
    const { data, error } = this.query
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export default new OrderModel();
