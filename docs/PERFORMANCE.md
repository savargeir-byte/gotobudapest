# Performance (T-010) — baseline, changes and results, 2026-11-02

## Method and limits

* **Lab only.** Lighthouse 12.x, performance category, simulated 4G throttling (mobile preset) and the desktop preset, headless Microsoft Edge 156, against a
  local production build (`next start`, plain HTTP, no CDN, no compression). The browser cannot open https://www.gotobuda.com from this machine
  (organisation filter, B-008/B-009) and the public PageSpeed Insights API answered 429 (unauthenticated quota), so there is no production lab run. The absolute
  numbers are therefore NOT production numbers; they are a before/after comparison on the same machine. Run-to-run noise is large (home mobile LCP varied 2.9-5.8 s
  for an identical build), so single runs were not trusted: the hero experiments used 3-5 runs, the final set 2 runs per page.
* **Field Core Web Vitals (INP, real-user LCP and CLS): not available** (no CrUX or RUM access without an API key). Total Blocking Time is reported only as the lab proxy
  for responsiveness (all pages 0-22 ms).
* Pages: `/`, `/attractions`, `/attractions/matthias-church`, `/guides/budapest-in-3-days`, `/tours` and `/tours/viator/VP001` (the last two against the local mock
  provider, so their product data is synthetic). Data: `docs/phase19/lighthouse-summary.json`.

## Baseline problems found

| Finding | Evidence |
| --- | --- |
| The header and footer logo is an SVG that embeds a 900x375 PNG: 556 KB on every page, shown at 148-230 CSS px | network list, every page |
| `favicon.ico` 157 KB (a 150 KB 256x256 bitmap inside) | network list |
| Shared artwork `budapest.webp` (726 KB) and `danube.webp` (376 KB) served at full 2000 px as the 640 and 1280 photo of the 3 shared-hero places, the 8 guides and the topic pages | `uses-responsive-images` 909-991 KiB |
| Fonts came through a render-blocking CSS `@import` of Google Fonts (a third-party round trip before first paint) | `render-blocking-resources` 640-730 ms |
| `/attractions`: the directory was drawn only in the browser (`useSearchParams` under Suspense), so the HTML held a "Loading…" line and no place links, and the footer jumped when the 24 cards arrived: **CLS 0.28** (poor) | layout-shift trace; `curl` found 0 cards in the HTML |

## Changes (no visual redesign; hero, photography, cards, branding and navigation unchanged)

1. Logo: the same image re-encoded as a 690 px WebP (q95) inside the same SVG file — **556 KB → 93 KB**. Rendered in Edge at the real display size and device pixel
   ratio next to the original: visually identical (side-by-side image checked).
2. `favicon.ico`: the 16, 32 and 48 px entries kept, the unused 256 px bitmap dropped — **157 KB → 11 KB**.
3. `lib/artwork.ts`: cards and detail heroes of the shared artwork use 640 and 1280 px renditions of the same files (`*-640.webp`, `*-1280.webp`); the home page hero keeps the
   full 2000 px file. The `/tours` banner uses the 1280 px rendition (LCP there improved in a controlled test: 5.5 s → 3.4-4.2 s, 3 runs each).
4. Fonts: DM Sans and Manrope self-hosted (`public/fonts`, latin and latin-ext so Hungarian letters render; SIL OFL; same families and weights) instead of the Google
   Fonts `@import`; no third-party request.
5. `/attractions`: the directory is server-rendered (24 cards and their links are in the HTML, no Suspense fallback, no layout jump). A `?q=` link is applied after
   hydration with `useSyncExternalStore`.
6. Tried and rejected: serving the home hero as a `<picture>` with a 1280 px source for phones made lab LCP worse (3.8-4.2 s against 3.1-3.2 s over 5 runs each), so the
   home hero is unchanged.

## Results (median, lab, local build; before → after)

