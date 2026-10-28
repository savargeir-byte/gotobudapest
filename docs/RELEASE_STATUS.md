# Release status: Sanity + booking (2026-10-26)

Legend: **VERIFIED** = observed against the real service or by a real browser; **MOCKED** =
passes against a local stand-in (not proof of the real provider); **BLOCKED** = could not be
done, with the failed operation; **OPEN** = needs a decision or action by the owner.

## Booking

| Item | Status | Evidence |
| --- | --- | --- |
| Live provider catalogue via production `/api/budapest-offers` (11 contexts) | **VERIFIED** | Viator 39 unique products, Tiqets 14, TourDesk 0 in every context (2026-10-26). |
| Viator affiliate URLs returned unchanged | **VERIFIED** | Live URLs carry `mcid`, `campaign`, `pid`, `medium`, `api_version` exactly as the API supplied them; photos on `media-cdn.tripadvisor.com` return 200. Affiliate URLs were inspected, not requested (no click inflation). |
| Tiqets links | **VERIFIED** | Live URLs carry `partner`; no photos (content permissions, by design). |
| TourDesk zero results: root cause | **BLOCKED** | Needs the key. No Vercel access (CLI not logged in, browser session redirects to vercel.com/login, preview behind SSO). Evidence for the likeliest cause (account catalogue is Iceland-focused; GoIceTravel's own audit documents 1,803 Iceland products and a non-functional region filter) is circumstantial. Run `npm run diagnose:tourdesk` (goTene's diagnosis adapted for Budapest) with the project's key for a proven verdict. The site now logs `[offers] tourdesk response=… rows=… budapestRows=…` and `[booking-catalogue] <host> <status>` in Vercel runtime logs. |
| TourDesk discovery strategies (geo, then bounded scan, then honest empty; 401/403 note; 30-min cache; cursor over the cached subset) | **MOCKED** | 14 unit tests (`tests/tourdesk-discovery.test.ts`) and `e2e/tourdesk-discovery.spec.ts` against the local mock: strategy selection, `totalCount` validation, unstable/no-progress/implausible geo rejection, foreign exclusion, 401/403 note, empty note, paging without duplicates. Proves the logic only; **no real TourDesk response was seen**. |
| TourDesk zero results: does discovery fix it? | **UNPROVEN** | The geo search and scan only help if the account holds Budapest inventory. If the cause is the credentials (the site now says "TourDesk rejected the credentials" for 401/403), an empty account (the note lists the strategies tried) or an Iceland-only catalogue, nothing changes. Owner check: `npm run diagnose:tourdesk` prints `productionStrategyWouldUse` (geo / scan / none) and the request count. Nothing is blocked on this. |
| Vercel env scopes / redeploy needs | **BLOCKED** | `403`/no session; indirect proof only: Viator and Tiqets keys are valid in the Production scope because live responses contain data. TourDesk key presence unknown. |
| Live product detail, availability, pickup, capacity (≥2 products per provider) | **BLOCKED** | The detail/availability routes exist only on PR #10 / this branch, which is not deployed anywhere reachable (previews are protected) and no keys are available locally. |
| Browser-level booking UI, desktop + mobile (TourDesk screens; Viator screens are in `e2e/viator-product.spec.ts`) | **MOCKED** | 42 test runs (21 per viewport) in `e2e/booking-ui.spec.ts` against `e2e/support/mock-provider.mjs`: date/departure/option/participants, sold-out, price/capacity change, 503, double-click (one POST), complex-config handoff, host spoof, return page never claims payment. |
| Server-logic contracts | **MOCKED** | `e2e/native-booking-contracts.spec.ts`, `e2e/provider-contracts.spec.ts`. |
| Checkout creation / confirmed payment | **NOT TESTED** | No real order, hold or payment was made. Checkout creation is unverified against TourDesk; payment confirmation is never claimed by the UI. |
| Viator internal product page: full API details, live availability/prices, final handoff, desktop + mobile | **MOCKED** | 26 tests in `e2e/viator-product.spec.ts` (13 per viewport) against `e2e/support/mock-provider.mjs`: card to internal page, details before availability before the single exact-URL "Continue to Viator", absent sections absent, schedules 403/404/empty/500 and check failure states with retry, only products/schedules/check endpoints called. Real Viator field shapes, the key tier's access to `/availability/schedules` and live prices are **UNVERIFIED** without a real key in this environment. |
| Native Viator / Tiqets booking | **NOT ENABLED** | Affiliate handoff only; no booking/hold/reserve endpoint is called (asserted by tests). |

## Sanity

