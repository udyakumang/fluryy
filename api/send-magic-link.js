// /api/send-magic-link.js (Node.js serverless, CommonJS)
const { createClient } = require('@supabase/supabase-js');

// --- Helpers ---
function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  return req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || '0.0.0.0';
}

async function incrAndGetTTL(key, windowSec) {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) {
    // If no Redis configured, skip rate limiting gracefully
    return { count: 1, ttlMs: windowSec * 1000 };
  }
  const headers = { Authorization: `Bearer ${token}` };

  // INCR
  const r1 = await fetch(`${base}/incr/${encodeURIComponent(key)}`, { headers });
  const j1 = await r1.json();
  const count = Number(j1.result || 0);

  // Set expiry on first hit
  if (count === 1) {
    await fetch(`${base}/expire/${encodeURIComponent(key)}/${windowSec}`, { headers });
  }

  // TTL (ms)
  const r2 = await fetch(`${base}/pttl/${encodeURIComponent(key)}`, { headers });
  const j2 = await r2.json();
  let ttlMs = Number(j2.result || (windowSec * 1000));
  if (ttlMs < 0) ttlMs = windowSec * 1000;

  return { count, ttlMs };
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method not allowed' });
      return;
    }

    const ip = getClientIp(req);

    // Parse JSON body (Vercel usually parses when Content-Type is application/json)
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};

    // Honeypot (bot guard)
    if (body.company) {
      res.status(400).json({ ok: false, error: 'Bad request' });
      return;
    }

    const email = (body.email || '').trim();
    const role = body.role ? String(body.role) : null;
    const redirect = body.redirect || 'https://fluryy.com/auth/callback.html';
    if (!email) {
      res.status(400).json({ ok: false, error: 'Missing email' });
      return;
    }

    // Rate-limit: 3 requests / 5 minutes per (email+ip)
    const WINDOW_SEC = 5 * 60;
    const LIMIT = 3;
    const key = `ml:${email.toLowerCase()}:${ip}`;
    const { count, ttlMs } = await incrAndGetTTL(key, WINDOW_SEC);
    if (count > LIMIT) {
      res.status(429).json({
        ok: false,
        error: 'Too many requests. Try again later.',
        retryAfterSec: Math.ceil(ttlMs / 1000),
      });
      return;
    }

    // Supabase client (Node)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirect,
        data: role ? { role } : undefined,
      },
    });

    if (error) {
      res.status(400).json({ ok: false, error: error.message });
      return;
    }

    res.status(200).json({ ok: true, message: 'Magic link sent' });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
};
