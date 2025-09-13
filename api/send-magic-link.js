// /api/send-magic-link.js  (Node serverless, CommonJS, JSON-only responses)
const { createClient } = require('@supabase/supabase-js');

function json(res, status, body) {
  res.status(status)
    .setHeader('Content-Type', 'application/json')
    .setHeader('Cache-Control', 'no-store')
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .send(JSON.stringify(body));
}

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  return req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || '0.0.0.0';
}

async function incrAndGetTTL(key, windowSec) {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) {
    // No Redis configured — skip rate limit gracefully
    return { count: 1, ttlMs: windowSec * 1000 };
  }
  const headers = { Authorization: `Bearer ${token}` };

  // INCR
  const r1 = await fetch(`${base}/incr/${encodeURIComponent(key)}`, { headers });
  const j1 = await r1.json().catch(() => ({ result: 0 }));
  const count = Number(j1.result || 0);

  // Expire on first hit
  if (count === 1) {
    await fetch(`${base}/expire/${encodeURIComponent(key)}/${windowSec}`, { headers });
  }

  // TTL (ms)
  const r2 = await fetch(`${base}/pttl/${encodeURIComponent(key)}`, { headers });
  const j2 = await r2.json().catch(() => ({ result: windowSec * 1000 }));
  let ttlMs = Number(j2.result || (windowSec * 1000));
  if (ttlMs < 0) ttlMs = windowSec * 1000;

  return { count, ttlMs };
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return json(res, 200, { ok: true });
    if (req.method !== 'POST') return json(res, 405, { ok:false, error:'Method not allowed' });

    // ENV validation up front (prevents 500 HTML responses)
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Missing env: SUPABASE_URL or SUPABASE_ANON_KEY');
      return json(res, 500, { ok:false, error:'Server not configured (missing Supabase env vars)' });
    }

    const ip = getClientIp(req);

    // Body parsing (Vercel provides req.body if json header present; fall back to parsing string)
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};

    // Honeypot
    if (body.company) return json(res, 400, { ok:false, error:'Bad request' });

    const email = (body.email || '').trim();
    const role = body.role ? String(body.role) : null;
    const redirect = body.redirect || 'https://fluryy.com/auth/callback.html';
    if (!email) return json(res, 400, { ok:false, error:'Missing email' });

    // Rate-limit: 3 per 5 minutes per (email+ip)
    const WINDOW_SEC = 5 * 60;
    const LIMIT = 3;
    const key = `ml:${email.toLowerCase()}:${ip}`;
    const { count, ttlMs } = await incrAndGetTTL(key, WINDOW_SEC);
    if (count > LIMIT) {
      return json(res, 429, { ok:false, error:'Too many requests. Try again later.', retryAfterSec: Math.ceil(ttlMs/1000) });
    }

    // Supabase (Node)
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirect,
        data: role ? { role } : undefined,
      },
    });

    if (error) {
      console.error('Supabase signInWithOtp error:', error);
      return json(res, 400, { ok:false, error: error.message });
    }

    return json(res, 200, { ok:true, message:'Magic link sent' });
  } catch (e) {
    console.error('send-magic-link exception:', e);
    return json(res, 500, { ok:false, error: 'Internal error' });
  }
};
