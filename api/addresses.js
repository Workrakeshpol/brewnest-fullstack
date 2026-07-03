import supabase from './db-client.js';
import {
  setCORS, requireAuth, sanitize, whitelist,
  handleError, ok, created, badRequest,
} from './_helpers.js';

const ADDRESS_FIELDS = ['label', 'address', 'city', 'zip', 'is_default'];
const MAX_ADDRESSES_PER_USER = 10;

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Fetch user's addresses ───────────────────────────
    if (req.method === 'GET') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { data, error: fetchError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      return ok(res, data || []);
    }

    // ── POST: Add address ─────────────────────────────────────
    if (req.method === 'POST') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const body = req.body || {};
      if (!body.label || !body.address || !body.city || !body.zip) {
        return badRequest(res, 'Label, address, city, and zip are required');
      }

      // Enforce max addresses per user
      const { count } = await supabase
        .from('addresses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if ((count || 0) >= MAX_ADDRESSES_PER_USER) {
        return badRequest(res, `Maximum of ${MAX_ADDRESSES_PER_USER} addresses allowed`);
      }

      const fields = whitelist(body, ADDRESS_FIELDS);
      fields.label = sanitize(fields.label).slice(0, 50);
      fields.address = sanitize(fields.address).slice(0, 300);
      fields.city = sanitize(fields.city).slice(0, 100);
      fields.zip = sanitize(fields.zip).slice(0, 20);
      fields.is_default = !!fields.is_default;

      // If setting as default, unset other defaults
      if (fields.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error: insertError } = await supabase
        .from('addresses')
        .insert({ user_id: user.id, ...fields })
        .select()
        .single();

      if (insertError) return handleError(insertError, res, 'Addresses create');
      return created(res, data);
    }

    // ── PUT: Update address ───────────────────────────────────
    if (req.method === 'PUT') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { id, ...rest } = req.body || {};
      if (!id) return badRequest(res, 'Address ID is required');

      const updates = whitelist(rest, ADDRESS_FIELDS);
      if (updates.label) updates.label = sanitize(updates.label).slice(0, 50);
      if (updates.address) updates.address = sanitize(updates.address).slice(0, 300);
      if (updates.city) updates.city = sanitize(updates.city).slice(0, 100);
      if (updates.zip) updates.zip = sanitize(updates.zip).slice(0, 20);

      // If setting as default, unset other defaults
      if (updates.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error: updateError } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // ensure ownership
        .select()
        .single();

      if (updateError) return handleError(updateError, res, 'Addresses update');
      return ok(res, data);
    }

    // ── DELETE: Delete address ────────────────────────────────
    if (req.method === 'DELETE') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { id } = req.body || {};
      if (!id) return badRequest(res, 'Address ID is required');

      const { error: deleteError } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // ensure ownership

      if (deleteError) return handleError(deleteError, res, 'Addresses delete');
      return ok(res, { ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Addresses');
  }
}
