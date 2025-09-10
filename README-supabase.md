
# Fluryy – Phase 2: Supabase Schema (v1.2.5)

This sets up tables + RLS for Pets, Groomers, Bookings, and public forms (Waitlist, Contacts).

## 1) Apply schema
1. Open your Supabase project → **SQL Editor**.
2. Paste the contents of `supabase/schema.sql` and **Run**.
3. Confirm tables and RLS policies under **Table editor**.

## 2) Auth URL settings (magic link)
- Supabase → **Authentication → URL Configuration**
  - Add your production and preview URLs to **Site URL** and **Redirect URLs** (e.g. `https://fluryy.vercel.app`, `http://localhost:3000`).

## 3) Frontend env (already baked in Phase 1)
- `js/main.js` uses your Supabase URL and anon key. If you rotate keys, update them there.

## 4) Verify from the site
- Register → login via magic link.
- Add a Pet (in `/pets.html`), Save a Groomer profile (in `/providers.html`), make a Booking from the modal.
- Check rows appear in Supabase tables.

## Notes
- Public tables (`waitlist`, `contacts`) allow anonymous **insert** only. Read them using the **service role** or admin UI.
- Bookings/Pets/Groomers are owned by the logged-in user via `auth.uid()` RLS.
