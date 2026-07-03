import supabase from './db-client.js';
import {
  setCORS, requireAuth, sanitize, handleError, ok, created, badRequest,
} from './_helpers.js';

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Fetch user's wishlist ────────────────────────────
    if (req.method === 'GET') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { data, error: fetchError } = await supabase
        .from('wishlist_items')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return ok(res, data || []);
    }

    // ── POST: Add to wishlist ────────────────────────────────
    if (req.method === 'POST') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { product_id } = req.body || {};
      if (!product_id) return badRequest(res, 'Product ID is required');

      const { data, error: insertError } = await supabase
        .from('wishlist_items')
        .insert({ user_id: user.id, product_id })
        .select('*, products(*)')
        .single();

      if (insertError) {
        // 23505 = unique constraint violation (already in wishlist)
        if (insertError.code === '23505') {
          return ok(res, { message: 'Already in wishlist' });
        }
        throw insertError;
      }
      return created(res, data);
    }

    // ── DELETE: Remove from wishlist ─────────────────────────
    if (req.method === 'DELETE') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { product_id } = req.body || {};
      if (!product_id) return badRequest(res, 'Product ID is required');

      const { error: deleteError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product_id);

      if (deleteError) throw deleteError;
      return ok(res, { ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Wishlist');
  }
}
