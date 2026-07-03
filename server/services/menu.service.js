/**
 * Menu / Product Service
 * ─────────────────────────────────
 * Business logic for product catalog operations.
 */

import ProductModel from '../models/product.model.js';
import ReviewModel from '../models/review.model.js';
import { ApiError } from '../utils/ApiError.js';

export const SORT_MAP = {
  popular:    { column: 'review_count', ascending: false },
  'price-low': { column: 'price',       ascending: true },
  'price-high':{ column: 'price',       ascending: false },
  rating:     { column: 'rating',       ascending: false },
  'name-az':   { column: 'name',        ascending: true },
  'name-za':   { column: 'name',        ascending: false },
};

class MenuService {
  /** List products with filtering, sorting, and pagination. */
  async listProducts({ category, search, sort, tags, page, limit }) {
    // TODO: Implement business logic
    // - Build Supabase query with filters
    // - Apply sort from SORT_MAP
    // - Apply pagination
    // - Return { data, total, page, limit, totalPages }
    throw new Error('menu.service.listProducts: not implemented');
  }

  /** Get a single product by ID, including reviews. */
  async getProduct(id) {
    // TODO: Implement business logic
    // - Fetch product via ProductModel.findById()
    // - Fetch related reviews
    // - Return combined object
    throw new Error('menu.service.getProduct: not implemented');
  }

  /** Create a new product (admin only). */
  async createProduct(payload) {
    // TODO: Implement business logic
    // - Validate payload
    // - Insert via ProductModel.create()
    throw new Error('menu.service.createProduct: not implemented');
  }

  /** Update an existing product (admin only). */
  async updateProduct(id, updates) {
    // TODO: Implement business logic
    // - Update via ProductModel.updateById()
    throw new Error('menu.service.updateProduct: not implemented');
  }

  /** Delete a product (admin only). */
  async deleteProduct(id) {
    // TODO: Implement business logic
    // - Soft delete or hard delete via ProductModel
    throw new Error('menu.service.deleteProduct: not implemented');
  }

  /** Get reviews for a product. */
  async getProductReviews(productId, { page, limit }) {
    // TODO: Implement business logic
    throw new Error('menu.service.getProductReviews: not implemented');
  }

  /** Create a review for a product. */
  async createReview(userId, payload) {
    // TODO: Implement business logic
    // - Verify product exists
    // - Insert review
    // - Update product rating + review_count
    throw new Error('menu.service.createReview: not implemented');
  }
}

export default new MenuService();
