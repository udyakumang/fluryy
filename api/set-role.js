// /api/set-role.js — Vercel serverless function to set a user's role with Supabase service key
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });

    const { user_email, role } = req.body || {};
    if (!user_email || !role) return res.status(400).json({ ok:false, error:'Missing user_email or role' });

    const url = process.env.SUPABASE_URL || 'https://qfldkqowlqkokpqwqdpl.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) return res.status(500).json({ ok:false, error:'Missing SUPABASE_SERVICE_ROLE_KEY' });

    const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

    // Find the user by email
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) return res.status(500).json({ ok:false, error:String(listErr) });
    const u = list.users.find(x => x.email === user_email);
    if (!u) return res.status(404).json({ ok:false, error:'User not found' });

    // Update user_metadata.role
    const { error } = await admin.auth.admin.updateUserById(u.id, {
      user_metadata: { ...(u.user_metadata || {}), role }
    });
    if (error) return res.status(500).json({ ok:false, error:String(error) });

    return res.status(200).json({ ok:true });
  } catch (e) {
    return res.status(500).json({ ok:false, error: String(e) });
  }
}
