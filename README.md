# GoToBudapest

Independent Budapest travel website built with **Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4**. It preserves the navy/teal visual direction of the first GoToBudapest design.

## Run locally

Use Node.js 22 or newer:

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

```bash
npm run typecheck
npm run build
npm start
```

## Features

- Home page, 100-place attraction directory, six travel guides, three experience pages, two neighbourhood pages, essentials and privacy pages.
- Search and category filters for attractions and guides; every place has its own page with an official source link.
- Verified, openly licensed photographs with credit lines (see Images).
- Technical SEO: canonical URLs, Open Graph, breadcrumb/Article/FAQ/TouristAttraction structured data, `sitemap.xml`, `robots.txt`, branded 404.
- Metadata, favicon and security headers, including HSTS on HTTPS.
- Tailwind v4 via PostCSS, with retained custom CSS for the established design.
- No trip planner, accounts, saved places, analytics or cookies.

## Content and integrations

Attractions live in `lib/attractions.json`, guides in `lib/guides.ts`, experience and neighbourhood pages in `lib/topics.ts`, photographs in `lib/photos.json`.

Sanity, TourDesk, analytics, payments and other external integrations are intentionally **not connected**. The site does not accept bookings or display invented prices, availability or reviews.

## Configuration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Confirmed production origin, e.g. `https://www.example.com` (https, no path). Drives canonical URLs, Open Graph URLs and `sitemap.xml`. An invalid value fails the build. |

While `NEXT_PUBLIC_SITE_URL` is unset the site is served with `noindex` and `robots.txt` disallows crawling, so no wrong domain is ever indexed. In Vercel: Project → Settings → Environment Variables → add `NEXT_PUBLIC_SITE_URL` for Production (and redeploy).

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm run validate:content
npx playwright install chromium   # once, or set PW_CHANNEL=msedge|chrome
npm run test:e2e                  # desktop + mobile; PW_BASE_URL=https://… tests a deployment
```

## Deployment

Import this repository into a Next.js-compatible host (for example Vercel). Build command: `npm run build`. No environment variables or secrets are required. Connect a domain and add canonical URLs/sitemap configuration when the production hostname is selected.

The earlier HTML version on ChatGPT Sites is a separate deployment. This repository is the Next.js source of truth and does not include Sites hosting identity or credentials.

## Images

- Homepage and shared artwork: Unsplash photographs `budapest.webp`, `danube.webp`, `city.webp` (photo-1549877452-9c387954fbc2, photo-1565426873118-a17ed65d74b9, photo-1551867633-194f125bddfa).
- Place, guide, experience and neighbourhood photographs: Wikimedia Commons files under CC0, CC BY, CC BY-SA or public domain. Photographer, licence and source link are in `lib/photos.json` and `docs/image-credits.json`, and are shown on the pages. Method and rejected matches: `docs/image-sourcing.md`.
- Images are pre-optimised WebP (640 and 1280 px) in `public/assets`; `images.unoptimized` stays on so hosting needs no paid image processing.

## Travel content and branding

- `/experiences`, `/neighbourhoods`: hub pages with editorial sections, attraction cards and related guides.
- `/guides`: searchable hub with six original English guides, category filters and individual article routes.
- `/attractions`: 100 distinct places, category filters, alphabetical sorting, search and incremental loading.
- `/attractions/[slug]`: concise place entries, source links, map links, relevant guides and access notices.
- 81 entries have coordinates supplied by official tourism sources; other map links use a place-name search.
- Source checks are recorded in `docs/attraction-source-checks.json`. These confirm source availability, not live venue opening status.
- Article routes are editorial suggestions, with linked sources and dated review notes. No live prices, ratings or bookable inventory are asserted.
- The supplied GoToBudapest logo and favicon are included. Other sites remain independent.

Run `npm run validate:content` to check catalogue uniqueness, required fields and coordinate bounds.
