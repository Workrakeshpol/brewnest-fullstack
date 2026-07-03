/**
 * Order Validation Schemas
 */

export const createOrderSchema = {
  items:           { type: 'array',   required: true, minItems: 1 },
  delivery_type:   { type: 'enum',    required: true, values: ['delivery', 'pickup'] },
  delivery_address:{ type: 'string',  required: false },
  pickup_location: { type: 'string',  required: false },
  customer_name:   { type: 'string',  required: true },
  customer_email:  { type: 'email',   required: true },
  customer_phone:  { type: 'string',  required: true },
  notes:           { type: 'string',  required: false },
  payment_method:  { type: 'enum',    required: false, values: ['card', 'cash', 'apple-pay'] },
  card_last4:      { type: 'string',  required: false },
  subtotal:        { type: 'number',  required: true, min: 0 },
  discount:        { type: 'number',  required: false, min: 0 },
  tax_amount:      { type: 'number',  required: true, min: 0 },
  delivery_fee:    { type: 'number',  required: false, min: 0 },
  total:           { type: 'number',  required: true, min: 0 },
  coupon_code:     { type: 'string',  required: false },
};

export const applyCouponSchema = {
  code: { type: 'string', required: true },
};

export default {
  createOrderSchema,
  applyCouponSchema,
};
