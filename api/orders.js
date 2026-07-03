import supabase from './db-client.js';
import {
  setCORS, requireAuth, rateLimit, sanitize, isNonNegativeNumber,
  isPositiveInt, handleError, ok, created, badRequest,
} from './_helpers.js';

const ORDER_STATUS = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Fetch user's orders ──────────────────────────────
    if (req.method === 'GET') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return ok(res, data || []);
    }

    // ── POST: Create a new order ──────────────────────────────
    if (req.method === 'POST') {
      const { user, error } = await requireAuth(req, res);
      if (error) return;

      if (!rateLimit(req, res, { max: 10, windowMs: 60_000 })) return;

      const body = req.body || {};
      const {
        items: cartItems,
        delivery_type = 'pickup',
        delivery_address,
        pickup_location,
        customer_name,
        customer_email,
        customer_phone,
        notes,
        payment_method = 'card',
        card_last4,
        subtotal,
        discount = 0,
        tax_amount,
        delivery_fee = 0,
        total,
        coupon_code,
      } = body;

      // ── Validate ────────────────────────────────────────────
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return badRequest(res, 'Cart is empty');
      }
      if (cartItems.length > 50) {
        return badRequest(res, 'Too many items in cart (max 50)');
      }
      if (!['delivery', 'pickup'].includes(delivery_type)) {
        return badRequest(res, 'Invalid delivery type');
      }

      // Validate each cart item
      for (const item of cartItems) {
        if (!item.id || !item.name || !isNonNegativeNumber(item.price) || !isPositiveInt(item.quantity)) {
          return badRequest(res, 'Invalid cart item data');
        }
      }

      // Validate monetary values
      if (!isNonNegativeNumber(subtotal) || !isNonNegativeNumber(total)) {
        return badRequest(res, 'Invalid order totals');
      }

      const orderNumber = 'BN-' + Date.now().toString(36).toUpperCase().slice(-8);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          delivery_type,
          delivery_address: delivery_address ? sanitize(delivery_address) : null,
          pickup_location: pickup_location || null,
          customer_name: sanitize(customer_name),
          customer_email: sanitize(customer_email || ''),
          customer_phone: sanitize(customer_phone),
          notes: notes ? sanitize(notes) : null,
          payment_method,
          card_last4: card_last4 || null,
          subtotal,
          discount,
          tax_amount: tax_amount || 0,
          delivery_fee,
          total,
          coupon_code: coupon_code || null,
          status: 'confirmed',
        })
        .select()
        .single();

      if (orderError) return handleError(orderError, res, 'Orders create');

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: sanitize(item.name),
        product_image: item.image || null,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) return handleError(itemsError, res, 'Order items');

      // Clear the user's cart
      await supabase.from('cart_items').delete().eq('user_id', user.id);

      // Increment coupon usage count (fetch-then-update, since supabase.raw doesn't exist)
      if (coupon_code) {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('used_count')
          .eq('code', coupon_code.toUpperCase())
          .single();

        if (coupon) {
          await supabase
            .from('coupons')
            .update({ used_count: (coupon.used_count || 0) + 1 })
            .eq('code', coupon_code.toUpperCase());
        }
      }

      return created(res, { ...order, order_items: orderItems });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Orders');
  }
}
