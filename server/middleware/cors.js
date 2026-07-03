/**
 * CORS Middleware
 * ─────────────────────────────────
 * Sets permissive CORS headers for all API responses.
 * Handles OPTIONS preflight by returning 204.
 *
 * @returns {boolean} true if the request was a preflight (caller should return)
 */
export function corsMiddleware(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24h preflight cache

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export default corsMiddleware;
