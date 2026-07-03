/**
 * Coupon Model
 * ─────────────────────────────────
 * Table: coupons
 * Relationships: none (standalone lookup table)
 */

import BaseModel from './BaseModel.js';

class CouponModel extends BaseModel {
  constructor() {
    super('coupons');
  }

  static schema = {
    id:         { type: 'serial',  primary: true },
    code:       { type: 'text',    required: true, unique: true },
    type:       { type: 'text',    required: true }, // 'percentage' | 'fixed'
    value:      { type: 'numeric', required: true },
    label:      { type: 'text' },
    is_active:  { type: 'boolean', default: true },
    used_count: { type: 'integer', default: 0 },
    expires_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', default: 'now()' },
  };

  static relations = {};

  /** Find a coupon by code (case-insensitive). */
  async findByCode(code) {
    const { data, error } = this.query
      .select('*')
      .ilike('code', code)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
}

export default new CouponModel();