| Item | Status | Evidence |
| --- | --- | --- |
| Dataset `production` document count | **VERIFIED: 0 documents** | `npm run sanity:verify` (public CDN read), 2026-10-26. |
| Why it is empty | **VERIFIED by code** | Seeding was only an implicit Vercel build side effect; it needs `SANITY_API_TOKEN` in that build scope and no log is visible to us. It is now opt-in (`SANITY_SEED_ON_BUILD=1`); use the manual workflow instead. |
| Seed run | **BLOCKED** | No write token available to this environment. Dry run: 100 attractions, 8 guides, 3 experiences, 2 neighbourhoods, 2 regions, 13 categories, 1 settings, 63 histories, 13 galleries, 106 image files. |
| Seed → GROQ → mapper round trip | **MOCKED** (real documents, `groq-js` evaluator) | `tests/sanity-pipeline.test.ts`. |
| Site renders Sanity data | **NOT YET** | `e2e/sanity-content.spec.ts` (`PW_EXPECT_SANITY=1`) and `REQUIRE_SANITY_CONTENT=1` are ready for after the seed. |
| Studio login, publishing, CORS, webhook creation | **BLOCKED / OPEN** | Needs a signed-in project member. CORS for `https://gotobudapest.vercel.app` was reported present by another contributor; not re-inspected here. |
| Signed webhook endpoint | **VERIFIED (local)** | Unsigned, invalid, oversized, wrong type, rate limit and correctly signed requests tested; not yet tested end-to-end from Sanity. |

## Production verification, 2026-10-28 (after the merge of PR #1, merge commit f2bf4cb)

| Item | Status | Evidence |
| --- | --- | --- |
| Production runs the merged code | **VERIFIED (by behaviour)** | GitHub reports the Vercel deployment status "success" for f2bf4cb. `/api/marketplace/search`, `/tours/viator/<code>` and responsive card images exist on `www.gotobuda.com`; the old code had none of them. The deployed SHA itself could not be read (no Vercel access). |
| Viator inventory (live) | **VERIFIED** | `/api/marketplace/search`: status ok, total 1249 for the account; 69 products walked over 3 pages with 0 duplicates; every card opens `/tours/viator/<code>`. |
| Tiqets inventory (live) | **VERIFIED** | status ok, total 56 reported; 40 reachable by paging (3 pages, 0 duplicates, after cross-provider de-duplication). Tiqets returns no photos on this key tier (by design: no unlicensed images). |
| TourDesk inventory (live) | **FAILED / BLOCKED** | The marketplace reports "TourDesk is temporarily unavailable" (an error state, not an empty one, and not "rejected the credentials"): the key is configured and not refused, but every discovery strategy fails without a definite answer. Cause unknown without the key: needs `npm run diagnose:tourdesk` or the new Vercel runtime log line `[offers] tourdesk discovery unavailable: ...` (strategies and HTTP statuses, no secrets). |
| Pagination, sorting, search, categories (live) | **VERIFIED** | Cursor paging without duplicates for all providers; `sort=price_asc`, `price_desc`, `popularity`, `rating` order correctly; `q=thermal` finds baths; categories cruises, food, sightseeing, nightlife return products; "family" honestly returns none. |
| Image resolution (live) | **VERIFIED** | 140 of 140 sampled products: no card image under 320 px (every Viator card offers 6 renditions of 360-720 px; the 720x480 file really is 720x480, 75 KB; the old 100x100 thumbnail is gone). The largest Viator rendition is 720 px, so cards are labelled source limited rather than upscaled. Issue #11 may be closed. |
| Viator product page and availability (live, read-only) | **VERIFIED / PARTLY UNPROVEN** | Real product page: one viator.com link (the API URL with `mcid`, `pid`, `medium`, `api_version`, nothing appended) after availability; the schedules API returned 120+ bookable dates and age bands; `/availability/check` returned real start times. **UNPROVEN:** the live check returned no price lines, so the page shows no total. The price parser now also accepts the nested `price` container (`retailPrice`); whether this key tier returns prices is unknown. |
| Tiqets product page (live) | **VERIFIED** | One tiqets.com link carrying the API `partner` value unchanged. The value is `goicetravel-19`: the Tiqets key belongs to the GoIceTravel account. Confirm this is intended for GoToBudapest attribution. |
| Canonical, sitemap, robots (live) | **VERIFIED** | `https://www.gotobuda.com`; apex 308 to www; robots `Allow: /` plus sitemap. Product pages are `noindex, follow`; their canonical now points at themselves (it inherited the homepage). |
| JSON-LD (live) | **VERIFIED / FIXED** | TouristAttraction, BreadcrumbList and FAQPage on content pages; the homepage had none and now carries WebSite and Organization. |
| Sanity migration | **BLOCKED** | No write credential on this machine (no `SANITY_API_TOKEN`, Sanity CLI not logged in; GitHub not authenticated, so the manual seed workflow cannot be started). `--plan` and `--dry-run` pass (129 published documents, 106 images, 41 cross-link patches, nothing overwritten). Live dataset: 0 attractions. |
| Sanity CORS | **FAILED** | The API answers the CORS preflight for `gotobudapest.vercel.app` and `localhost:3333` but not for `https://www.gotobuda.com`: the Studio at `/studio` cannot work on the production domain until that origin is added (Allow credentials). |
| Revalidation webhook | **FAILED (configuration)** | An unsigned POST answers 503 (secret not configured): `SANITY_REVALIDATE_SECRET` is missing in Vercel Production. The Vercel Firewall rule for this route is not verifiable here. |
| Booking safety | **VERIFIED** | No booking, hold or payment endpoint was called. Only GET schedules and POST availability/check (read-only) were used; `TOURDESK_BOOKING_ENABLED` untouched (native checkout off). |

