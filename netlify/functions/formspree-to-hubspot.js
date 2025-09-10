// /netlify/functions/formspree-to-hubspot.js (Netlify Function)
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!HUBSPOT_TOKEN) return { statusCode: 500, body: 'Missing HUBSPOT_PRIVATE_APP_TOKEN' };

  try {
    const payload = JSON.parse(event.body || '{}');
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
    if (!contactResp.ok) return { statusCode: 502, body: JSON.stringify({ error: 'HubSpot contact create failed', detail: contactJson }) };

    await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HUBSPOT_TOKEN}` },
      body: JSON.stringify({
        properties: { hs_note_body: 'Formspree payload: ' + JSON.stringify(payload, null, 2) },
        associations: [{ to: { id: contactJson.id }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }] }]
      })
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true, contactId: contactJson.id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error', detail: err?.message }) };
  }
};
