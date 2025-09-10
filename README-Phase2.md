# Phase 2 — Supabase Schema (Fluryy v1.2.5)

This package gives you the database schema + policies for Pets, Groomers, Bookings, Waitlist, and Contacts.

## 1) Run schema
1. Open **Supabase** → your project → **SQL**.
2. Paste **everything** from `supabase/schema.sql` and **Run**.

## 2) Auth Redirects (magic link)
- Supabase → **Authentication → URL Configuration → Redirect URLs**:
  - Add your deployed domain, e.g. `https://fluryy.com` and/or `http://localhost:3000`
  - Allowed callback URLs should include `/dashboard.html` and site root.

## 3) Client keys in code
- In Phase 1, `js/main.js` already includes your `SUPABASE_URL` and `anon` key.
- After this schema is applied, forms will start writing to the correct tables.

## 4) Test quickly
- Register via `/register.html` (choose a role).
- Add a booking from the booking modal.
- Check Supabase → Table Editor for rows in `bookings`, `contacts`, `waitlist`.

## 5) Next
- Proceed to **Phase 3 (PWA, assets, SEO)** when ready.
