import supabase from './db-client.js';
import {
  setCORS, requireAuth, getUserRole, sanitize, isValidEmail, isValidPhone,
  isValidDate, isPositiveInt, rateLimit,
  handleError, ok, created, badRequest,
} from './_helpers.js';

const RESERVATION_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'];
const LOCATIONS = ['maple', 'riverside', 'eastside'];

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Fetch reservations (authenticated, own only) ─────
    if (req.method === 'GET') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return ok(res, data || []);
    }

    // ── POST: Create a reservation (public, rate-limited) ────
    if (req.method === 'POST') {
      if (!rateLimit(req, res, { max: 5, windowMs: 60_000 })) return;

      const body = req.body || {};
      const { name, email, phone, date, time, party_size, location, notes } = body;

      if (!name || !email || !date || !time || !party_size) {
        return badRequest(res, 'Name, email, date, time, and party size are required');
      }
      if (!isValidEmail(email)) {
        return badRequest(res, 'Invalid email format');
      }
      if (phone && !isValidPhone(phone)) {
        return badRequest(res, 'Invalid phone number format');
      }
      if (!isValidDate(date, false)) {
        return badRequest(res, 'Date must be today or a future date');
      }
      const partyNum = Number(party_size);
      if (!isPositiveInt(partyNum) || partyNum > 20) {
        return badRequest(res, 'Party size must be between 1 and 20');
      }
      const loc = LOCATIONS.includes(location) ? location : 'maple';

      // Check for slot availability (max 5 concurrent reservations)
      const { data: existing } = await supabase
        .from('reservations')
        .select('id')
        .eq('date', date)
        .eq('time', time)
        .eq('location', loc)
        .eq('status', 'confirmed');

      if (existing && existing.length >= 5) {
        return res.status(409).json({ error: 'That time slot is fully booked. Please choose another time.' });
      }

      // Try to attach user_id if authenticated
      const token = req.headers.authorization?.replace('Bearer ', '');
      let userId = null;
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      }

      const { data, error } = await supabase
        .from('reservations')
        .insert({
          user_id: userId,
          name: sanitize(name).slice(0, 100),
          email: sanitize(email).toLowerCase(),
          phone: phone ? sanitize(phone) : null,
          date,
          time: sanitize(time).slice(0, 10),
          party_size: partyNum,
          location: loc,
          notes: notes ? sanitize(notes).slice(0, 500) : null,
          status: 'confirmed',
        })
        .select()
        .single();

      if (error) return handleError(error, res, 'Reservations create');
      return created(res, data);
    }

    // ── PUT: Update reservation status (admin or owner) ──────
    if (req.method === 'PUT') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { id, status } = req.body || {};
      if (!id) return badRequest(res, 'Reservation ID is required');
      if (!status || !RESERVATION_STATUSES.includes(status)) {
        return badRequest(res, `Status must be one of: ${RESERVATION_STATUSES.join(', ')}`);
      }

      // Check ownership or admin
      const role = await getUserRole(user.id);
      const query = supabase.from('reservations').update({ status }).eq('id', id);
      if (role !== 'admin') {
        query.eq('user_id', user.id);
      }

      const { data, error: updateError } = await query.select().single();
      if (updateError) return handleError(updateError, res, 'Reservations update');
      return ok(res, data);
    }

    // ── DELETE: Cancel reservation ────────────────────────────
    if (req.method === 'DELETE') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { id } = req.body || {};
      if (!id) return badRequest(res, 'Reservation ID is required');

      const role = await getUserRole(user.id);
      const query = supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (role !== 'admin') {
        query.eq('user_id', user.id);
      }

      const { error: updateError } = await query;
      if (updateError) throw updateError;
      return ok(res, { ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Reservations');
  }
}
