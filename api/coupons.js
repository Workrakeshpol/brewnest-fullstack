import supabase from './db-client.js';
import {
  setCORS, requireRole, sanitize, whitelist, handleError,
  ok, created, badRequest, notFound,
} from './_helpers.js';

const COUPON_FIELDS = ['code', 'type', 'value', 'label', 'max_uses', 'expires_at', 'min_order', 'is_active'];

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Validate a coupon code (public) or list all (admin) ─
    if (req.method === 'GET') {
      const { code } = req.query;

      if (code) {
        // Public: validate a specific coupon — return only safe fields
        const { data, error } = await supabase
          .from('coupons')
          .select('code, type, value, label, min_order, max_uses, used_count, expires_at, is_active')
          .eq('code', code.toUpperCase().trim())
          .eq('is_active', true)
          .single();

        if (error || !data) {
          return notFound(res, 'Invalid coupon code');
        }

        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          return res.status(400).json({ error: 'Coupon has expired' });
        }

        if (data.max_uses && data.used_count >= data.max_uses) {
          return res.status(400).json({ error: 'Coupon usage limit reached' });
        }

        // Return only what the client needs (no internal IDs, no admin fields)
        return ok(res, {
          code: data.code,
          type: data.type,
          value: data.value,
          label: data.label,
          min_order: data.min_order || 0,
        });
      }

      // List all coupons (admin only)
      const { user, error: authError } = await requireRole(req, res, 'admin');
      if (authError) return;

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ok(res, data || []);
    }

    // ── POST: Create coupon (admin only) ────────────────────
    if (req.method === 'POST') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const body = req.body || {};
      if (!body.code || !body.type || body.value === undefined) {
        return badRequest(res, 'Code, type, and value are required');
      }
      if (!['percentage', 'fixed'].includes(body.type)) {
        return badRequest(res, 'Type must be "percentage" or "fixed"');
      }
      if (body.type === 'percentage' && (body.value < 0 || body.value > 100)) {
        return badRequest(res, 'Percentage value must be between 0 and 100');
      }

      const fields = whitelist(body, COUPON_FIELDS);
      fields.code = sanitize(fields.code).toUpperCase().slice(0, 20);
      fields.label = sanitize(fields.label || '').slice(0, 100);

      const { data, error: insertError } = await supabase
        .from('coupons')
        .insert(fields)
        .select()
        .single();

      if (insertError) return handleError(insertError, res, 'Coupons create');
      return created(res, data);
    }

    // ── PUT: Update coupon (admin only) ─────────────────────
    if (req.method === 'PUT') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { id, ...rest } = req.body || {};
      if (!id) return badRequest(res, 'Coupon ID is required');

      const updates = whitelist(rest, COUPON_FIELDS);
      if (updates.code) updates.code = sanitize(updates.code).toUpperCase().slice(0, 20);

      const { data, error: updateError } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) return handleError(updateError, res, 'Coupons update');
      return ok(res, data);
    }

    // ── DELETE: Delete coupon (admin only) ───────────────────
    if (req.method === 'DELETE') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { id } = req.body || {};
      if (!id) return badRequest(res, 'Coupon ID is required');

      const { error: deleteError } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (deleteError) return handleError(deleteError, res, 'Coupons delete');
      return ok(res, { ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Coupons');
  }
}
