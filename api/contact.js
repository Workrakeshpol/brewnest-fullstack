import supabase from './db-client.js';
import {
  setCORS, requireRole, sanitize, isValidEmail, rateLimit,
  handleError, ok, created, badRequest,
} from './_helpers.js';

const MESSAGE_STATUSES = ['unread', 'read', 'archived'];

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Fetch contact messages (admin only) ──────────────
    if (req.method === 'GET') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { data, error: fetchError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return ok(res, data || []);
    }

    // ── POST: Submit a contact message (public, rate-limited) ─
    if (req.method === 'POST') {
      if (!rateLimit(req, res, { max: 5, windowMs: 60_000 })) return;

      const { name, email, subject, message } = req.body || {};

      if (!name || !email || !message) {
        return badRequest(res, 'Name, email, and message are required');
      }
      if (!isValidEmail(email)) {
        return badRequest(res, 'Invalid email format');
      }

      const { data, error } = await supabase
        .from('contact_messages')
        .insert({
          name: sanitize(name).slice(0, 100),
          email: sanitize(email).toLowerCase().slice(0, 254),
          subject: sanitize(subject || 'No subject').slice(0, 200),
          message: sanitize(message).slice(0, 5000),
          status: 'unread',
        })
        .select()
        .single();

      if (error) return handleError(error, res, 'Contact create');
      return created(res, { message: 'Message sent successfully', id: data.id });
    }

    // ── PUT: Update message status (admin) ───────────────────
    if (req.method === 'PUT') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { id, status } = req.body || {};
      if (!id) return badRequest(res, 'ID is required');
      if (!status || !MESSAGE_STATUSES.includes(status)) {
        return badRequest(res, `Status must be one of: ${MESSAGE_STATUSES.join(', ')}`);
      }

      const { data, error: updateError } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (updateError) return handleError(updateError, res, 'Contact update');
      return ok(res, data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Contact');
  }
}
