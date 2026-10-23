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

- Server-rendered home page with responsive layouts and local photography.
- React-based place search, category filters and accessible native detail dialogs.
- Saved places in browser localStorage; downloadable text itinerary.
- Three-day suggested itinerary and neighbourhood guides.
- Metadata, favicon and security headers, including HSTS on HTTPS.
- Tailwind v4 via PostCSS, with retained custom CSS for the established design.

## Content and integrations

`lib/content.json` contains the initial editorial dataset; `lib/content.ts` defines its typed interface. This is the replacement point for a future Sanity content layer.

Sanity, TourDesk, analytics, payments and other external integrations are intentionally **not connected**. The site does not accept bookings or display invented prices, availability or reviews. Saved trips belong to the current browser, not an online account.

## Deployment

Import this repository into a Next.js-compatible host (for example Vercel). Build command: `npm run build`. No environment variables or secrets are required. Connect a domain and add canonical URLs/sitemap configuration when the production hostname is selected.

The earlier HTML version on ChatGPT Sites is a separate deployment. This repository is the Next.js source of truth and does not include Sites hosting identity or credentials.

## Images

Local photographs downloaded from Unsplash:

- `budapest.webp`: https://images.unsplash.com/photo-1549877452-9c387954fbc2
- `danube.webp`: https://images.unsplash.com/photo-1565426873118-a17ed65d74b9
- `city.webp`: https://images.unsplash.com/photo-1551867633-194f125bddfa

Thermal-bath artwork is an illustration rather than a venue photograph. Attraction links point to official visitor resources; check current schedules and admission terms with operators.

## Travel content and branding

- `/guides`: searchable hub with six original English guides, category filters and individual article routes.
- `/attractions`: 100 distinct places, category filters, alphabetical sorting, search and incremental loading.
- `/attractions/[slug]`: concise place entries, source links, map links, relevant guides and access notices.
- 81 entries have coordinates supplied by official tourism sources; other map links use a place-name search.
- Saved places work across the home page and the new catalogue, preserving earlier saved IDs.
- Source checks are recorded in `docs/attraction-source-checks.json`. These confirm source availability, not live venue opening status.
- Article routes are editorial suggestions, with linked sources and dated review notes. No live prices, ratings or bookable inventory are asserted.
- The supplied GoToBudapest logo and favicon are included. Other sites remain independent.

Run `npm run validate:content` to check catalogue uniqueness, required fields and coordinate bounds.
