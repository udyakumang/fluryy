// /api/set-role.js (Node.js serverless, CommonJS)
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ ok:false, error:'Method not allowed' });
      return;
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};

    const { user_email, role } = body;
    if (!user_email || !role) {
      res.status(400).json({ ok:false, error:'Missing user_email or role' });
      return;
    }

    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      res.status(500).json({ ok:false, error:'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
      return;
    }

    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // Find user by email
    // listUsers is paged; for small projects this is acceptable. For scale, store a profiles directory.
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) {
      res.status(500).json({ ok:false, error: String(listErr) });
      return;
    }
    const u = (list.users || []).find(x => x.email === user_email);
    if (!u) {
      res.status(404).json({ ok:false, error:'User not found' });
      return;
    }

    const { error } = await admin.auth.admin.updateUserById(u.id, {
      user_metadata: { ...(u.user_metadata || {}), role }
    });
    if (error) {
      res.status(500).json({ ok:false, error: String(error) });
      return;
    }

    res.status(200).json({ ok:true });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e) });
  }
};
