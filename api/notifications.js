import supabase from './db-client.js';
import {
  setCORS, requireAuth, requireRole, sanitize,
  handleError, ok, created, badRequest,
} from './_helpers.js';

const NOTIFICATION_TYPES = ['order', 'reservation', 'promo', 'system', 'review'];

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Fetch user's notifications ───────────────────────
    if (req.method === 'GET') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      return ok(res, data || []);
    }

    // ── POST: Create notification (admin only) ────────────────
    if (req.method === 'POST') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { user_id, type, title, message } = req.body || {};
      if (!user_id || !type || !title || !message) {
        return badRequest(res, 'user_id, type, title, and message are required');
      }
      if (!NOTIFICATION_TYPES.includes(type)) {
        return badRequest(res, `Type must be one of: ${NOTIFICATION_TYPES.join(', ')}`);
      }

      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id,
          type,
          title: sanitize(title).slice(0, 200),
          message: sanitize(message).slice(0, 1000),
          is_read: false,
        })
        .select()
        .single();

      if (insertError) return handleError(insertError, res, 'Notifications create');
      return created(res, data);
    }

    // ── PUT: Mark as read / mark all as read ──────────────────
    if (req.method === 'PUT') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { id, mark_all } = req.body || {};

      if (mark_all) {
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        if (updateError) throw updateError;
        return ok(res, { ok: true, message: 'All notifications marked as read' });
      }

      if (!id) return badRequest(res, 'Notification ID or mark_all is required');

      const { data, error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) return handleError(updateError, res, 'Notifications update');
      return ok(res, data);
    }

    // ── DELETE: Delete notification ───────────────────────────
    if (req.method === 'DELETE') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { id } = req.body || {};
      if (!id) return badRequest(res, 'Notification ID is required');

      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) return handleError(deleteError, res, 'Notifications delete');
      return ok(res, { ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Notifications');
  }
}
