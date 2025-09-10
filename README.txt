
Fluryy Website — vv1.2.1
===========================

What’s inside
- PWA shell (manifest + service worker) with prominent Install buttons (header, hero, mobile, banner, /install.html).
- Booking modal + sticky mobile CTA; Formspree wired (Waitlist/Groomer/Contact/Booking).
- Bot-safe contact: email=hello@fluryy.com, WhatsApp=+918657369309 (assembled in JS).
- Demo auth (localStorage) with protected pages and a role-aware dashboard.

Supabase auth (optional)
1) Create project → get SUPABASE_URL + ANON_KEY.
2) Uncomment <script type="module" src="/js/auth-supabase.js"></script> in pages.
3) Edit /js/auth-supabase.js with your keys; call signInWithEmail(...) from your login form.
4) Replace demo localStorage in main.js with Supabase session checks.

Clerk auth (alternative)
- Add Clerk SDK script tags per docs; replace demo auth in main.js with Clerk mount points.

Razorpay payments (optional)
1) Add <script src="https://checkout.razorpay.com/v1/checkout.js"></script> in <head>.
2) Implement a backend to create orders (amount, currency, receipt) and return order_id.
3) In /js/payments-razorpay.js, set your key_id and call openRazorpay(amount, order_id) after booking.

Deploy
- Serve over HTTPS at site root. Ensure /manifest.webmanifest and /sw.js are accessible.
- Any static host works: Netlify, Vercel, GitHub Pages, Cloudflare Pages, cPanel.
