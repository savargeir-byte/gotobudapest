# Release status: Sanity + booking (2026-10-26)

> The open work and task totals are tracked in `docs/MASTER_TODO.md` (the source of truth). This file holds the
> dated evidence behind it.

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

## Live verification after PR #25 was deployed, 2026-10-29 09:10 UTC

| Item | Status | Evidence |
| --- | --- | --- |
| TourDesk minimal request | **VERIFIED (live): HTTP 500** | The public TourDesk note reads `probe error (page 1 pageSize 20: HTTP 500); geo error (pageSize 100: HTTP 500); geo error (pageSize 20: HTTP 500); scan error (HTTP 500)`. The probe is `{"page":1,"pageSize":20}`, the first request of GoIceTravel's working integration. Our body matches the official swagger, so the failure is on TourDesk's side for this account (or a TourDesk outage). Support request drafted (B-007); issue #21 stays open. |
| Viator availability price | **VERIFIED (live)** | `35015P1`, 2 adults, 2026-11-13: 15 start times, each with a total of 50 EUR and a line of 2 x 25 EUR (the product's "from" price is 25 EUR). |

## Phase 14 status, 2026-10-29 (main 1a83e11; task list: docs/MASTER_TODO.md)

| Item | Status | Evidence |
| --- | --- | --- |
| TourDesk: live HTTP statuses | **VERIFIED (live)** | The public note on `GET /api/marketplace/search?provider=tourdesk` reads `geo error (pageSize 500: HTTP 500); geo error (pageSize 100: HTTP 500); scan error (HTTP 500)`. Not an empty catalogue, not a credentials error. |
| TourDesk: our request shape against the official contract | **VERIFIED (documentation)** | `https://api.tourdesk.io/swagger/v1.0/swagger.json`: `POST /api/v{api-version}/TourSearch`, header `ApiKey`, body `TourSearchModel` with `page`, `pageSize`, `searchParameter`, `geolocation {lat, lon, radius}` and the filter fields. Our URL (`/api/v1.0/TourSearch`), header and the geolocation body match it exactly. The contract says nothing about the first page index or a maximum page size. |
| TourDesk: comparison with the working integrations | **VERIFIED (read-only code reading)** | GoIceTravel (works against TourDesk in production) uses the same transport and header, `page: 1` and `pageSize` 20, 50 or 100, and never sends `pageSize: 500`; its own notes say large page sizes are unstable. goTene uses `page: 0` and `pageSize: 500` for its own reseller account. All three of our requests combined those shapes (geo page 0 at 500 and 100, scan page 1 at 500). |
| TourDesk: root cause | **UNPROVEN** | Not demonstrable from code or documentation. Candidates: this account's API rejects page 0, page sizes of 100 or more, or the geolocation field with HTTP 500, or answers HTTP 500 for any search. The product read endpoint accepts the key (404 for ids 1-1 to 50-1, no 401). |
| TourDesk: change in this PR | **MOCKED** | Discovery now sends a minimal probe first (`page 1, pageSize 20`, GoIceTravel's first inventory request), then geo at pageSize 100 and 20, then the scan at pageSize 100; a probe without any answer stops discovery at once. The public note then reads, for example, `probe error (page 1 pageSize 20: HTTP 500); geo error (pageSize 100: HTTP 500); geo error (pageSize 20: HTTP 500); scan error (HTTP 500)`. If even the probe answers HTTP 500 the failure is account-side and that sentence is the evidence for the TourDesk support request. `npm run diagnose:tourdesk` now prints an eight-request matrix (page 0/1, sizes 20/100/500, geo, text) with status, size, row count and totalCount. |
| Viator availability price | **FIXED in code (mock and unit tested); live after deploy** | The live `priceShape` (PR #24) showed `totalPrice.price.recommendedRetailPrice`, `partnerNetPrice`, `bookingFee`, `commission`, `partnerTotalPrice` and the same under `lineItems[].subtotalPrice.price`. The parser looked only at `price.special` and `price.original`. It now reads `price.recommendedRetailPrice`; the partner net, fee, commission and total are never used as a retail price. |
| Content audit of the seed data | **VERIFIED (read-only)** | `scripts/audit-content.ts`: 100 attractions, none with a long-form body, 90 with a description under 15 words (median 12), 63 with a history (37 without), 94 with a hero photo (91 credited; 3 use uncredited shared artwork, 3 have an incomplete credit, 6 have none), 13 with galleries (37 images; the 6 remote Sanity CDN images all answer 200); 8 guides of 369-531 words with 5 sections each. 216 distinct image references, no missing local file. The seed itself (`--plan`, `--dry-run`) validates; the live dataset still holds 0 documents and 30 assets. |
| Sanity migration and webhook | **BLOCKED** | Unchanged: no write token and no Vercel access for the assistant. Live: dataset 0 documents, unsigned `POST /api/revalidate` answers 503. See B-001 to B-005 in the master TODO. |
| Native TourDesk checkout | **VERIFIED off** | Live `POST /api/booking/tourdesk/checkout` answers 503. |

## Phase 13 status, 2026-10-28 (production at 4feff4f)

| Item | Status | Evidence |
| --- | --- | --- |
| Production runs main 4feff4f | **VERIFIED (by behaviour)** | GitHub: Vercel status "success" for 4feff4f (merge of PR #23). Live: homepage JSON-LD WebSite + Organization (PR #20), self-canonical on `/tours/viator/<code>` and `/tours/tiqets/<id>` (both noindex, follow), `venuePhoto` in the search API (PR #23). The deployed SHA cannot be read directly. |
| Tiqets cards with a photo (live) | **VERIFIED** | Of 40 reachable products: **18 with a credited venue photo, 22 without**. The 22 image files answer 200 as `image/webp`; every credit has https licence and source URLs. Placements checked against the titles: St. Stephen's Basilica x3, Dohány Street Synagogue (ticket, Great Synagogue tour; featured stop for the museum complex and the Kazinczy tour), Széchenyi Spa, Lukács Spa, Matthias Church (venue and featured), House of Terror, Madame Tussauds, Memento Park x2, Gödöllő Palace, Hungarian Parliament (featured stop) and Hospital in the Rock (featured stop). The browser look of the cards on the live site is **BLOCKED** from this machine (organisation web filter). |
| Cat Museum, IKONO, Pinball Museum | **NO LICENSED PHOTO FOUND** | Commons searches (Cat Museum, Macskák múzeuma, IKONO, Pinball Museum, Flippermúzeum) return nothing for the first two and only a night-time street facade (CC0) for the pinball museum, rejected for quality. They keep the text card. |
| TourDesk: what production tells us | **PARTLY DIAGNOSED** | Without a key (and without Vercel logs) the product pages are a read-only probe of the key: `/tours/tourdesk/<id>` answers **404** for 1-1 .. 50-1, 500-1 and 12-1 and **500** for 100-1, 1000-1, 5000-1, 12-2, 12-3, 1-2 and 1-3. A rejected key would produce 500 for every id, so the key is **accepted** for product reads and TourDesk answers for provider 1 (the account's catalogue appears to be that provider, consistent with GoIceTravel's finding that the account is Iceland-focused). The 404s are "not found or not a Budapest product". This does not yet explain why the search discovery fails in under 2.5 s with no 401/403. |
| TourDesk: public diagnostic | **ADDED (this PR), live after deploy** | The marketplace's TourDesk note now names the strategies and real HTTP statuses, for example `TourDesk is temporarily unavailable (geo error (pageSize 500: HTTP 400); geo error (pageSize 100: HTTP 400); scan error (HTTP 400))`. Statuses, strategy names and sizes only: no key, URL, body or provider text. After the deploy, `GET /api/marketplace/search?provider=tourdesk` shows the cause without Vercel access. |
| Viator availability without price | **UNPROVEN (re-tested live)** | After the nested-price parser (PR #20) the live `/availability/check` for 35015P1 still returns start times with `available: true` and no price lines. The check response now also carries `priceShape` (key paths and JSON types of the first item, never values) when availability is confirmed but no price is recognised, so the real container can be read from the live API after the next deploy. |
| Sanity migration, webhook secret | **BLOCKED** | Unchanged: no `SANITY_API_TOKEN` or Sanity login on this machine, GitHub CLI not authenticated, no Vercel access (`SANITY_REVALIDATE_SECRET` not set: unsigned POST to `/api/revalidate` answers 503). |

## Phase 12 status, 2026-10-28 (Tiqets photo audit, PR #23)

| Item | Status | Evidence |
| --- | --- | --- |
| Audit of the 31 unmatched Tiqets products | **VERIFIED (live titles, local matcher)** | 40 Tiqets products are reachable on production. Before: 9 with a photo, 31 without. Now **18 with a credited photo, 22 without**: 9 of the 31 gained one. Gained: Memento Park (entry, guided tour), Sisi's Gödöllő Palace, Great Synagogue + Jewish Quarter walking tour, and as labelled featured stops: Hungarian Jewish Museum & Dohány Synagogue Complex and Kazinczy & Dohány walking tour (Dohány Street Synagogue), Castle District & Hungarian Parliament tour (Hungarian Parliament), Castle District walking tour + Matthias Church entry (Matthias Church), WWII & Cold War walking tour + Hospital in the Rock visit (Hospital in the Rock). |
| New photographs | **VERIFIED** | `memento-park` ("Memento Park, Budapest 01.jpg", Pudelek, CC BY-SA 4.0) and `godollo-royal-palace` ("Royal Palace of Gödöllő 004.JPG", Rlevente, CC BY-SA 3.0) from Wikimedia Commons, added with `scripts/add-venue-photos.mjs` (author and licence read from the Commons API, 640/1280 WebP). `scripts/verify-photos.mjs`: 119 entries, 106 source pages answer 200, licences allowed. `scripts/validate-content.mjs` passes. |
| Still without a photo (22) | **BY DESIGN / no licensed source found** | Not about one named place: evening cruise, Budapest Card, hop-on buses, walking tours of Buda or Pest, self-guided highlights, Grand City Tour, Trabant tour, Puszta and Danube Bend day trips, four airport transfers, Memento Park Trabant transfer (a transfer, excluded). Named place without an acceptable licensed photo: Cat Museum (two products; no Commons file exists), IKONO, Vincent Hall (Frida exhibition). Budapest Pinball Museum: the only Commons file is a night-time street facade of poor quality, rejected. These keep the designed text card. |
| Rules | **VERIFIED (unit and mocked browser tests)** | One place must be named in the whole title (two named places: no photo); card/pass, hop-on and transfer products never get one; "venue" (the title is about the place) and "featured" (a single named stop, labelled "Featured stop: X. Photo of X, not a photo of this product.") are shown differently. |
| Live appearance | **BLOCKED until PR #23 is deployed** | Nothing of this is on production yet. Issue #22 stays open until the cards are checked on the live site. The browser on this machine is blocked from `www.gotobuda.com` by the organisation's web filter, so the check must be made from an unfiltered network. |

## Issues #21 (TourDesk) and #22 (Tiqets photos), 2026-10-28

| Item | Status | Evidence |
| --- | --- | --- |
| #21 TourDesk root cause | **BLOCKED (needs the key or the runtime log)** | Evidence gathered without the key: (1) `?provider=tourdesk` fails in 0.7-2.1 s on production, so it is not the 20 s search timeout or a serverless limit; (2) production does not say "rejected the credentials", so TourDesk did not answer 401/403 (the key is configured); (3) the API host and paths are right: without a key `POST /api/v1.0/TourSearch` and `GET /api/v1.0/Tour/{id}` answer `401 Invalid API Key` in about 0.1-0.2 s; (4) the code only produced "no HTTP status" for network errors, unreadable bodies or an oversized body. What remains open: a non-auth HTTP status (400/404/429/5xx) on the geo or scan request, or an unreadable/oversized body. The failure was never logged with its cause. Now: every failed discovery attempt is logged as `[offers] tourdesk discovery unavailable: ... geo:error(pageSize 500: HTTP 400); ...` (statuses and sizes only, no secrets), and `npm run diagnose:tourdesk` also prints TourSearch status counts and the largest body. Read the line in Vercel runtime logs after the next deploy, or run the diagnostic with the key. |
| #21 size cap (possible cause, UNPROVEN) | **FIXED / UNPROVEN as the cause** | `providerFetch` refused any provider body over 2 MB. Catalogue pages of 500 products can exceed that decoded, so the TourSearch call now has its own bound of 24 MB (`SEARCH_MAX_BYTES`); every other provider call keeps 2 MB. A refusal is logged with its size. Mock-tested (`tests/provider-fetch.test.ts`); whether the live failure was this cap is not known. |
| #21 misleading message | **FIXED (mock-tested)** | With one provider selected and failing, the page said "Results from the other providers are still shown" and also a generic "Tours are temporarily unavailable". It now says "TourDesk is temporarily unavailable, so no TourDesk products can be shown right now. Choose All providers to see the rest", with a "Show all providers" action, and no duplicate banner. |
| #21 real TourDesk tours | **BLOCKED** | None can be shown until the cause is known; nothing is fabricated and native checkout stays off. |
| #22 Tiqets cards without photos | **FIXED (mock-tested; live after deploy)** | Tiqets products still carry no supplier photo. A card shows a photograph only when the title names ONE exact venue we hold a credited photo of: the venue must start the title's subject (or follow in/at/inside/of/to), the product is not a card/pass, hop-on, transfer, airport or from-Budapest product, and exactly one attraction matches. The photo is our own 640/1280 WebP (`lib/photos.json`), with descriptive alt, reserved width/height, the wording "Photo of <venue>, not a photo of this product", the author, a licence link and a source link (Wikimedia Commons). Everything else stays a text card. Viator cards are untouched. Applied to /tours (server-rendered and Load more), the home row, editorial rows and the Tiqets product page. |
| #22 live match count | **VERIFIED (live titles, local matcher)** | Of the 40 Tiqets products reachable on production: **9 matched, 31 unmatched** (St. Stephen's Basilica x3, Dohány Street Synagogue, Széchenyi Spa, Lukács Spa, Madame Tussauds, House of Terror, Matthias Church). Excluded on purpose: city card, hop-on bus, transfers, multi-stop walking tours, and venues we hold no credited photo of (Cat Museum, IKONO, Memento Park, Pinball Museum). The credit has no author URL in our data; the source link is the Commons file page, which names the author. |

## Phase 11 status, 2026-10-28 (PR #20, head 8e223e7 plus the diagnostic script)

| Item | Status | Evidence |
| --- | --- | --- |
| PR #20 checks | **VERIFIED** | On 8e223e7: CodeQL, analyze, verify, build and booking-partners succeeded; GitHub reports the PR mergeable (clean). The photos and galleries jobs did not run for this change set. Preview not opened (deployment protection). **Ready to merge on the owner's authorization.** None of its fixes (product canonicals, homepage JSON-LD, nested price parsing, TourDesk log line) is live before it is merged and deployed. |
| Sanity CORS for `https://www.gotobuda.com` | **VERIFIED** | The preflight now answers `Access-Control-Allow-Origin: https://www.gotobuda.com` with `Access-Control-Allow-Credentials: true`. |
| Sanity content (live) | **BLOCKED** | Still 0 editorial documents and 30 image assets. The missing credential is `SANITY_API_TOKEN` (an Editor token, or a token that may create documents and upload images). It is not in this machine's environment, the Sanity CLI is not logged in (its config holds no auth), the GitHub CLI is not authenticated (so the manual "Seed Sanity (manual)" workflow cannot be started) and no Sanity or Vercel connector is attached. `--plan` and `--dry-run` pass. Nothing was written. |
| Sanity webhook | **BLOCKED** | An unsigned POST to `/api/revalidate` still answers 503: `SANITY_REVALIDATE_SECRET` is not set in Vercel Production (no Vercel access from here). Signature checking, size limits and the in-app rate limit are covered by tests; the Sanity-to-site round trip is untested. |
| TourDesk root cause | **BLOCKED (needs the key)** | Without a key the API answers `401 "Invalid API Key"` in about 0.1-0.2 s for both `POST /api/v1.0/TourSearch` and `GET /api/v1.0/Tour/{id}`, so the host and paths are right (same host as goTene). Production does not report "rejected the credentials", so its key is not refused with 401/403 and the failure is a non-auth answer or timeout that the live build does not log. The runtime log line added in PR #20 prints the strategies and HTTP statuses once it is deployed; `npm run diagnose:tourdesk` with the key gives the same answer immediately. |
| Viator `/availability/check` without prices | **UNPROVEN** | The real response structure could not be read: no key here, and Viator's OpenAPI page answers 403 to this machine. `npm run diagnose:viator` (new, read-only: GET product and POST availability/check only) prints every key path of the real response. No fallback prices are invented; the page shows a total only when the API supplies one. |
| Tiqets attribution | **OPEN (owner decision)** | The affiliate URL is the API's `product_url`, unchanged; the code sets no partner. The live value is `partner=goicetravel-19`, so the `TIQETS_API_KEY` in this project's Vercel environment is GoIceTravel's account and Tiqets credits clicks and sales to it, not to a GoToBudapest partner. Nothing was changed. Decide whether sharing the account is intended; otherwise Tiqets must issue a GoToBudapest partner and key. |

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
