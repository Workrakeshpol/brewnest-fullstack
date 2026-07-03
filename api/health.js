/**
 * Health Check API
 * GET /api/health — returns server status and timestamp.
 */
import { setCORS, ok } from './_helpers.js';

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  if (req.method === 'GET') {
    return ok(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime ? Math.round(process.uptime()) : null,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
