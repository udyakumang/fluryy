// /api/formspree-to-hubspot.js (Vercel Serverless Function)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!HUBSPOT_TOKEN) return res.status(500).json({ error: 'Missing HUBSPOT_PRIVATE_APP_TOKEN' });

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const name = payload.name || payload.fullname || payload.contact_name || '';
    const email = payload.email || '';
    const phone = payload.phone || payload.mobile || '';

    const contactResp = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?hapikey=', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HUBSPOT_TOKEN}` },
      body: JSON.stringify({
        properties: {
          email,
          firstname: name.split(' ')[0] || '',
          lastname: name.split(' ').slice(1).join(' ') || 'Fluryy',
          phone
        }
      })
    });
    const contactJson = await contactResp.json();
    if (!contactResp.ok) return res.status(502).json({ error: 'HubSpot contact create failed', detail: contactJson });

    await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HUBSPOT_TOKEN}` },
      body: JSON.stringify({
        properties: { hs_note_body: 'Formspree payload: ' + JSON.stringify(payload, null, 2) },
        associations: [{ to: { id: contactJson.id }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }] }]
      })
    });

    return res.status(200).json({ ok: true, contactId: contactJson.id });
  } catch (err) {
    console.error('Webhook error', err);
    return res.status(500).json({ error: 'Server error', detail: err?.message });
  }
}
