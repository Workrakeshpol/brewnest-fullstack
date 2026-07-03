/**
 * Menu / Product Validation Schemas
 */

export const createProductSchema = {
  name:             { type: 'string',  required: true, max: 200 },
  description:      { type: 'string',  required: true },
  long_description: { type: 'string',  required: false },
  price:            { type: 'number',  required: true, min: 0 },
  image:            { type: 'string',  required: false },
  category:         { type: 'string',  required: true },
  calories:         { type: 'integer', required: false, min: 0 },
  prep_time:        { type: 'string',  required: false },
  tags:             { type: 'array',   required: false },
  ingredients:      { type: 'array',   required: false },
  is_popular:       { type: 'boolean', required: false },
  is_new:           { type: 'boolean', required: false },
};

export const updateProductSchema = {
  name:             { type: 'string',  required: false, max: 200 },
  description:      { type: 'string',  required: false },
  long_description: { type: 'string',  required: false },
  price:            { type: 'number',  required: false, min: 0 },
  image:            { type: 'string',  required: false },
  category:         { type: 'string',  required: false },
  calories:         { type: 'integer', required: false, min: 0 },
  prep_time:        { type: 'string',  required: false },
  tags:             { type: 'array',   required: false },
  ingredients:      { type: 'array',   required: false },
  is_popular:       { type: 'boolean', required: false },
  is_new:           { type: 'boolean', required: false },
  is_active:        { type: 'boolean', required: false },
};

export const listProductsQuerySchema = {
  category: { type: 'string',  required: false },
  search:   { type: 'string',  required: false },
  sort:     { type: 'enum',    required: false, values: ['popular', 'price-low', 'price-high', 'rating', 'name-az', 'name-za'] },
  tags:     { type: 'string',  required: false },
  page:     { type: 'integer', required: false, min: 1 },
  limit:    { type: 'integer', required: false, min: 1, max: 100 },
};

export const createReviewSchema = {
  product_id: { type: 'string',  required: true },
  rating:     { type: 'integer', required: true, min: 1, max: 5 },
  title:      { type: 'string',  required: false, max: 200 },
  body:       { type: 'string',  required: false },
};

export default {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  createReviewSchema,
};
