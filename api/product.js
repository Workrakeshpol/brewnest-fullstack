import supabase from './db-client.js';
import { setCORS, sanitize, handleError, ok, badRequest, notFound } from './_helpers.js';

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    // ── GET: Fetch a single product by ID ────────────────────
    if (req.method === 'GET') {
      const { id } = req.query;
      if (!id) return badRequest(res, 'Product id is required');

      const safeId = sanitize(id);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', safeId)
        .single();

      if (error || !data) {
        return notFound(res, 'Product not found');
      }

      // Fetch related products in same category (parallel)
      const { data: related } = await supabase
        .from('products')
        .select('id, name, price, image, rating, review_count, category')
        .eq('category', data.category)
        .neq('id', safeId)
        .limit(3);

      return ok(res, { ...data, related: related || [] });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Product detail');
  }
}
