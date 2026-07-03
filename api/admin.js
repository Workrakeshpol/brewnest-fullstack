import supabase from './db-client.js';
import {
  setCORS, requireRole, handleError, ok, badRequest,
} from './_helpers.js';

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
const RESERVATION_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'];
const MESSAGE_STATUSES = ['unread', 'read', 'archived'];

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Dashboard data (admin only) ──────────────────────
    if (req.method === 'GET') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const resource = req.query.resource || 'stats';

      // ── Overview stats (using count-only queries) ───────────
      if (resource === 'stats') {
        const [products, orders, reviews, reservations, contacts, coupons, newsletter] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('total, status', { count: 'exact' }),
          supabase.from('reviews').select('id', { count: 'exact', head: true }),
          supabase.from('reservations').select('id', { count: 'exact', head: true }),
          supabase.from('contact_messages').select('status'),
          supabase.from('coupons').select('id', { count: 'exact', head: true }),
          supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
        ]);

        const totalRevenue = orders.data?.reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0;
        const pendingOrders = orders.data?.filter((o) => o.status === 'pending' || o.status === 'confirmed').length || 0;
        const unreadMessages = contacts.data?.filter((c) => c.status === 'unread').length || 0;

        return ok(res, {
          products: products.count || 0,
          orders: orders.count || 0,
          reviews: reviews.count || 0,
          reservations: reservations.count || 0,
          coupons: coupons.count || 0,
          newsletterSubscribers: newsletter.count || 0,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          pendingOrders,
          unreadMessages,
        });
      }

      // ── All orders (paginated) ──────────────────────────────
      if (resource === 'orders') {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
        const offset = (page - 1) * limit;

        const { data, error: fetchError, count } = await supabase
          .from('orders')
          .select('*, order_items(*)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (fetchError) throw fetchError;
        return ok(res, { items: data || [], total: count || 0, page, limit });
      }

      // ── All reservations (paginated) ────────────────────────
      if (resource === 'reservations') {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
        const offset = (page - 1) * limit;

        const { data, error: fetchError, count } = await supabase
          .from('reservations')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (fetchError) throw fetchError;
        return ok(res, { items: data || [], total: count || 0, page, limit });
      }

      // ── All contact messages (paginated) ────────────────────
      if (resource === 'messages') {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
        const offset = (page - 1) * limit;

        const { data, error: fetchError, count } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (fetchError) throw fetchError;
        return ok(res, { items: data || [], total: count || 0, page, limit });
      }

      // ── All reviews (paginated) ─────────────────────────────
      if (resource === 'reviews') {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
        const offset = (page - 1) * limit;

        const { data, error: fetchError, count } = await supabase
          .from('reviews')
          .select('*, products(name)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (fetchError) throw fetchError;
        return ok(res, { items: data || [], total: count || 0, page, limit });
      }

      return badRequest(res, 'Unknown resource. Use ?resource=stats|orders|reservations|messages|reviews');
    }

    // ── PUT: Update resource status (admin only) ─────────────
    if (req.method === 'PUT') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { resource, id, status } = req.body || {};
      if (!resource || !id || !status) {
        return badRequest(res, 'Resource, id, and status are required');
      }

      let tableName, validStatuses;
      if (resource === 'order') { tableName = 'orders'; validStatuses = ORDER_STATUSES; }
      else if (resource === 'reservation') { tableName = 'reservations'; validStatuses = RESERVATION_STATUSES; }
      else if (resource === 'message') { tableName = 'contact_messages'; validStatuses = MESSAGE_STATUSES; }
      else return badRequest(res, 'Unknown resource for update');

      if (!validStatuses.includes(status)) {
        return badRequest(res, `Status must be one of: ${validStatuses.join(', ')}`);
      }

      const { data, error: updateError } = await supabase
        .from(tableName)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (updateError) return handleError(updateError, res, 'Admin update');
      return ok(res, data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Admin');
  }
}