| Page | Form | Score | FCP s | LCP s | TBT ms | CLS | Transfer KB | Image KB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home | mobile | 95 → 96 | 1.6 → 1.4 | 2.9 → 3.2 | 9 → 12 | 0.003 → 0.003 | 2147 → 1048 | 1630 → 678 |
| Home | desktop | 100 → 100 | 0.5 → 0.3 | 0.6 → 0.6 | 0 → 0 | 0.002 → 0.002 | 2864 → 1767 | 2342 → 1389 |
| Attractions | mobile | 82 → 89 | 1.7 → 1.5 | 2.5 → 3.6 | 8 → 3 | **0.285 → 0.059** | 2207 → 735 | 1733 → 404 |
| Attractions | desktop | 77 → 100 | 0.5 → 0.4 | 2.0 → 0.8 | 0 → 0 | **0.280 → 0.017** | 2989 → 1518 | 2447 → 1119 |
| Attraction (Matthias Church) | mobile | 95 → 95 | 1.6 → 1.4 | 2.9 → 3.0 | 14 → 10 | 0.008 → 0.011 | 1709 → 717 | 1256 → 409 |
| Attraction | desktop | 100 → 100 | 0.5 → 0.3 | 0.6 → 0.9 | 0 → 0 | 0.008 → 0.008 | 1737 → 745 | 1256 → 409 |
| Guide | mobile | 94 → 94 | 1.7 → 1.5 | 2.9 → 3.3 | 14 → 5 | 0.007 → 0.007 | 1122 → 637 | 664 → 326 |
| Guide | desktop | 100 → 100 | 0.5 → 0.4 | 0.6 → 0.7 | 0 → 0 | 0.004 → 0.004 | 1474 → 991 | 975 → 637 |
| Tours (mock) | mobile | 93 → 86 | 1.7 → 1.5 | 3.1 → 4.2 | 18 → 22 | 0.026 → 0.026 | 1253 → 520 | 824 → 235 |
| Tours (mock) | desktop | 100 → 100 | 0.5 → 0.4 | 0.7 → 0.7 | 0 → 0 | 0.017 → 0.016 | 1339 → 606 | 855 → 266 |
| Product (mock) | mobile | 97 → 95 | 1.6 → 1.4 | 2.5 → 2.9 | 6 → 12 | 0.007 → 0.007 | 848 → 365 | 410 → 71 |
| Product (mock) | desktop | 100 → 100 | 0.5 → 0.3 | 0.6 → 0.6 | 0 → 0 | 0.008 → 0.008 | 902 → 419 | 410 → 71 |

Honest reading: transfer size fell by 40-65 % on every page and FCP improved by 0.2-0.3 s; the layout-shift defect on the directory is fixed (0.28 → 0.02-0.06). **Mobile LCP did
not improve in this lab and on several pages is worse** (up to +1.1 s): first paint is earlier, but the LCP element is now a real card or hero image rather than text that was
visible before the cards existed (`/attractions`), and the self-hosted fonts and the larger preloads compete with the hero image under the simulated throttling. The `/tours` figure was
measured against the mock provider. Treat the LCP differences as lab noise plus a possible real regression to re-measure on production when the browser filter is lifted or a
PageSpeed API key exists; do not read them as a gain.

## Not changed on purpose

Home hero (full-width 2000 px artwork), branding, tour cards, navigation, the Content-Security-Policy (the Studio still needs its entries), and JavaScript size (167-185 KB per
page; the only "unused JavaScript" finding above 88 KiB is a browser extension).

## Guards

`e2e/performance-guards.spec.ts` (desktop and mobile): logo under 150 KB, favicon under 30 KB, shared artwork renditions small, no request to Google Fonts and web fonts loaded, the first
24 places and their links present with JavaScript disabled, no layout shift on the directory (under 0.1), `?q=` still filters.

## Phase 20 addendum (2026-11-03): the LCP question

The Lighthouse simulation used above reported mobile LCP as worse after Phase 19. Measured with throttling applied by the browser itself (CPU 4x, 1.6 Mbit/s, 150 ms, 5 runs, cold cache), Phase 19 improved LCP on every
page measured: home 7.6 s to 5.1 s, a place page 8.0 s to 3.9 s, a guide 3.4 s to 2.9 s. The LCP element is a hero image and LCP is bandwidth-bound. A responsive home hero (1280 px rendition for screens up to 900 px, 125 KB instead of
376 KB; the same artwork) brings home LCP to 3.2 s. Lighthouse's simulation scores that variant worse, so the two methods disagree; production data is needed to settle it (B-016). Method, waterfall findings and data: `docs/PHASE20-QA.md`
and `docs/phase20/lcp-real-throttle.json`. The statement "Mobile LCP did not improve" in the table above describes the simulation, not the real network.
