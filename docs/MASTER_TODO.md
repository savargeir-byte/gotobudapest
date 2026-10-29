# GoToBudapest master TODO

**This file is the permanent source of truth for unfinished work. Every development phase must read it
before starting and update it before finishing.** `docs/RELEASE_STATUS.md` holds the dated evidence behind
the entries here and must be kept in step with it.

Last updated: 2026-10-29 (main `d5f8890`; PR #26, #27, #28 merged; live production read-only verification completed).

Rules for this file

- A task is **DONE** only with the evidence named for it, observed on the real service, a real browser or the
  real dataset. Merged code, mock tests and green CI alone are not enough (they are listed as supporting evidence).
- Statuses: DONE, IN PROGRESS, BLOCKED (waiting for a permission, credential or provider), TODO.
- Priority: P0 launch-critical, P1 important, P2 useful.
- Never delete an unresolved task. Link every PR and commit that touches one.
- Permanent project rules: no Trip Planner; native TourDesk checkout stays disabled; no real bookings; no
  fabricated products or prices; GoIceTravel and goTene are read-only references; no Vercel access from the
  assistant (the owner changes Vercel and Sanity settings).

## Totals

| Status | Count |
| --- | --- |
| DONE | 20 |
| IN PROGRESS | 4 |
| BLOCKED | 15 |
| TODO | 6 |
| FUTURE | 5 |

## 1. DONE (verified)

| ID | Pri | Task | Ref | Evidence observed |
| --- | --- | --- | --- | --- |
| D-001 | P0 | Site structure: districts, experiences, guides and 100 attraction pages; no Trip Planner | PR #1, #3, #4, #7 | Live pages answer 200 (home, attractions, guides, experiences, neighbourhoods); sitemap lists them; no `/plan` route |
| D-002 | P0 | Canonical domain `https://www.gotobuda.com`, apex 308 to www, robots allow + sitemap | PR #1 | Live: canonical, `og:url`, `robots.txt`, `sitemap.xml`, apex redirect (2026-10-28) |
| D-003 | P1 | Self-canonical `noindex, follow` product pages; WebSite and Organization JSON-LD on the home page | PR #20 | Live at `4feff4f` (2026-10-28) |
| D-004 | P0 | Marketplace `/tours` with live Viator and Tiqets: search, categories, sorting, cursor paging | PR #1 | Live API: Viator 1,249, Tiqets 56 (40 reachable), 140 items over 6 pages with 0 duplicates, price/rating/popularity sorts ordered |
| D-005 | P0 | Every card opens an internal product page; provider hand-off is the last step, exact API URL | PR #1 | Live: Viator `35015P1` and Tiqets `1094521` pages carry one provider link each, unchanged API URL |
| D-006 | P0 | Blurry card images fixed (real renditions, responsive `srcset`) | #11 (closed), PR #1 | Live: 140 of 140 sampled products have no image under 320 px; the 720x480 file measures 720x480 |
| D-007 | P1 | Credited venue photos on Tiqets cards (exact-venue matcher, "featured stop" labelling) | #22, PR #23 | Live API: 18 of 40 products carry `venuePhoto`; all 22 image files answer 200 as WebP; every credit has https licence and source URLs. Visual check: see B-008 |
| D-008 | P0 | Native TourDesk checkout is disabled in production | PR #1 | Live: `POST /api/booking/tourdesk/checkout` answers 503 (2026-10-29) |
| D-009 | P0 | Security baseline: CSP/HSTS, per-client rate limits (31st request = 429), signed webhook design, CodeQL, Dependabot | PR #1-#24 | Unscaled-server test proves 429 on the 31st request (local); CodeQL and CI green on every merged PR |
| D-010 | P1 | Scroll-to-top on internal navigation (anchors and Back/Forward excepted) | PR #1 | 20 real-browser tests (desktop + mobile, local production build). Live browser check: see B-009 |
| D-011 | P0 | CI release gates | PR #1, #20, #23, #24 | GitHub: verify, build, booking-partners, CodeQL, analyze green on each merge |
| D-012 | P1 | TourDesk failures are visible as real HTTP statuses | PR #24 | Live note: `geo error (pageSize 500: HTTP 500); geo error (pageSize 100: HTTP 500); scan error (HTTP 500)` |
| D-013 | P1 | Viator live schedules and availability (read-only) | PR #1, #20 | Live: 120+ bookable dates, age bands and 15 start times for `35015P1`; no booking endpoint used |
| D-014 | P1 | Content validation tooling passes | PR #1 | 2026-10-29: `validate-content` (100 places, 119 photos), histories, inline photos (40 placements), `verify-photos` (106 source pages answer 200), seed `--plan` and `--dry-run` |
| D-015 | P2 | Master TODO exists and is maintained | this PR | This file |
| D-016 | P1 | Sanity CORS for `https://www.gotobuda.com` with credentials | owner | Live preflight answers the origin with `Allow-Credentials: true` |
| D-017 | P1 | Read-only content audit of the seed data | this PR | `scripts/audit-content.ts` run 2026-10-29: see section 4 (T-001 to T-007) for the gaps it found |
| D-018 | P0 | TourDesk root cause diagnosed: the minimal global search `{"page":1,"pageSize":20}` (the request GoIceTravel's working integration sends first) answers HTTP 500, as do geo (pageSize 100 and 20) and the scan (pageSize 100). Our request matches the official swagger; the failure is on TourDesk's side for this account (or a TourDesk outage) | #21, PR #25 | Live public note on 2026-10-29 09:10 UTC: `probe error (page 1 pageSize 20: HTTP 500); geo error (pageSize 100: HTTP 500); geo error (pageSize 20: HTTP 500); scan error (HTTP 500)`. Issue #21 stays open until TourDesk restores or explains access (B-006, B-007) |
| D-019 | P1 | Viator availability total price shown (real shape `totalPrice.price.recommendedRetailPrice`) | PR #25 | Live 2026-10-29: `35015P1`, 2 adults, 2026-11-13: 15 start times each with `totalPrice.recommendedRetailPrice` 50 and a line of 2 x 25; no `priceShape` needed any more |
| D-020 | P0 | TourDesk temporarily hidden from public marketplace while new API access is pending; adapter retained and checkout stays off | PR #27 (`e8ccee1`), #21 | Live 2026-10-29: `/tours` says TWO PROVIDERS and has no TourDesk filter/text; public `/api/marketplace/search` returns 27 products and only `viator`, `tiqets` status keys; `?provider=tourdesk` returns HTTP 400; old `/tours/tourdesk/12-2` redirects to `/tours`; `/privacy` lists only Viator and Tiqets. CodeQL and all CI checks passed. B-006/B-007/B-015 remain BLOCKED for replacement API. |

## 2. IN PROGRESS

| ID | Pri | Task | Ref | Evidence required for DONE | Blocking dependency |
| --- | --- | --- | --- | --- | --- |
| T-001 | P1 | Long-form bodies for the attractions. **12 of the 100 published on live site after PR #28** (Parliament, Buda Castle District, Fisherman's Bastion, Matthias Church, St. Stephen's Basilica, Heroes' Square, Széchenyi, Gellért, Dohány Street Synagogue, House of Terror, Great Market Hall, Margaret Island): 190-320 words of main text plus a 25-37 word description, 3-4 tips and linked sources each; facts from Wikipedia and Budapest Info; no prices or opening times. **88 remain** | PR #28 | Audit reports 0 "no long-form body"; each text checked against its sources; pages live | 88 remaining; sourced long-form writing |
| T-002 | P1 | Histories for attractions that had none. **7 added and deployed in PR #28** (Heroes' Square, Rudas, Lukács, Children's Railway, Vienna Gate, Tomb of Gül Baba, Zero Kilometre Stone; each cited; PR #6's two labelled traditions folded in). **30 remain** (was 37) | PR #28, #6 superseded | Audit reports 0 "no history"; every history sourced | 30 remaining; source verification |
| T-005 | P1 | Hero photographs. **1 of 6 added** (Budapest Gallery, Commons CC BY-SA 4.0 by Gámán Zsuzsa, cropped from a portrait original). **5 remain**: Szamos Chocolate Museum (the only Commons files show the Szentendre museum, a different venue), IKONO, Budapest History Museum (no exact-subject licensed photo), Museum of Illusions, Lupa Beach (no Commons photo) | PR #28 | A licensed, accurate photo with credit for each, or an honest design fallback | Licensed photos (see B-011) |
| T-007 | P1 | Guides. **5 of 8 expanded and deployed with PR #28** with one fact-checked section and one credited inline photo each (3 days, thermal baths, Castle District, Danube cruises, downtown Pest walk). Remaining: getting around, bars and nightlife, food and markets | PR #28 | Word counts and inline placements meet the brief; `validate-inline-photos` passes (45 placements now) | 3 remaining guides |

(P-001 and P-002 were verified live on 2026-10-29 and moved to DONE as D-018 and D-019.)

## 3. BLOCKED

| ID | Pri | Task | Ref | Evidence required for DONE | Blocking dependency |
| --- | --- | --- | --- | --- | --- |
| B-001 | P0 | Sanity write credential | - | `SANITY_API_TOKEN` (Editor, or create + upload) available to the seed: environment `sanity-production` on GitHub, or a local shell | Owner creates the token at sanity.io/manage (project `ut6qxuke`, API, Tokens). Not obtainable by the assistant |
| B-002 | P0 | Run the idempotent seed (no `--force`): 100 attractions, 8 guides, 3 experiences, 2 neighbourhoods, 2 regions, 13 categories, 1 settings, 106 images | - | Live dataset query returns 129 published documents and the images; today 0 documents, 30 assets | B-001 |
| B-003 | P0 | `npm run sanity:verify`, Playwright with `PW_EXPECT_SANITY=1`, and a render check of attractions, guides, experiences and neighbourhoods from Sanity | - | All pass against production data | B-002 |
| B-004 | P0 | Signed revalidation webhook: `SANITY_REVALIDATE_SECRET` in Vercel Production plus the matching webhook in Sanity; publishing a document updates its page | - | Unsigned POST answers 401 (today 503); a real publish changes the live page | Owner (Vercel and Sanity settings) |
| B-005 | P1 | Vercel Firewall rate limit for `/api/revalidate` | - | Rule exists | Owner (Vercel) |
| B-006 | P0 | **BLOCKED: waiting for new API access from the owner.** Real TourDesk Budapest products shown: EUR prices, images, internal pages, no Iceland product labelled Budapest. Paused and hidden (P-003) | #21 | `GET /api/marketplace/search?provider=tourdesk` returns genuine products with real prices; product page opens | TourDesk fixing HTTP 500 for the account (B-007) and the account holding Budapest inventory |
| B-007 | P1 | **BLOCKED: waiting for new API access from the owner.** Support request to TourDesk (the minimal TourSearch answers HTTP 500; ask about account authorisation and Budapest inventory). Text drafted 2026-10-29; no further TourDesk diagnostics are run while paused | #21 | Request sent from the account's e-mail address and answered; or inventory shown (B-006) | Owner sends it; TourDesk reply |
| B-008 | P1 | Tiqets cards checked visually on the live site (venue, `srcset` WebP, alt text, credit links, mobile and desktop); then close #22 | #22 | Screenshots/notes from an unfiltered network | The browser on the development machine is blocked from `www.gotobuda.com` by the organisation web filter |
| B-009 | P1 | Live desktop and mobile QA of the site (scroll-to-top, Back/Forward, anchors, marketplace filters, Load more) | - | `PW_BASE_URL=https://www.gotobuda.com npx playwright test e2e/scroll-top.spec.ts e2e/site.spec.ts --project=desktop --project=mobile` passes from an unfiltered network | Same web filter |
| B-010 | P1 | Decide the Tiqets partner value (`goicetravel-19` is returned by the API for this key) | - | Owner confirms it is intended, or a GoToBudapest partner and key are issued and set | Owner and Tiqets |
| B-011 | P2 | Photographs for Cat Museum, IKONO and Pinball Museum (no licensed Commons photo exists; the only pinball file is a poor night facade) | #22 | A correctly licensed, accurate photo per venue, with credit | External photography or permission |
| B-012 | P2 | New Sanity-published pages appear in the sitemap | - | Live sitemap lists them | B-002 |
| B-013 | P2 | Submit the sitemap to Google Search Console and Bing Webmaster | - | Both report the sitemap read | Owner accounts |
| B-014 | P2 | Enable Dependabot security updates and secret scanning | - | GitHub settings show them on | Owner (GitHub settings) |
| B-015 | P1 | **BLOCKED: waiting for new API access from the owner.** TourDesk-first priority for equivalent products verified with real TourDesk data | #21 | A product present at TourDesk and another provider shows once, from TourDesk | B-006 |

## 4. TODO

| ID | Pri | Task | Ref | Evidence required for DONE | Blocking dependency |
| --- | --- | --- | --- | --- | --- |
| T-003 | P1 | PR review. **PR #6 was closed as superseded after PR #28 merged (relevant sourced stories incorporated; no duplicate history merge). **PR #5** (16 sacred sites, 14 files, images on the Sanity CDN): content is distinct (no duplicate of the 100), but it conflicts with main in 3 files (`attractions/page.tsx`, `home.tsx`, `attraction-editorial.ts`) because main now reads content through `loadContent()` and the route group; it must be rebased, its seed and validator counts (100 to 116) and credits re-checked, and the Sanity seed extended before merging | PR #5, #6 (closed) | PR #5 rebased with passing validators and CI; owner authorises the merge | PR #5 rebase and compatibility QA |
| T-004 | P2 | Expand the one-line descriptions (5-18 words) to at least 40 words (81 remain; the 12 long-form attractions have 25-37 words) | - | Audit reports 0 short descriptions | - |
| T-006 | P1 | The 3 "incomplete credits" (Pesti Vigadó, Kunsthalle, Normafa) are public-domain photos with author, source page and licence name; a public-domain work has no licence page to link, so the audit rule was corrected (done in PR #28). Still open: replace 3 uncredited shared hero images (Matthias Church, Hungarian Parliament, Fisherman's Bastion) with the credited exact photos in `lib/photos.json` | - | Audit reports 0 "incomplete credit" and 0 "shared design artwork"; owner approves the visual change | Owner approval (the shared artwork is part of the current look) |
| T-008 | P2 | Review the Dependabot PRs #12-#19 (TypeScript 7, ESLint 10, Next/React group, next-sanity 13.4, Actions majors) one by one | #12-#19 | Each passes typecheck, lint, unit, build, Playwright and CI before merge | - |
| T-009 | P2 | Accessibility audit (axe) of the marketplace, product pages and editorial pages | - | Report with no serious violations | - |
| T-010 | P2 | Performance check (Lighthouse, Core Web Vitals) of `/`, `/tours` and a product page | - | Report with budgets | - |

## 5. FUTURE (after launch)

| ID | Pri | Idea | Condition |
| --- | --- | --- | --- |
| F-001 | P2 | Native TourDesk checkout pilot (and re-enabling TourDesk in the marketplace by setting `TOURDESK_MARKETPLACE_ENABLED=true` once a working API has been tested) | Only after real Budapest products and the real checkout behaviour are verified, and with an explicit owner decision. Stays disabled until then |
| F-002 | P2 | Own Tiqets partner id and key for GoToBudapest | After B-010 |
| F-003 | P2 | Commissioned or own photography for venues without a licensed photograph | After B-011 |
| F-004 | P2 | Alerting when a provider returns an error state for more than a day | After TourDesk is understood |
| F-005 | P2 | Periodic inventory snapshots per provider to spot regressions | After launch |

## Next highest-priority executable tasks

1. TourDesk public hiding is VERIFIED and complete (D-020). Keep B-006/B-007/B-015 BLOCKED pending the owner's replacement TourDesk API; do not re-enable it.
2. If the owner provides `SANITY_API_TOKEN`: B-001, then B-002 and B-003 in one run.
3. Content: rebase PR #5 (T-003), then continue T-001 and T-002 (the next 88 long-form texts and 30 histories), which do not need credentials.
