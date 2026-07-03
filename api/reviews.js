import supabase from './db-client.js';
import {
  setCORS, requireAuth, requireRole, getUser, getUserRole,
  sanitize, handleError, ok, created, badRequest, notFound,
} from './_helpers.js';

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Fetch approved reviews for a product ─────────────
    if (req.method === 'GET') {
      const { product_id } = req.query;
      if (!product_id) return badRequest(res, 'Product ID is required');

      const { data, error } = await supabase
        .from('reviews')
        .select('id, product_id, author, rating, title, body, helpful_count, created_at')
        .eq('product_id', sanitize(product_id))
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ok(res, data || []);
    }

    // ── POST: Create a review (authenticated) ──────────────────
    if (req.method === 'POST') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { product_id, rating, title, body } = req.body || {};
      if (!product_id || !rating || !title) {
        return badRequest(res, 'Product ID, rating, and title are required');
      }

      const ratingNum = Number(rating);
      if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return badRequest(res, 'Rating must be an integer between 1 and 5');
      }

      // Check for existing review by this user on this product
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', product_id)
        .eq('user_id', user.id)
        .single();

      if (existingReview) {
        return res.status(409).json({ error: 'You have already reviewed this product' });
      }

      // Get user name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert({
          product_id,
          user_id: user.id,
          author: sanitize(profile?.name || user.email?.split('@')[0]).slice(0, 100),
          rating: ratingNum,
          title: sanitize(title).slice(0, 200),
          body: body ? sanitize(body).slice(0, 2000) : '',
          is_approved: false,
        })
        .select()
        .single();

      if (insertError) return handleError(insertError, res, 'Reviews create');
      return created(res, data);
    }

    // ── PUT: Approve/update a review (admin only) ─────────────
    if (req.method === 'PUT') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { id, is_approved, helpful_count } = req.body || {};
      if (!id) return badRequest(res, 'Review ID is required');

      const updates = {};
      if (typeof is_approved === 'boolean') updates.is_approved = is_approved;
      if (Number.isInteger(helpful_count) && helpful_count >= 0) updates.helpful_count = helpful_count;

      const { data, error: updateError } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) return handleError(updateError, res, 'Reviews update');
      return ok(res, data);
    }

    // ── DELETE: Delete a review ───────────────────────────────
    if (req.method === 'DELETE') {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'Authentication required' });

      const { id } = req.body || {};
      if (!id) return badRequest(res, 'Review ID is required');

      const role = await getUserRole(user.id);

      // Users can delete their own reviews; admins can delete any
      const query = supabase.from('reviews').delete().eq('id', id);
      if (role !== 'admin') {
        query.eq('user_id', user.id);
      }

      const { error: deleteError } = await query;
      if (deleteError) throw deleteError;
      return ok(res, { ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Reviews');
  }
}
