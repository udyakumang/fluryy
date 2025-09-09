
# Fluryy Website (v1.0.5)

Static, SEO-friendly, PWA‑ready site for **Fluryy** (pet grooming bookings).

## What you get
- `index.html` — Fluryy landing: Hero, *How it works*, Services (Bath & Brush, Full Groom, Cat Groom), **Service Areas** (Borivali→Bandra corridor), **Groomer onboarding**, Contact.
- `css/styles.css` — Clean, modern, mobile-first styles.
- `js/main.js` — Smooth anchors, WhatsApp CTA, **PWA registration**.
- `assets/logo-fluryy.svg` & `assets/favicon.svg` — Vector paw-style logo + icon.
- `robots.txt`, `sitemap.xml` — SEO basics.
- `manifest.webmanifest`, `sw.js` — PWA shell with offline cache.

## Live email wiring (Formspree)
Two forms are wired to Formspree. Replace the placeholder IDs with your own:
- Waitlist: `action="https://formspree.io/f/WAITLIST_ID"`
- Groomer: `action="https://formspree.io/f/GROOMER_ID"`
- Contact: `action="https://formspree.io/f/CONTACT_ID"`

### Steps
1. Create forms at Formspree and copy the IDs.
2. Open `index.html` and replace the three IDs.
3. (Optional) Add a thank-you redirect: `<input type="hidden" name="_next" value="https://fluryy.com/thanks.html">`

## Quick edits before launch
- **Email:** hello@fluryy.com (display only; mail handled by Formspree).
- **WhatsApp:** update number in `index.html` and in `js/main.js`.
- To switch from Formspree to SES/Mailchimp later, remove the `action` attributes and add a JS POST in `main.js`.

© 2025 Fluryy.
