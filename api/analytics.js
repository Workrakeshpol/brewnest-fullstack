import supabase from './db-client.js';
import {
  setCORS, requireRole, parsePagination,
  handleError, ok, badRequest,
} from './_helpers.js';

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Analytics data (admin only) ──────────────────────
    if (req.method === 'GET') {
      const { user, error } = await requireRole(req, res, 'admin');
      if (error) return;

      const type = req.query.type || 'overview';

      // ── Overview analytics ─────────────────────────────────
      if (type === 'overview') {
        // Use count-only and aggregate queries to avoid fetching full tables
        const [ordersAgg, ordersCount, products, reservations, reviews, contacts, newsletter, coupons] = await Promise.all([
          // Get sum and counts via a single query with only needed columns
          supabase.from('orders').select('total, status, delivery_type'),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('reservations').select('status, party_size'),
          supabase.from('reviews').select('rating, is_approved'),
          supabase.from('contact_messages').select('status'),
          supabase.from('newsletter_subscribers').select('is_active'),
          supabase.from('coupons').select('is_active'),
        ]);

        const orders = ordersAgg.data || [];
        const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        const pendingOrders = orders.filter(o => o.status === 'processing' || o.status === 'pending').length;
        const deliveryOrders = orders.filter(o => o.delivery_type === 'delivery').length;
        const pickupOrders = orders.filter(o => o.delivery_type === 'pickup').length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const resData = reservations.data || [];
        const reviewsData = reviews.data || [];
        const contactsData = contacts.data || [];
        const newsletterData = newsletter.data || [];
        const couponsData = coupons.data || [];

        return ok(res, {
          revenue: { total: parseFloat(totalRevenue.toFixed(2)), avgOrder: parseFloat(avgOrderValue.toFixed(2)) },
          orders: { total: totalOrders, completed: completedOrders, pending: pendingOrders, delivery: deliveryOrders, pickup: pickupOrders },
          reservations: {
            total: resData.length,
            confirmed: resData.filter(r => r.status === 'confirmed').length,
            totalGuests: resData.reduce((s, r) => s + (r.party_size || 0), 0),
          },
          reviews: {
            total: reviewsData.length,
            avgRating: reviewsData.length > 0
              ? parseFloat((reviewsData.reduce((s, r) => s + r.rating, 0) / reviewsData.length).toFixed(1))
              : 0,
            pending: reviewsData.filter(r => !r.is_approved).length,
          },
          messages: { total: contactsData.length, unread: contactsData.filter(c => c.status === 'unread').length },
          newsletter: { total: newsletterData.length, active: newsletterData.filter(n => n.is_active).length },
          coupons: { total: couponsData.length, active: couponsData.filter(c => c.is_active).length },
          products: { total: products.count || 0 },
        });
      }

      // ── Revenue chart (monthly) ────────────────────────────
      if (type === 'revenue') {
        // Only fetch needed columns, limit to last 12 months of data
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const { data: ordersData } = await supabase
          .from('orders')
          .select('total, created_at')
          .neq('status', 'cancelled')
          .gte('created_at', twelveMonthsAgo.toISOString())
          .order('created_at', { ascending: true });

        const monthlyData = {};
        (ordersData || []).forEach(o => {
          const d = new Date(o.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[key]) monthlyData[key] = { revenue: 0, orders: 0 };
          monthlyData[key].revenue += parseFloat(o.total || 0);
          monthlyData[key].orders += 1;
        });

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartData = Object.entries(monthlyData).map(([key, val]) => {
          const [year, month] = key.split('-');
          return {
            month: monthNames[parseInt(month) - 1] + ' ' + year.slice(2),
            revenue: parseFloat(val.revenue.toFixed(2)),
            orders: val.orders,
          };
        });

        return ok(res, chartData);
      }

      // ── Category revenue ───────────────────────────────────
      if (type === 'categories') {
        // Fetch only needed columns from order_items
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('quantity, price, products(category)');

        const categoryRevenue = {};
        (orderItems || []).forEach(oi => {
          const cat = oi.products?.category || 'unknown';
          const rev = (oi.quantity || 0) * parseFloat(oi.price || 0);
          if (!categoryRevenue[cat]) categoryRevenue[cat] = 0;
          categoryRevenue[cat] += rev;
        });

        const colors = ['#c4861f', '#dfa738', '#5e7c53', '#7d6140', '#b89e78', '#9c7d54', '#e7be5d', '#a36618', '#4a6342', '#322519'];
        const chartData = Object.entries(categoryRevenue).map(([name, value], i) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
          value: parseFloat(value.toFixed(2)),
          color: colors[i % colors.length],
        }));

        return ok(res, chartData);
      }

      // ── Top products ───────────────────────────────────────
      if (type === 'top-products') {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_id, product_name, quantity, price');

        const productStats = {};
        (orderItems || []).forEach(oi => {
          if (!productStats[oi.product_id]) {
            productStats[oi.product_id] = { name: oi.product_name, sold: 0, revenue: 0 };
          }
          productStats[oi.product_id].sold += oi.quantity;
          productStats[oi.product_id].revenue += oi.quantity * parseFloat(oi.price || 0);
        });

        const topProducts = Object.entries(productStats)
          .map(([id, stats]) => ({ id, ...stats, revenue: parseFloat(stats.revenue.toFixed(2)) }))
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 10);

        return ok(res, topProducts);
      }

      // ── Reports (summary) ──────────────────────────────────
      if (type === 'reports') {
        const [orders, reservations, reviews, contacts, newsletter] = await Promise.all([
          supabase.from('orders').select('total, status, delivery_type, payment_method'),
          supabase.from('reservations').select('status, party_size, location'),
          supabase.from('reviews').select('rating, is_approved'),
          supabase.from('contact_messages').select('status'),
          supabase.from('newsletter_subscribers').select('is_active'),
        ]);

        const ordersData = orders.data || [];
        const totalRevenue = ordersData.reduce((s, o) => s + parseFloat(o.total || 0), 0);
        const totalOrders = ordersData.length;

        const reservationsByLocation = {};
        (reservations.data || []).forEach(r => {
          const loc = r.location || 'unknown';
          reservationsByLocation[loc] = (reservationsByLocation[loc] || 0) + 1;
        });

        const reviewsData = reviews.data || [];
        const avgRating = reviewsData.length > 0
          ? reviewsData.reduce((s, r) => s + r.rating, 0) / reviewsData.length : 0;

        return ok(res, {
          summary: {
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            totalOrders,
            avgOrderValue: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0,
            completedOrders: ordersData.filter(o => o.status === 'completed').length,
            cancelledOrders: ordersData.filter(o => o.status === 'cancelled').length,
            deliveryOrders: ordersData.filter(o => o.delivery_type === 'delivery').length,
            pickupOrders: ordersData.filter(o => o.delivery_type === 'pickup').length,
            totalReservations: reservations.data?.length || 0,
            totalGuests: reservations.data?.reduce((s, r) => s + (r.party_size || 0), 0) || 0,
            avgRating: parseFloat(avgRating.toFixed(1)),
            totalReviews: reviewsData.length,
            pendingReviews: reviewsData.filter(r => !r.is_approved).length,
            unreadMessages: contacts.data?.filter(c => c.status === 'unread').length || 0,
            activeSubscribers: newsletter.data?.filter(n => n.is_active).length || 0,
          },
          paymentMethods: {
            card: ordersData.filter(o => o.payment_method === 'card').length,
            cash: ordersData.filter(o => o.payment_method === 'cash').length,
            applePay: ordersData.filter(o => o.payment_method === 'apple-pay').length,
          },
          reservationsByLocation,
          orderStatus: {
            completed: ordersData.filter(o => o.status === 'completed').length,
            processing: ordersData.filter(o => o.status === 'processing').length,
            pending: ordersData.filter(o => o.status === 'pending').length,
            cancelled: ordersData.filter(o => o.status === 'cancelled').length,
          },
        });
      }

      return badRequest(res, 'Unknown type. Use ?type=overview|revenue|categories|top-products|reports');
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Analytics');
  }
}
