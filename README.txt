
# Udyak Static Website

A fast, mobile-first, SEO-friendly landing site for **Udyak** — your growth partner for Indian SMBs.

## Structure
- `index.html` — Landing page (hero, services, who we help, case study, contact)
- `css/styles.css` — Lightweight responsive CSS (no build step)
- `js/main.js` — Newsletter stub, PWA registration, smooth scroll
- `assets/logo-udyak.svg` — Vector logo (as per finalized brand description)
- `assets/favicon.svg` — App icon
- `robots.txt`, `sitemap.xml` — SEO essentials
- `manifest.webmanifest`, `sw.js` — PWA basics, offline cache

## Go live (₹0 hosting options)
### Option A: GitHub Pages
1. Create a repo named `udyak-site`, push files.
2. Settings → Pages → Deploy from `main` root.
3. Visit `https://<your-username>.github.io/udyak-site/`.
4. Optional: point **udyak.com** to Pages by adding a `CNAME` and DNS `A/ALIAS` or `CNAME`.

### Option B: Netlify
1. Drag & drop the folder at https://app.netlify.com/drop
2. Add a custom domain `udyak.com`, update DNS to Netlify.
3. Netlify handles HTTPS automatically.

### Option C: Vercel
1. `Import Project` → drag folder → Deploy.
2. Add custom domain and DNS.
3. Auto HTTPS + CI.

## Wire the newsletter (Amazon SES or Mailchimp)
- **SES**: create a simple API endpoint (AWS Lambda + API Gateway) that accepts `{ email }` and sends to your list. Replace the JS handler in `js/main.js` to POST to your endpoint.
- **Mailchimp/Formspree**: replace the `<form>` `action` with your provider URL.

## Customize
- Update contact in the Contact section (email/WhatsApp).
- Replace the case study with live results once available.
- Add a blog at `/blog/` later if needed.

— Generated on 2025-09-08.
