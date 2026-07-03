import supabase from './db-client.js';
import {
  setCORS, requireAuth, rateLimit, sanitize, isPositiveInt,
  isNonNegativeNumber, handleError, ok, created, badRequest,
} from './_helpers.js';

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Fetch user's cart ────────────────────────────────
    if (req.method === 'GET') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { data, error: fetchError } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return ok(res, data || []);
    }

    // ── POST: Add item to cart ────────────────────────────────
    if (req.method === 'POST') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { product_id, quantity = 1 } = req.body || {};
      if (!product_id) return badRequest(res, 'Product ID is required');

      const qty = Number(quantity);
      if (!isPositiveInt(qty)) return badRequest(res, 'Quantity must be a positive integer');
      if (qty > 99) return badRequest(res, 'Maximum quantity per item is 99');

      // Check if already in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product_id)
        .single();

      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > 99) return badRequest(res, 'Maximum quantity per item is 99');

        const { data, error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQty })
          .eq('id', existing.id)
          .select('*, products(*)')
          .single();
        if (updateError) throw updateError;
        return ok(res, data);
      }

      const { data, error: insertError } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id, quantity: qty })
        .select('*, products(*)')
        .single();

      if (insertError) throw insertError;
      return created(res, data);
    }

    // ── PUT: Update cart item quantity ────────────────────────
    if (req.method === 'PUT') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { product_id, quantity } = req.body || {};
      if (!product_id) return badRequest(res, 'Product ID is required');

      const qty = Number(quantity);
      if (!Number.isInteger(qty) || qty < 0) {
        return badRequest(res, 'Quantity must be a non-negative integer');
      }

      if (qty === 0) {
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product_id);
        if (deleteError) throw deleteError;
        return ok(res, { ok: true, removed: true });
      }

      if (qty > 99) return badRequest(res, 'Maximum quantity per item is 99');

      const { data, error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: qty })
        .eq('user_id', user.id)
        .eq('product_id', product_id)
        .select('*, products(*)')
        .single();

      if (updateError) throw updateError;
      return ok(res, data);
    }

    // ── DELETE: Remove item from cart ─────────────────────────
    if (req.method === 'DELETE') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { product_id } = req.body || {};
      if (!product_id) return badRequest(res, 'Product ID is required');

      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product_id);

      if (deleteError) throw deleteError;
      return ok(res, { ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Cart');
  }
}