## Test results, 2026-10-27 (working tree before commit)

| Check | Result |
| --- | --- |
| Typecheck, lint, production build | **VERIFIED** clean |
| Unit tests (`npm run test:unit`) | **VERIFIED** 106 passed, 0 failed |
| Full Playwright suite, `CI=true`, one worker, local production build + local provider mock | **VERIFIED (MOCKED providers)** 470 passed, 49 skipped, 0 failed |
| Skips (all intentional) | Sanity-content tests need `PW_EXPECT_SANITY` (migration BLOCKED); marketplace-api and discovery run on one project only; image-quality runs on one project and checks rows at the density extremes; the mobile drawer test is narrow-screen only |
| Rate limits | **VERIFIED** `e2e/rate-limits.spec.ts` (unscaled server, port 3102): 30 requests pass, the 31st is 429 with `Retry-After: 60` for marketplace search, booking API and the webhook. No test forges client addresses. Shared test servers scale the budget with `RATE_LIMIT_TEST_SCALE` (ignored on Vercel). |
| Scroll-to-top | **VERIFIED** 20 tests (desktop + mobile). One test was made to tell a slide (changing non-zero offsets) from the URL changing a moment before React commits. |
| Canonical domain (live) | **VERIFIED** `https://www.gotobuda.com`: canonical, `og:url`, `robots.txt` (Allow + sitemap) after `NEXT_PUBLIC_SITE_URL` was set. |
| GitHub logs for the failing `build` and `booking-partners` jobs at 8a29866 | **BLOCKED** (login required); the 429 cause was reproduced locally instead. |

## Release

| Item | Status |
| --- | --- |
| CI (verify, build+Playwright, CodeQL, security, photos, galleries, booking-partners) | see PR #1 checks |
| Preview verification | **BLOCKED**: deployment protection (302 to vercel SSO). Not bypassed. Set `PW_VERCEL_BYPASS` (automation bypass secret) to run `e2e` against the preview. |
| Merge / production deploy | **NOT DONE**: live acceptance criteria above are not met. |
| Indexing | **OPEN**: site is `noindex` until `NEXT_PUBLIC_SITE_URL` names the confirmed primary domain. |

## Owner actions (in order)

1. **TourDesk diagnosis (≈1 minute):** `vercel env pull .env.diagnose --environment=production`,
   then `node --env-file=.env.diagnose scripts/diagnose-tourdesk-catalog.mjs` (adapted from goTene's
   proven diagnosis; read-only, never prints the key), delete `.env.diagnose`. Send the JSON verdict. If `NO_BUDAPEST_INVENTORY`: ask TourDesk to enable Budapest
   inventory for the affiliate account. If `AUTH_FAILED`: the key in this Vercel project is
   missing/invalid/for the wrong account; fix the Production (and Preview) value and redeploy.
2. **Preview access:** create a "Protection Bypass for Automation" secret and give it to the
   test run as `PW_VERCEL_BYPASS` (never commit it), or open the preview signed in and run
   `npm run test:e2e` yourself with `PW_BASE_URL`.
3. **Sanity seed:** add GitHub environment `sanity-production` with secret `SANITY_API_TOKEN`
   (Editor), run workflow "Seed Sanity (manual)" first as dry run, then for real; then
   `npm run sanity:verify`.
4. **Sanity Studio:** sign in at `/studio`, edit and publish one attraction, confirm the page
   updates (webhook below); check Project → API → CORS origins lists the production and
   preview origins with credentials only.
5. **Webhook:** create it per `SECURITY.md` and set `SANITY_REVALIDATE_SECRET` in Vercel.
6. After the seed: set `REQUIRE_SANITY_CONTENT=1` in Production and run
   `PW_EXPECT_SANITY=1 npx playwright test e2e/sanity-content.spec.ts`.
7. Confirm the primary domain and set `NEXT_PUBLIC_SITE_URL`.
8. Merge PR #1 only after the above; PR #10 and PR #2 are already contained in it.

