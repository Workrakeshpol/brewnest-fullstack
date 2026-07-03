import supabase from './db-client.js';
import {
  setCORS, requireRole, whitelist, handleError,
  ok, created, badRequest,
} from './_helpers.js';

const INVENTORY_FIELDS = ['product_id', 'stock_quantity', 'low_stock_threshold', 'is_available', 'restock_date'];

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Fetch inventory ──────────────────────────────────
    if (req.method === 'GET') {
      const { product_id } = req.query;

      if (product_id) {
        // Public: return only availability status (not internal stock levels)
        const { data } = await supabase
          .from('inventory')
          .select('is_available')
          .eq('product_id', product_id)
          .single();

        return ok(res, {
          product_id,
          is_available: data?.is_available ?? true,
        });
      }

      // List all inventory (admin only)
      const { user, error: authError } = await requireRole(req, res, 'admin');
      if (authError) return;

      const { data, error } = await supabase
        .from('inventory')
        .select('*, products(name, image, category)')
        .order('product_id', { ascending: true });

      if (error) throw error;
      return ok(res, data || []);
    }

    // ── POST: Create/update inventory (admin only) ───────────
    if (req.method === 'POST') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const body = req.body || {};
      if (!body.product_id) return badRequest(res, 'Product ID is required');

      const fields = whitelist(body, INVENTORY_FIELDS);
      if (fields.stock_quantity !== undefined) {
        fields.stock_quantity = Math.max(0, Math.floor(Number(fields.stock_quantity) || 0));
      }
      if (fields.low_stock_threshold !== undefined) {
        fields.low_stock_threshold = Math.max(0, Math.floor(Number(fields.low_stock_threshold) || 0));
      }

      // Upsert
      const { data: existing } = await supabase
        .from('inventory')
        .select('id')
        .eq('product_id', fields.product_id)
        .single();

      if (existing) {
        const { data, error: updateError } = await supabase
          .from('inventory')
          .update({ ...fields, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (updateError) return handleError(updateError, res, 'Inventory upsert');
        return ok(res, data);
      }

      const { data, error: insertError } = await supabase
        .from('inventory')
        .insert({
          product_id: fields.product_id,
          stock_quantity: fields.stock_quantity ?? 0,
          low_stock_threshold: fields.low_stock_threshold ?? 10,
          is_available: fields.is_available ?? true,
        })
        .select()
        .single();

      if (insertError) return handleError(insertError, res, 'Inventory create');
      return created(res, data);
    }

    // ── PUT: Update inventory (admin only) ─────────────────────
    if (req.method === 'PUT') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { id, ...rest } = req.body || {};
      if (!id) return badRequest(res, 'Inventory ID is required');

      const updates = whitelist(rest, INVENTORY_FIELDS);
      delete updates.product_id; // don't allow changing product_id on update
      if (updates.stock_quantity !== undefined) {
        updates.stock_quantity = Math.max(0, Math.floor(Number(updates.stock_quantity) || 0));
      }
      if (updates.low_stock_threshold !== undefined) {
        updates.low_stock_threshold = Math.max(0, Math.floor(Number(updates.low_stock_threshold) || 0));
      }
      updates.updated_at = new Date().toISOString();

      const { data, error: updateError } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) return handleError(updateError, res, 'Inventory update');
      return ok(res, data);
    }

    // ── DELETE: Delete inventory entry (admin only) ────────────
    if (req.method === 'DELETE') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { id } = req.body || {};
      if (!id) return badRequest(res, 'Inventory ID is required');

      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (deleteError) return handleError(deleteError, res, 'Inventory delete');
      return ok(res, { ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Inventory');
  }
}
