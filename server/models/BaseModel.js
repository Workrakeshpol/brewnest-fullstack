/**
 * BaseModel — abstract base for all database models.
 * ─────────────────────────────────
 * Provides common CRUD operations using the Supabase query builder.
 * Subclasses define `tableName`, `schema`, and `relations`.
 *
 * This is infrastructure, not business logic.
 */

import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/index.js';

class BaseModel {
  /** @param {string} tableName */
  constructor(tableName) {
    this.tableName = tableName;
  }

  /** Direct access to the query builder for this table. */
  get query() {
    return supabaseAdmin.from(this.tableName);
  }

  /**
   * Find all rows with optional pagination.
   * @returns {Promise<{ data, total, page, limit, totalPages }>}
   */
  async findAll({ page = 1, limit = env.DEFAULT_PAGE_SIZE, select = '*', orderBy, ascending = true, filters = {} } = {}) {
    limit = Math.min(limit, env.MAX_PAGE_SIZE);
    const offset = (page - 1) * limit;

    let query = this.query.select(select, { count: 'exact' });

    // Apply filters: { column: value } or { column: { op: 'eq', value: x } }
    for (const [column, condition] of Object.entries(filters)) {
      if (typeof condition === 'object' && condition !== null) {
        query = query[condition.op || 'eq'](column, condition.value);
      } else {
        query = query.eq(column, condition);
      }
    }

    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  /** Find a single row by ID. */
  async findById(id, select = '*') {
    const { data, error } = await this.query
      .select(select)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw ApiError.notFound(`${this.tableName} not found`);
      throw error;
    }
    return data;
  }

  /** Find a single row by a custom column. */
  async findBy(column, value, select = '*') {
    const { data, error } = await this.query
      .select(select)
      .eq(column, value)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  /** Find multiple rows matching a column value. */
  async findMany(column, value, select = '*') {
    const { data, error } = await this.query
      .select(select)
      .eq(column, value);

    if (error) throw error;
    return data || [];
  }

  /** Insert a new row. */
  async create(payload, select = '*') {
    const { data, error } = await this.query
      .insert(payload)
      .select(select)
      .single();

    if (error) throw error;
    return data;
  }

  /** Insert multiple rows. */
  async createMany(payload, select = '*') {
    const { data, error } = await this.query
      .insert(payload)
      .select(select);

    if (error) throw error;
    return data;
  }

  /** Update a row by ID. */
  async updateById(id, updates, select = '*') {
    const { data, error } = await this.query
      .update(updates)
      .eq('id', id)
      .select(select)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw ApiError.notFound(`${this.tableName} not found`);
      throw error;
    }
    return data;
  }

  /** Delete a row by ID. */
  async deleteById(id) {
    const { error } = await this.query.delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  /** Count rows matching optional filters. */
  async count(filters = {}) {
    let query = this.query.select('*', { count: 'exact', head: true });
    for (const [column, value] of Object.entries(filters)) {
      query = query.eq(column, value);
    }
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }
}

export default BaseModel;
