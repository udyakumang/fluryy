# Fluryy Website (v1.0.1)

Static, SEO-friendly, PWA‑ready site for **Fluryy** (pet grooming bookings).
No references to Udyak in this repo.

## Quick start (GitHub Pages)
1. Create a new GitHub repo (e.g., `fluryy-site`).
2. Upload these files (or push via git).
3. Go to **Settings → Pages** and set **Source = GitHub Actions** (the included workflow will deploy on every push to `main`).
4. Visit the Pages URL or point your custom domain **fluryy.com** to it.

## Structure
- `index.html`, `css/`, `js/`, `assets/` — site code
- `manifest.webmanifest`, `sw.js` — PWA basics
- `sitemap.xml`, `robots.txt` — SEO basics
- `.github/workflows/pages.yml` — GitHub Pages deploy workflow
- `VERSION` — release version (v1.0.1)

## Customization
- Update contact details in the **Contact** section of `index.html` and `js/main.js` (WhatsApp handler).
- Replace demo form handlers with SES/Mailchimp/Formspree endpoints.
- Add blog later under `/blog/`.

© 2025 Fluryy.
