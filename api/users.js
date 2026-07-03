import supabase from './db-client.js';
import {
  setCORS, requireRole, handleError, ok, badRequest,
} from './_helpers.js';

const VALID_ROLES = ['admin', 'manager', 'barista', 'customer'];

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: List all users with roles (admin only) ───────────
    if (req.method === 'GET') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      // Fetch profiles and roles in parallel
      const [profilesResult, rolesResult] = await Promise.all([
        supabase.from('profiles')
          .select('id, email, name, avatar_url, phone, created_at')
          .order('created_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
      ]);

      if (profilesResult.error) throw profilesResult.error;

      const roleMap = {};
      (rolesResult.data || []).forEach(r => { roleMap[r.user_id] = r.role; });

      // Get order counts per user via a single query (not fetching all orders)
      const { data: orderStats } = await supabase
        .from('orders')
        .select('user_id, total');

      const orderStatsMap = {};
      (orderStats || []).forEach(o => {
        if (!orderStatsMap[o.user_id]) orderStatsMap[o.user_id] = { orders: 0, spent: 0 };
        orderStatsMap[o.user_id].orders++;
        orderStatsMap[o.user_id].spent += parseFloat(o.total || 0);
      });

      const users = (profilesResult.data || []).map(p => ({
        id: p.id,
        name: p.name || 'Unknown',
        email: p.email,
        phone: p.phone,
        avatar: p.avatar_url || (p.name ? p.name.charAt(0).toUpperCase() : '?'),
        role: roleMap[p.id] || 'customer',
        status: 'active',
        joined: p.created_at
          ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : 'Unknown',
        totalOrders: orderStatsMap[p.id]?.orders || 0,
        totalSpent: parseFloat((orderStatsMap[p.id]?.spent || 0).toFixed(2)),
      }));

      return ok(res, users);
    }

    // ── PUT: Update user role (admin only) ────────────────────
    if (req.method === 'PUT') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { id, role } = req.body || {};
      if (!id) return badRequest(res, 'User ID is required');
      if (!role || !VALID_ROLES.includes(role)) {
        return badRequest(res, `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`);
      }
      if (id === user.id && role !== 'admin') {
        return badRequest(res, 'Cannot change your own role from admin');
      }

      // Upsert role
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', id)
        .single();

      if (existing) {
        const { data, error: updateError } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', id)
          .select()
          .single();
        if (updateError) throw updateError;
        return ok(res, data);
      }

      const { data, error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: id, role })
        .select()
        .single();
      if (insertError) throw insertError;
      return ok(res, data);
    }

    // ── DELETE: Delete user (admin only) ──────────────────────
    if (req.method === 'DELETE') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const { id } = req.body || {};
      if (!id) return badRequest(res, 'User ID is required');
      if (id === user.id) return badRequest(res, 'Cannot delete your own account');

      // Delete related data in parallel
      await Promise.all([
        supabase.from('user_roles').delete().eq('user_id', id),
        supabase.from('addresses').delete().eq('user_id', id),
        supabase.from('notifications').delete().eq('user_id', id),
        supabase.from('wishlist_items').delete().eq('user_id', id),
        supabase.from('cart_items').delete().eq('user_id', id),
      ]);

      // Delete profile
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Also delete from auth.users via admin API
      await supabase.auth.admin.deleteUser(id);

      return ok(res, { ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Users');
  }
}
