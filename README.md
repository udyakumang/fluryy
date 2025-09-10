# Fluryy Patch — v1.2.1 → v1.2.3

This patch upgrades your repo from **v1.2.1** straight to **v1.2.3** with full, working files.

## Files in this patch
- `js/main.js` — Supabase OTP + CRUD (pets, groomers, bookings), role metadata, counts, optional Razorpay.
- `login.html`, `register.html` — OTP (magic link) login & signup.
- `dashboard.html` — shows user email/role + live counts.
- `supabase/schema.sql` — create tables & RLS policies.
- `api/formspree-to-hubspot.js` — Vercel serverless webhook (optional).
- `netlify/functions/formspree-to-hubspot.js` — Netlify function webhook (optional).

## How to apply
1. **Copy these files** into your repo at the same paths, overwriting existing ones.
2. Commit & push to GitHub.
3. In Supabase → **Authentication → URL Configuration**:
   - Site URL: `https://YOUR_DOMAIN`
   - Redirects: add `https://YOUR_DOMAIN/dashboard.html`
4. In Supabase → **SQL editor**: run `supabase/schema.sql` once.
5. (Optional payments) If you want Razorpay checkout after booking insert, in your HTML `<head>` add:
   ```html
   <meta name="razorpay-key" content="rzp_live_or_test_key">
   <script src="https://checkout.razorpay.com/v1/checkout.js" defer></script>
   ```
6. (Optional CRM) In Formspree → each form → **Webhooks**, point to your deployed function:
   - Vercel: `https://YOUR-VERCEL-DOMAIN/api/formspree-to-hubspot`
   - Netlify: `https://YOUR-NETLIFY-DOMAIN/.netlify/functions/formspree-to-hubspot`
   Set env `HUBSPOT_PRIVATE_APP_TOKEN` in the platform settings.

## Notes
- Contact email/phone are **bot-safe** (revealed only on click).
- Booking modal, sticky mobile CTA, PWA install flow stay intact.
