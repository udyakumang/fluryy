// /api/send-magic-link.js
import { createClient } from '@supabase/supabase-js';

// Optional: use Edge runtime for lower latency
export const config = { runtime: 'edge' };

function getClientIp(req) {
  // Works on Vercel: prefer cf-connecting-ip, fall back to x-forwarded-for
  const ip = req.headers.get('cf-connecting-ip')
      || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || '0.0.0.0';
  return ip;
}

// Minimal Redis client using Upstash REST
async function incrAndGetTTL(key, windowSec) {
  const url = `${process.env.UPSTASH_REDIS_REST_URL}/incr/${encodeURIComponent(key)}`;
  const ttlUrl = `${process.env.UPSTASH_REDIS_REST_URL}/pttl/${encodeURIComponent(key)}`;
  const exUrl = `${process.env.UPSTASH_REDIS_REST_URL}/expire/${encodeURIComponent(key)}/${windowSec}`;

  const headers = { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` };

  // INCR
  const r1 = await fetch(url, { headers });
  const { result: count } = await r1.json();

  // If first hit, set expire
  if (count === 1) { await fetch(exUrl, { headers }); }

  // TTL (ms)
  const r2 = await fetch(ttlUrl, { headers });
  let { result: pttl } = await r2.json();
  if (pttl < 0) pttl = windowSec * 1000;

  return { count, ttlMs: pttl };
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return json(405, { ok:false, error:'Method not allowed' });
    }

    const ip = getClientIp(req);
    const { email, role, redirect = 'https://fluryy.com/auth/callback.html' } = await req.json() || {};
    if (!email) return json(400, { ok:false, error:'Missing email' });

    // --- Rate limit: 3 requests per 5 minutes per (email+ip) ---
    const WINDOW_SEC = 5 * 60;
    const LIMIT = 3;
    const key = `ml:${email.toLowerCase()}:${ip}`;
    const { count, ttlMs } = await incrAndGetTTL(key, WINDOW_SEC);
    if (count > LIMIT) {
      return json(429, {
        ok:false,
        error:'Too many requests. Try again later.',
        retryAfterSec: Math.ceil(ttlMs / 1000),
      });
    }

    // --- Call Supabase to send the magic link ---
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirect,
        // store role (if provided) on first login
        data: role ? { role } : undefined,
      },
    });

	const body = await req.json() || {};

    if (error) return json(400, { ok:false, error: error.message });
	if (body.company) return json(400, { ok:false, error:'Bad request' });

    return json(200, { ok:true, message:'Magic link sent' });
  } catch (e) {
    return json(500, { ok:false, error: String(e) });
  }
}