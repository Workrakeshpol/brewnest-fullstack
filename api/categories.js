import supabase from './db-client.js';
import {
  setCORS, requireRole, sanitize, whitelist, handleError,
  ok, created, badRequest,
} from './_helpers.js';

const CATEGORY_FIELDS = ['label', 'icon', 'sort_order'];

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: List all categories ────────────────────────────
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return ok(res, data);
    }

    // ── POST: Create category (admin only) ──────────────────
    if (req.method === 'POST') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const body = req.body || {};
      if (!body.id || !body.label) {
        return badRequest(res, 'Category id and label are required');
      }

      const fields = whitelist(body, CATEGORY_FIELDS);
      fields.id = sanitize(body.id).toLowerCase().replace(/[^a-z0-9-]/g, '');
      fields.label = sanitize(fields.label).slice(0, 50);
      fields.icon = fields.icon || '🍽️';
      fields.sort_order = Number(fields.sort_order) || 0;

      const { data, error: insertError } = await supabase
        .from('categories')
        .insert({ id: fields.id, ...fields })
        .select()
        .single();

      if (insertError) return handleError(insertError, res, 'Categories create');
      return created(res, data);
    }

    // ── PUT: Update category (admin only) ────────────────────
    if (req.method === 'PUT') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { id, ...rest } = req.body || {};
      if (!id) return badRequest(res, 'Category id is required');

      const updates = whitelist(rest, CATEGORY_FIELDS);
      if (updates.label) updates.label = sanitize(updates.label).slice(0, 50);
      if (updates.icon) updates.icon = sanitize(updates.icon).slice(0, 10);
      if (updates.sort_order !== undefined) updates.sort_order = Number(updates.sort_order) || 0;

      const { data, error: updateError } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) return handleError(updateError, res, 'Categories update');
      return ok(res, data);
    }

    // ── DELETE: Delete category (admin only) ─────────────────
    if (req.method === 'DELETE') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { id } = req.body || {};
      if (!id) return badRequest(res, 'Category id is required');

      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) return handleError(deleteError, res, 'Categories delete');
      return ok(res, { ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Categories');
  }
}
