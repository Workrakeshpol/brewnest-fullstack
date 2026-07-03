/**
 * Cart Validation Schemas
 */

export const addToCartSchema = {
  product_id: { type: 'string',  required: true },
  quantity:   { type: 'integer', required: false, min: 1, max: 99 },
};

export const updateCartSchema = {
  product_id: { type: 'string',  required: true },
  quantity:   { type: 'integer', required: true, min: 0, max: 99 },
};

export const removeFromCartSchema = {
  product_id: { type: 'string', required: true },
};

export default {
  addToCartSchema,
  updateCartSchema,
  removeFromCartSchema,
};