## Marketplace UI status

| Area | Status |
| --- | --- |
| `/tours` UI (search, tabs, filters, sort, chips, Load more, drawer, no-JS GET form) | MOCK VERIFIED (desktop + mobile) |
| Cards link only to GoToBudapest product pages; provider URL only at the end of a product page | MOCK VERIFIED |
| `/tours/tiqets/[id]` (details, availability, 404/403/empty/malformed/not-for-sale) | MOCK VERIFIED; LIVE UNVERIFIED |
| Editorial + home product rows (max 6, "See all tours", nothing when none) | MOCK VERIFIED |
| Live provider responses through the UI | BLOCKED (no live run performed) |

Tests: `tests/marketplace-ui.test.ts`, `tests/marketplace-providers.test.ts`,
`e2e/marketplace-ui.spec.ts` (runs on the mocked server, port 3101), `e2e/booking-offers.spec.ts`
(its three BookableOffers assertions were rewritten for the new markup and API).

## Image quality (issue #11)

Blurry tour-card photos had two causes in our code, neither a proven limit of the provider's photos:

| Surface | Defect | Fix | Status |
|---|---|---|---|
| Production `/api/budapest-offers` (older code, Viator) | Used the FIRST variant of the cover image: a 100x100 thumbnail (`media-cdn.tripadvisor.com/.../attractions-splice-spp-100x100/...`, 4-6 KB; 8 of 8 sampled offers measured 100x100) stretched into a ~400 px card. | `lib/budapest-offers.ts` picks from the real renditions, never below 320 px, and emits `photoSrcSet`. | MOCK VERIFIED (unit); LIVE shows the old code until deployed |
| `/tours`, home and editorial rows (`ProductCard`) | One `src` of >= 480 px through `next/image` with `unoptimized` (no resizing, no srcset): too small for 2x screens. | Plain `<img srcSet sizes>` built from the Viator renditions by `lib/marketplace/images.ts`; `sizes` mirrors the measured grid widths (grid and row layouts). | MOCK VERIFIED |
| TourDesk cards | Single `photoUrl`. | Used as supplied (no resizing, no invented sizes). | MOCK VERIFIED |
| Tiqets cards | Key tier returns no licensed photo. | Designed text card (badge + categories), no image box. | MOCK VERIFIED |
| Viator product with only thumbnail renditions (< 320 px) | n/a | No image: text card (never a stretched thumbnail). | MOCK VERIFIED |

Source-limited vs variant-limited: a product is `sourceLimited` (and its card carries
`data-source-limited="true"`) only when the provider's widest card-sized rendition is narrower than a
2x card; it is then shown at its natural size with `object-fit: cover`, never enlarged by us. Cards
whose provider only supplies thumbnails show the placeholder. Real per-product counts need a live
Viator key (BLOCKED here); the inventory is `GET /api/marketplace/search?provider=viator` ->
`items[].image.variants` / `image.sourceLimited`.

Rules (all in `lib/marketplace/images.ts`): only renditions the API returned; width >= 320; at most 4
srcset candidates, none above 1200 px (one fallback up to 1920 px only when nothing narrower reaches a
2x card); at most 6 stored variants per product. Layout is unchanged (16:10 box, `object-fit: cover`,
width/height attributes, no CSS blur or scaling); above-the-fold cards (first 3 on `/tours`) are
`eager` + `fetchpriority=high`, the rest `lazy`. Licensing: only official provider imagery of the exact
product, served from the provider CDN with `referrerPolicy="no-referrer"`; Tiqets images stay unused.

Performance: JSON grows by at most 6 `{src,width,height}` entries per Viator product (~0.6 KB raw, much
less gzipped; estimated, not measured with real URLs). Images: a card now downloads one rendition
(480-1080 px) instead of a 100 px thumbnail, i.e. more bytes per card than before (that was the defect)
but bounded by the 1200 px cap and by lazy loading; no layout shift (fixed aspect box, intrinsic size).

Tests: `tests/marketplace-images.test.ts` (selection, bounds, thumbnails, source-limited);
`e2e/image-quality.spec.ts` (MOCKED, desktop DPR1/DPR2 and mobile DPR2/DPR3, `/tours`, TourDesk, Tiqets,
home and `/experiences/danube`): the true bitmap width of the chosen file is compared with the card's
rendered width x devicePixelRatio and with the variant width declared in the srcset, no thumbnail is
ever requested, no CSS blur, correct eager/lazy. Real-provider spot checks: BLOCKED (no key).
`e2e/support/mock-list-fixtures.mjs` gained rendition sets VP001 (large), VP003 (720 max), VP004 (400
only), VP005 (thumbnails only). The spec runs in the `booking-ui-desktop` project (regex in
`playwright.config.ts` extended with `image-quality`).
