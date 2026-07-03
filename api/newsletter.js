import supabase from './db-client.js';
import {
  setCORS, sanitize, isValidEmail, rateLimit,
  handleError, ok, created, badRequest,
} from './_helpers.js';

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Check subscription status ────────────────────────
    if (req.method === 'GET') {
      const email = sanitize(req.query.email || '').toLowerCase();
      if (!email) return badRequest(res, 'Email is required');
      if (!isValidEmail(email)) return badRequest(res, 'Invalid email format');

      const { data } = await supabase
        .from('newsletter_subscribers')
        .select('is_active')
        .eq('email', email)
        .single();

      return ok(res, { subscribed: !!data?.is_active });
    }

    // ── POST: Subscribe (public, rate-limited) ────────────────
    if (req.method === 'POST') {
      if (!rateLimit(req, res, { max: 5, windowMs: 60_000 })) return;

      const email = sanitize(req.body?.email || '').toLowerCase();
      if (!email) return badRequest(res, 'Email is required');
      if (!isValidEmail(email)) return badRequest(res, 'Invalid email format');

      // Check if already subscribed (use upsert to handle re-subscribes)
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, is_active')
        .eq('email', email)
        .single();

      if (existing?.is_active) {
        return ok(res, { message: 'Already subscribed', subscribed: true });
      }

      if (existing && !existing.is_active) {
        // Reactivate
        await supabase
          .from('newsletter_subscribers')
          .update({ is_active: true })
          .eq('id', existing.id);
        return created(res, { message: 'Successfully re-subscribed', subscribed: true });
      }

      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, is_active: true });

      if (error) {
        if (error.code === '23505') {
          return ok(res, { message: 'Already subscribed', subscribed: true });
        }
        return handleError(error, res, 'Newsletter subscribe');
      }

      return created(res, { message: 'Successfully subscribed to newsletter', subscribed: true });
    }

    // ── DELETE: Unsubscribe ────────────────────────────────────
    if (req.method === 'DELETE') {
      const email = sanitize(req.body?.email || '').toLowerCase();
      if (!email) return badRequest(res, 'Email is required');

      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: false })
        .eq('email', email);

      if (error) return handleError(error, res, 'Newsletter unsubscribe');
      return ok(res, { message: 'Unsubscribed successfully' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Newsletter');
  }
}
