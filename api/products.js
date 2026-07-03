import supabase from './db-client.js';
import {
  setCORS, requireRole, rateLimit, sanitize, sanitizeSearch,
  whitelist, parsePagination, handleError, ok, created, badRequest,
} from './_helpers.js';

const PRODUCT_FIELDS = [
  'name', 'description', 'long_description', 'price', 'image',
  'category', 'rating', 'review_count', 'calories', 'prep_time',
  'tags', 'ingredients', 'is_popular', 'is_new',
];

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: List products with filters ─────────────────────
    if (req.method === 'GET') {
      const { category, search, sort = 'popular', tags } = req.query;
      const { page, limit, offset } = parsePagination(req.query);

      let query = supabase.from('products').select('*', { count: 'exact' });

      if (category && category !== 'all') {
        query = query.eq('category', sanitize(category));
      }

      if (search) {
        const safeSearch = sanitizeSearch(search);
        if (safeSearch) {
          query = query.or(`name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
        }
      }

      if (tags) {
        const tagArray = tags.split(',').map(sanitize).filter(Boolean).slice(0, 10);
        tagArray.forEach((tag) => {
          query = query.contains('tags', [tag]);
        });
      }

      switch (sort) {
        case 'price-low': query = query.order('price', { ascending: true }); break;
        case 'price-high': query = query.order('price', { ascending: false }); break;
        case 'rating': query = query.order('rating', { ascending: false }); break;
        case 'name-az': query = query.order('name', { ascending: true }); break;
        case 'name-za': query = query.order('name', { ascending: false }); break;
        case 'popular':
        default: query = query.order('review_count', { ascending: false }); break;
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;
      return ok(res, {
        items: data,
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      });
    }

    // ── POST: Create product (admin only) ────────────────────
    if (req.method === 'POST') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const body = req.body || {};
      if (!body.name || !body.price || !body.category) {
        return badRequest(res, 'Name, price, and category are required');
      }

      const fields = whitelist(body, PRODUCT_FIELDS);
      fields.name = sanitize(fields.name);
      fields.description = sanitize(fields.description);
      fields.long_description = sanitize(fields.long_description);
      fields.image = fields.image || '/images/beans.jpg';
      fields.tags = Array.isArray(fields.tags) ? fields.tags.slice(0, 20) : [];
      fields.ingredients = Array.isArray(fields.ingredients) ? fields.ingredients.slice(0, 30) : [];

      const { data, error: insertError } = await supabase
        .from('products')
        .insert(fields)
        .select()
        .single();

      if (insertError) return handleError(insertError, res, 'Products create');
      return created(res, data);
    }

    // ── PUT: Update product (admin only) ─────────────────────
    if (req.method === 'PUT') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { id, ...rest } = req.body || {};
      if (!id) return badRequest(res, 'Product id is required');

      const updates = whitelist(rest, PRODUCT_FIELDS);
      if (updates.name) updates.name = sanitize(updates.name);
      if (updates.description) updates.description = sanitize(updates.description);
      if (updates.long_description) updates.long_description = sanitize(updates.long_description);

      const { data, error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) return handleError(updateError, res, 'Products update');
      return ok(res, data);
    }

    // ── DELETE: Delete product (admin only) ──────────────────
    if (req.method === 'DELETE') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { id } = req.body || {};
      if (!id) return badRequest(res, 'Product id is required');

      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) return handleError(deleteError, res, 'Products delete');
      return ok(res, { ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Products');
  }
}
