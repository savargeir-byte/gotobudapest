# GoToBudapest

Independent Budapest travel website built with **Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4**. The existing navy/teal design, logo and favicon are preserved.

## Run locally

Use Node.js 22 or newer:

```bash
npm ci
npm run validate:content
npm run typecheck
npm run build
npm start
```

Open http://localhost:3000.

## Pages

- `/`: photo-led Budapest homepage with links to real pages
- `/attractions`: searchable directory of 100 curated Budapest attractions
- `/attractions/[slug]`: attraction details, source links and maps
- `/experiences`: Danube, thermal baths, food and markets
- `/experiences/danube`
- `/experiences/thermal-baths`
- `/experiences/food-and-markets`
- `/neighbourhoods`: explore Castle District and Downtown Pest
- `/neighbourhoods/castle-district`
- `/neighbourhoods/downtown-pest`
- `/guides`: searchable editorial guide collection
- `/guides/[slug]`: eight original English travel guides, including Downtown Pest and food/market guides
- `/essentials`: practical visitor information and official links
- `/privacy`: preliminary data-handling information (review legally required owner disclosures before production)

**No Trip Planner:** this site does not offer saved-trip collections, itinerary exports, "My Trip", localStorage wishlists or a trip-planner page. A static three-day editorial article remains part of the travel guides.

## Content and imagery

- `lib/attractions.json`: 100 distinct places with links to visitor sources; `docs/attraction-source-checks.json` records prior availability checks.
- `lib/editorial.ts`: neighbourhood and experience page content, verified public information links, curated attraction groupings.
- `lib/guides.ts` and `lib/new-editorial-guides.ts`: editorial guides.
- Reusable layouts: `components/editorial-pages.tsx`.
- Local image assets in `public/assets` are used where relevant. A reused city panorama is labelled as such, rather than presented as a photograph of an unrelated venue. Some attraction entries still lack venue-specific photos; do not invent imagery or attribution.

Image source URLs as originally documented:
- `budapest.webp`: https://images.unsplash.com/photo-1549877452-9c387954fbc2
- `danube.webp`: https://images.unsplash.com/photo-1565426873118-a17ed65d74b9
- `city.webp`: https://images.unsplash.com/photo-1551867633-194f125bddfa

## External services and deployment

Sanity CMS, TourDesk booking, analytics and online payments are **not connected**. No live prices or availability are claimed. Links to official visitor information are for independent verification.

Import the repository into Vercel with build command `npm run build`. The final custom domain has not been confirmed; review canonical URL and sitemap setup once it is known. Confirm privacy notices before enabling any new analytics or marketing tracking.

GoToBudapest is independent of GoIceTravel. Do not modify its sister websites as part of this project.
