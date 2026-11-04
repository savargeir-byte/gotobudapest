# Release status: Sanity + booking (2026-10-26)

> The open work and task totals are tracked in `docs/MASTER_TODO.md` (the source of truth). This file holds the
> dated evidence behind it.

Legend: **VERIFIED** = observed against the real service or by a real browser; **MOCKED** =
passes against a local stand-in (not proof of the real provider); **BLOCKED** = could not be
done, with the failed operation; **OPEN** = needs a decision or action by the owner.

## Phase 24 — final production verification of merged main `fcceee3`, 2026-11-04

Details: `docs/PHASE24-QA.md`, evidence in `docs/phase24/`.

| Item | Status | Evidence |
| --- | --- | --- |
| PR #41 | **MERGED** (`434bd9d`) | read on GitHub 2026-11-05 |
| PR #42 (T-018, fonts cache fix) | **OPEN, NOT MERGED** | head `4fb1c02`, `mergeable_state: clean`, CodeQL, build, verify, analyze, Vercel success (2026-11-05); the assistant has no GitHub authentication; production still answers 404 + `immutable` on the old font path |
| PR #43 (this documentation) | **OPEN** | head `fd9cb77`, clean, 5 checks success before the Phase 25 reconciliation commit |
| Live pages | **VERIFIED LIVE** | 128 pages 200 and 0 problems; 137 sitemap URLs all 200 with canonical equal to the sitemap URL and an h1; 284 internal links and images, 0 failing |
| Tour matching | **VERIFIED LIVE** | 101 contexts, 27 with products, 74 without, 76 cards (62 Viator, 14 Tiqets), 0 incorrect matches, no TourDesk |
| Marketplace | **VERIFIED LIVE** | 19 queries, 8 product pages, 0 problems; 143 distinct products (Viator 109, Tiqets 34) |
| TourDesk | **HIDDEN, VERIFIED LIVE** | none of the 137 pages contains it |
| Cache headers and fonts | **LIVE AS DESIGNED, ONE DEFECT** | see D-029 and T-018: the removed unhashed font path answers 404 with `immutable`; PR #42 (head `4fb1c02`) |
| Sanity | **BLOCKED (no token)** | dry run 146 documents, photo validation OK (144 entries, 131 source pages, licences allowed), production 0 of 146 |
| Full Playwright (fix branch, local production build) | **VERIFIED LOCALLY** | 602 passed, 51 skipped (Sanity-dependent), 0 failed |

## Phase 23 — verified post-merge follow-up, 2026-11-04

| Item | Current status | Evidence |
| --- | --- | --- |
| PR #39 | **MERGED** | Head `f4e047773e5f9411adb0b0d490b762972f3b8478` passed all eight GitHub checks, including CodeQL/build/Playwright. Merge commit `91ddccf23e4ee3a815ce37e6d85a69ffce597cd4` in `main`; GitHub deployment status SUCCESS. |
| Static asset caching | **VERIFIED LIVE after merge** | Public read-only HTTP: `/assets/danube-1280.webp` and `/assets/gotobudapest-logo.svg` HTTP 200 `public, max-age=86400, stale-while-revalidate=3600`; `/favicon.ico` same; hashed `/fonts/dm-sans-latin.9fea608a.woff2` HTTP 200 `public, max-age=31536000, immutable`; `/attractions/hungarian-parliament` HTTP 200 `public, max-age=0, must-revalidate`. All four hashed fonts were additionally fetched successfully (HTTP 200): `dm-sans-latin.9fea608a.woff2`, `dm-sans-latin-ext.a5d38fe9.woff2`, `manrope-latin.8c2def02.woff2`, and `manrope-latin-ext.2f733511.woff2`. |
| T-016 | **DONE** | Merge plus targeted production cache tests verified. Additional full 128-page/101-context post-merge audit recommended; Phase 23 original report provides the premerge live baseline but not this fresh full audit. |
| Sanity dependency PR | **MERGED: #40** | Replacement npm 10 lock for Dependabot #34/#36. CodeQL, build, verify and analyze passed; merge commit `fcceee3111930b08479fe96bcf5cb5b41f95c102`. Main's package and lockfile verified, top-level TypeScript 5.9.3 and ESLint 9.39.5 unchanged; #34/#36 closed as superseded, not merged. Sanity publication remains BLOCKED. |
| Documentation PR | **OPEN: #41** | Captures original Phase 23 findings with historical premerge status and this postmerge addendum. |
| Other blockers | **UNCHANGED** | B-001..B-004 Sanity publication (0/146 until authorized credentials); B-008/009 browser QA; B-016 production Core Web Vitals; 14 UNCERTAIN attractions require human editorial review; four missing licensed venue photos; shared-hero decision. TourDesk remains hidden. |

The historical report immediately below describes findings **before** PR #39 was merged. It is retained to preserve dated evidence and is not the current release state.

## Phase 23 — PR #39 re-read, pre-merge production baseline, Dependabot branch, 2026-11-03

Details: `docs/PHASE23-QA.md`, evidence in `docs/phase23/`.

| Item | Status | Evidence |
| --- | --- | --- |
| PR #39 | **OPEN, MERGEABLE, ALL 8 CHECKS GREEN, NOT MERGED** | head `f4e047773e5f9411adb0b0d490b762972f3b8478`, base main `2390a86`; no GitHub authentication here |
| Production cache headers | **OLD POLICY STILL LIVE** | everything `max-age=0, must-revalidate`; hashed font URL 404 until the merge |
| Live pages (pre-merge baseline, main) | **VERIFIED LIVE** | 128 pages 200, 0 problems, 284 links 0 failing, sitemap 137 URLs |
| Marketplace | **VERIFIED LIVE** | 19 queries, 8 product pages, 0 problems; 143 distinct products (Viator 109, Tiqets 34) |
| Tour matching | **VERIFIED LIVE** | 101 contexts, 27 with products (was 26), 74 without (was 75), 76 cards (was 75), 0 problems; provider inventory changed |
| TourDesk | **HIDDEN, VERIFIED LIVE** | 137 pages scanned, none contains it |
| Dependabot #34, #36 | **FIX BRANCH PUSHED, NO PR YET** | `chore/deps-sanity-npm10-lock` `9b2775d`: npm 10 `npm ci`, tsc, eslint, 138 tests, build pass locally |
| Sanity | **BLOCKED (no token)** | seed plan and dry run unchanged (146 documents), production 0 of 146 |

## Phase 22 — PR #39 state, cache policy review, Sanity readiness, 2026-11-03 (PR #39 open; no merge possible from the assistant)

Details: `docs/PHASE22-QA.md`.

| Item | Status | Evidence |
| --- | --- | --- |
| PR #39 | **OPEN, NOT MERGED** | first head `9c4cacf`: CodeQL, analyze, verify, build, histories, Vercel all green and mergeable; Phase 22 commits then changed the head, so checks run again. The assistant has no GitHub authentication |
| Cache policy | **CHANGED BEFORE MERGE (VERIFIED LOCALLY)** | the 7-day cache for `/assets` and the year-long `immutable` for non-hashed fonts were withdrawn: fonts now carry a content hash; `/assets` and the favicon cache one day (+1 h stale-while-revalidate); guard tests |
| Sanity seed fidelity | **2 DEFECTS FIXED (VERIFIED LOCALLY)** | guide hero disclosure caption was lost; shared artwork heroes would have gained a credit line the site does not show; field-level tests added |
| Sanity post-seed verification | **ADDED; production read 2026-11-03** | `npm run sanity:verify` compares 146 seeded documents one by one; production: 0 of 146 published |
| Dependabot #34, #36 | **FAIL `npm ci` (diagnosed)** | `Missing: typescript@7.0.2 from lock file` under npm 10; upgrade itself installs cleanly when the lock is regenerated with npm 10 |

## Phase 21 — live verification of the Phase 20 release, editorial follow-up, 2026-11-03 (main `2390a86`; branch `feat/phase21-live-qa`, no pull request yet)

PR #38 is merged (`2390a86`; its head had eight green checks including CodeQL) and deployed. The Phase 21 branch has no pull request (the assistant has no GitHub authentication), so CI and CodeQL have not run on it. Details: `docs/PHASE21-QA.md`, evidence in `docs/phase21/`.

| Item | Status | Evidence |
| --- | --- | --- |
| T-014 live tour matching, 101 contexts | **VERIFIED LIVE (read-only API)** | 26 attractions with products, 75 without, 75 cards, 0 problems; all 75 titles read and each names its attraction; named failure cases absent; DOM on production not observed |
| Viator and Tiqets | **VERIFIED LIVE (API)** | 19 queries, 144 products (Viator 110, Tiqets 34), 0 problems; categories, sorts, pagination, internal pages, affiliate URLs |
| TourDesk hidden | **VERIFIED LIVE** | `?provider=tourdesk` 400, old product link 307 to `/tours`, 0 mentions on `/tours`, no key in responses |
| 128 pages | **VERIFIED LIVE (HTTP)** | 128 of 128 answer 200, 284 links and images 200, sitemap 137 URLs, 0 problems; not a visual check |
| Homepage hero | **VERIFIED LIVE over HTTP, not rendered** | one picture with the 1280 px source for screens up to 900 px (127,730 bytes) and the 2000 px file (384,250 bytes) otherwise; deployed CSS has the hero rule and the phone shade; browser behaviour VERIFIED LOCALLY |
| Production Lighthouse, field Web Vitals (B-016), live browser QA (B-008, B-009) | **BLOCKED** | Edge: "Content blocked by your organisation"; Chrome: ERR_SSL_VERSION_OR_CIPHER_MISMATCH; PageSpeed Insights API 429; CrUX API 403 (needs a key) |
| Asset caching | **FOUND, FIXED IN BRANCH (VERIFIED LOCALLY)** | `/assets` and the fonts were served with `max-age=0, must-revalidate`. Final policy after review: font files renamed with a content hash and `immutable` for a year; `/assets` and the favicon (names without a hash, replaceable) `max-age=86400, stale-while-revalidate=3600`; guard tests |
| Editorial, T-013 | **37 corrections, model-based** | 1,614 claims, 249 corrections; attractions 36 VERIFIED, 66 CORRECTED, 14 UNCERTAIN; nothing upgraded by softening; no human sign-off |
| Photos, T-005 | **no legitimate image for 4 venues** | no reuse licence on the sites that load; Commons (Phase 20) and Sanity (0 assets) checked |
| Sanity | **VERIFIED LOCALLY, WRITE BLOCKED** | plan and dry-run identical twice: 146 documents, 116 histories, 17 galleries, 131 image files; production 0 documents; token not set; no `--force` |
| Local checks | **VERIFIED LOCALLY** | typecheck, lint, 138 unit tests, build, validators; full Playwright: 600 passed, 51 skipped, 0 failed (desktop and mobile, mocked providers; includes the accessibility, performance-guard and TourDesk-hidden specs) |

## Phase 20 — tour matching on production, mobile LCP, accessibility follow-up, 2026-11-03 (branch `feat/phase20-tour-matching-lcp`; not merged)

Main `4afe4ff`. The branch is stacked on PR #37 (docs, still open). No pull request exists for it (the assistant has no GitHub authentication), so CI and CodeQL have not run on it. Details: `docs/PHASE20-QA.md`, evidence in `docs/phase20/`.

| Item | Status | Evidence |
| --- | --- | --- |
| T-014 live tour matching audit | **VERIFIED LIVE (read-only API); fix in branch** | 101 contexts; production shows 27 attractions with products, 74 none, 86 products, 0 structural problems, but 21 of 121 matches were description-only mentions (generic tours on Chain Bridge, Heroes' Square, St. Stephen's Basilica, the Garden of Philosophers). Title-only matching on the same live data: 26 attractions, 75 none, 75 products, 0 problems |
| Viator and Tiqets | **VERIFIED LIVE (API)** | 19 queries, 145 products (Viator 110, Tiqets 35), https provider-domain booking URLs with partner parameters, positive prices, internal pages (8 sampled), 10 categories (`family` empty), sorts monotonic, page 2 without repeats, TourDesk absent; 0 problems |
| Mobile LCP | **EXPLAINED AND IMPROVED (lab, browser-applied throttling)** | Phase 19 improved every page measured; the Lighthouse simulation had said otherwise. Home hero rendition for phones: home LCP 5.1 s to 3.2 s. Production Lighthouse and field Web Vitals BLOCKED (B-016) |
| Accessibility follow-up | **FIXED IN BRANCH, VERIFIED LOCALLY** | hero contrast on phones, Escape closes the phone menu, decorative glyphs, axe incomplete items reviewed; no screen-reader testing |
| Editorial | **7 unsupported visitor statements softened or removed** | fact-check: 36 VERIFIED, 61 CORRECTED, 19 UNCERTAIN attractions; nothing upgraded to VERIFIED |
| Photos | **4 heroes still missing** | Commons searched again, nothing usable; shared artwork heroes untouched |
| Sanity | **READ-ONLY CHECKED, WRITE BLOCKED** | plan and dry-run identical twice: 146 documents, 116 histories, 17 galleries, 131 image files; production holds 0 documents; token not set; createIfNotExists only, no `--force` |
| Local checks | **VERIFIED LOCALLY** | typecheck, lint, unit tests, production build, validators; full Playwright: 598 passed, 51 skipped, 0 failed (desktop and mobile, mocked providers; includes the accessibility, performance-guard and TourDesk-hidden specs); 138 unit tests pass |
| CI and CodeQL for the Phase 20 head | **NOT RUN** | no pull request |

## Phase 19 — merged GitHub release and post-merge public verification, 2026-11-03

| Item | Status | Evidence |
| --- | --- | --- |
| Release PRs #31, #32 and #33 | **MERGED / GitHub CI VERIFIED** | #32 Actions: `dda5bf39`, all 9 checks green; #31 accessibility/assets: `f18839b2`, all 8 checks green after two CodeQL script findings were corrected (one URL-matching regex, one network-data-to-file sink); #33 Next/Sanity: `4afe4ff1`, all 5 checks green. GitHub also reports green build, verify, analyze, Dependabot and successful deployment status on combined `main`. Only GitHub was queried for deployment status; no Vercel account/API/CLI/dashboard access. |
| Combined package versions | **VERIFIED IN MAIN** | Next 16.4.3, next-sanity ^13.4.0, eslint-config-next ^16.4.3, axe-core 4.14.0; top-level package.json and package-lock.json are consistent. |
| Public page recheck after merge | **128 / 128 FETCHED AND RENDERED** | External public content fetch across all 116 attractions, 8 guides, and 4 index pages. Canonical, title and substantive body present for all. Root canonical differs only by an optional trailing slash. This tool does not expose each raw HTTP status; original `docs/PHASE19-LIVE-QA.md` separately recorded 128 HTTP 200 responses before Phase 19 merged. |
| Sitemap | **137 URLs OBSERVED** | Public `/sitemap.xml` extracted as 137 URL entries; no TourDesk text observed. |
| Viator/Tiqets | **PUBLIC READ-ONLY API SMOKE VERIFIED** | After merge: Viator filter 24 products, Tiqets filter 16, default 26, with no missing prices, HTTPS booking URLs or internal product URLs in these samples, zero TourDesk products. No checkout/availability transaction. The earlier, fuller 101-attraction-context run was not rerun after the merge; T-014 remains IN PROGRESS. |
| Accessibility, T-009 | **DONE WITH AUTOMATED AUDIT** | 15 page templates, marketplace/product desktop/mobile accessibility tests, six issues fixed, no axe violations in tested templates, PR #31 merged. Manual assistive-technology review still advisable. |
| Dependency review, T-008 | **DONE** | PRs #12–#19 reviewed and now closed; supported upgrades carried by merged PRs #32/#33. Unsupported TypeScript 7, ESLint 10 and @types/node 26 explicitly deferred, not installed. |
| Performance, T-010 and B-016 | **IN PROGRESS / FIELD DATA BLOCKED** | Smaller assets, better CLS and faster first paint in local lab. Mobile LCP did not consistently improve; production Lighthouse, field LCP and INP not measured. No claim of a production CWV win. |
| Sanity and editorial | **STILL OPEN** | Sanity publication B-001–B-004 requires authorized write access; model-based fact review still flags 21 UNCERTAIN attractions; 4 licensed heroes remain missing; 3 shared heroes await owner approval; 3 long guides await keep/trim decision. |
| Master TODO | **UPDATED IN DOCS BRANCH** | 27 DONE, 6 IN PROGRESS, 16 BLOCKED, 1 TODO, 5 FUTURE; no task IDs removed. |

Full detail and evidence limitations: `docs/PHASE19-POST-MERGE-QA.md`.

## Phase 19 — original pre-merge QA, accessibility, performance, dependencies, 2026-11-02 (historical report)

PR #30 is merged (merge commit `d09dc7d`); PR #5 and #6 are closed as superseded. Production serves the merged content. Phase 19 work sits on three branches without pull requests, because the assistant has no GitHub authentication and CI and CodeQL run only on pull requests: `feat/phase19-accessibility-performance`, `chore/actions-bump-phase19`, `chore/next-16.4.3-next-sanity-13.4.0`.

| Item | Status | Evidence |
| --- | --- | --- |
| 128 public pages | **VERIFIED LIVE** | `docs/PHASE19-LIVE-QA.md`, `docs/phase19/live-pages-production.json`: 128 of 128 answer 200 (116 attractions, 8 guides, 4 index pages), canonical, h1, long-form, history (116 of 116), meta description 35-64 words, guide inline photo counts, 137 sitemap URLs, 268 internal links and images all 200, no TourDesk link |
| The three previously unchecked sacred pages | **VERIFIED LIVE** | Armenian Catholic Church, Pozsonyi Road Reformed Church and Rumbach Street Synagogue fetched and inspected (title, h1, canonical, JSON-LD, hero image 200 WebP, credits, history, sources) |
| Viator and Tiqets | **VERIFIED LIVE (read-only API)** | `verify-marketplace-live.mjs`: 19 queries, 146 products, 0 problems; `verify-attraction-tours.ts`: 27 attractions with products, 74 none, 0 problems. TourDesk absent. Browser DOM on production not observed (B-008) |
| Sanity | **READ-ONLY CHECKED, WRITE BLOCKED** | `sanity:verify` reads production without credentials: 0 documents of every type. `--plan` and `--dry-run` (identical on two runs): 14 categories, 2 regions, 8 guides, 116 attractions, 3 experiences, 2 neighbourhoods, 1 settings = 146 editorial documents, 116 histories (29 stories), 17 galleries (44 images), 130 image files, 43 cross-link patches; validation passed. `SANITY_API_TOKEN` is not set here. No write, no `--force` |
| Accessibility, T-009 | **FIXED IN BRANCH, VERIFIED LOCALLY** | `docs/ACCESSIBILITY.md` |
| Performance, T-010 | **FIXED IN BRANCH, VERIFIED LOCALLY (lab)** | `docs/PERFORMANCE.md`; production lab and field data BLOCKED (B-016) |
| Dependabot, T-008 | **REVIEWED; two replacement branches** | `docs/DEPENDENCY_REVIEW.md`; next/next-sanity branch: typecheck, lint, 137 unit tests, build, Playwright 528 passed; npm 10 `ci --dry-run` passes |
| Time-sensitive statements | **RE-CHECKED (model-based), 12 corrections in branch** | `docs/phase19/time-sensitive-review.json`: 232 sentences, 74 current, 8 outdated, 14 unverified, 136 not time-sensitive |
| Photos, T-005 | **1 hero added** | Lupa Beach (CC BY-SA 4.0 by Globetrotter19); 4 venues still without a licensed hero; the 3 shared artwork heroes await the owner (T-006) |
| Local checks (Phase 19 branch) | **VERIFIED LOCALLY** | typecheck, lint, 137 unit tests, production build, validators, `verify-photos` 144 entries; full Playwright: 593 passed, 50 skipped, 0 failed (desktop and mobile, mocked providers; includes the accessibility, performance-guard and TourDesk-hidden specs) |
| CI and CodeQL for the Phase 19 branches | **NOT RUN** | no pull request exists |

## Phase 18 — final fact-check issues, 2026-11-02 (branch `feat/phase16-content`, PR #30; not deployed)

The owner authorised proceeding toward production once the factual issues are resolved and the release checks pass. The assistant has no GitHub authentication, so it cannot merge; the final commit is reported for the connected GitHub assistant or the owner. CI on `01f82b4` (Phase 18 content), read from the public GitHub API: all nine checks completed with success (CodeQL, build, verify, analyze, booking-partners, photos, galleries, histories, Vercel Preview Comments); PR state mergeable `clean`, not merged. The script `scripts/verify-live-pages.mjs` was added afterwards, so the final head is a later commit whose checks are reported in the PR.

| Item | Status | Evidence |
| --- | --- | --- |
| The six uncertain attractions | **RESOLVED TO CAUTIOUS WORDING, VERIFIED LOCALLY (model-based research)** | Researchers re-opened official and Hungarian sources. Ice Rink: 1895 per the rink's own history, hu.wikipedia and city heritage pages, "some sources give 1893" stated; 1909 'world championships' claim corrected. Liszt Museum: desk made by Bösendorfer 1876-77 with a pull-out keyboard, donors named (relatives and pupils, not friends), Academy moved into the building in 1879 (not 1875), exhibition rooms described. Natural History Museum: the riding hall / Alfa cinema / 1992 fire details rest on Hungarian Wikipedia and one cinema history, so they are worded as such. Millenáris: address added; the garden 'views towards the Castle District' attributed to the official site. Rumbach: facade colours removed (sources conflict), lotus carvings attributed, verified: address, Wagner, 1872, columns, current use. Szamos: official page lists the Budapest museum (Kossuth Lajos tér 10, upper floor of the café) with online booking; it states no operating period, so the text says to check; pin corrected by 65 m. |
| Other open claims | **66 resolved** | 63 UNCERTAIN/BLOCKED claims in 43 attractions plus 160 further claims checked: errors fixed (Kubinyi first director, Buda Castle origin sentence reversed, Garden of Philosophers theft and recasting, Tabán, Cave Church, Veli Bej) and unsupported statements removed (zoo celebrity story corrected to Joy Adamson, Rudas tram tip, Goodall). Final: 1,491 claims, 41 VERIFIED / 62 CORRECTED / 13 UNCERTAIN attractions; 8 claims UNCERTAIN, 12 QUALIFIED, 7 REMOVED. |
| Coordinates and addresses | **VERIFIED LOCALLY (OpenStreetMap, Wikipedia)** | `scripts/check-coordinates.mjs`: 116 attractions, 105 with pins (was 95); pins added for 10 places including Kazinczy Street Synagogue (Wikipedia 47.49833, 19.0625; house number left out because sources give 27 and 29-31) and Inner City Parish (47.49222, 19.05226); 72 street addresses geocoded, 67 within 250 m, the rest are streets/areas or geocoder misses whose pins were checked against Wikipedia (Óbuda Synagogue exact, 1956 Monument within 45 m, Serbian church within 30 m). Address fields that held a website or only the venue name were replaced. 11 places still have no pin (map links fall back to a name search). |
| Descriptions | **VERIFIED LOCALLY** | 11 hand-written descriptions had 26-34 words, not 35-70 as stated earlier; lengthened with facts from their own texts. All 116 displayed descriptions now have 35-64 words. |
| Consistency | **VERIFIED LOCALLY** | Corrections exist in the content sources (not only in the report); description, long-form text, history and guides were re-read by script for editing artefacts (none); `tests/fact-check.test.ts` keeps the report machine-readable and forbids an attraction status better than its claims. |
| Local checks | **VERIFIED LOCALLY** | typecheck, lint, 137 unit tests, production build, validators (content, histories, batches, inline photos, photo sources 143 entries / 130 pages all 200), Sanity `--plan` and `--dry-run` (146 editorial documents plus 116 histories, 17 galleries, 130 image files; write BLOCKED, no `--force`). Full Playwright: 528 passed, 49 skipped, 0 failed (desktop and mobile, mocked providers; includes the TourDesk-hidden tests). |
| Live site | **NOT VERIFIED** | PR #30 is not merged or deployed. Baseline of the unmerged production (read-only, 2026-11-02, `scripts/verify-live-pages.mjs`): 112 of 128 pages answer 200, the 16 sacred pages are 404 and 88 attraction pages lack the long-form sections, which is exactly the pre-merge state. The same script against the local production build: 128 of 128 pages answer 200 with 0 problems (sitemap 137 URLs, canonical, h1, long-form, photo credit, no TourDesk text). After the merge it is run against https://www.gotobuda.com together with `verify-attraction-tours.ts`; PR #5 stays open until PR #30 is in main. |

## Phase 17 — editorial QA, 2026-11-02 (branch `feat/phase16-content`, PR #30; not deployed)

PR #30 is open and its nine CI checks (including CodeQL) were reported green at `dd42afd`; the assistant has no GitHub authentication and cannot read check status, so that is the owner's report, not an observation here. Nothing below is live until PR #30 is merged and deployed.

| Item | Status | Evidence |
| --- | --- | --- |
| Fact-check of 116 attractions, T-013 | **DONE IN BRANCH, VERIFIED LOCALLY (sources opened by the checkers)** | 12 independent checkers fetched sources for each attraction (official sites and heritage registers first, Wikipedia as support). 1,332 claims: 42 attractions VERIFIED, 68 CORRECTED, 6 UNCERTAIN, 0 BLOCKED; 137 corrections applied exactly to the content sources by `scripts/apply-fact-corrections.mjs` (it refuses ambiguous matches). Spot check by the assistant: the Széchenyi under-14 rule read on the operator's FAQ. Report: `docs/ATTRACTION_FACT_CHECK.md`, data: `docs/fact-check/`. Limits: many official pages are unreadable to automated fetches (Parliament CAPTCHA, UNESCO 403, budapestinfo.hu title only), some claims rest on Wikipedia alone, nothing about whether a venue is open today was verified. An editor should read the report before launch. |
| The 16 religious sites | **VERIFIED LOCALLY** | No duplicate slugs, names or coordinates; the 16 hero photographs were viewed on a contact sheet and match their Commons categories (Pozsonyi Road Reformed Church and Deák Square Lutheran Church confirmed from Commons categories); credits cleaned (two "original uploader was" strings, a photographer's notice replaced by the Commons user, a "please credit as" note); corrections include the Armenian Catholic interview quote and the Kazinczy facade (sources disagree, now stated). Óbuda Synagogue is described as a former synagogue used as museum, warehouse and TV studio; no active place of worship is called a museum. Coordinates: St Elizabeth added from OpenStreetMap; Kazinczy and Inner City Parish still have none. The browser tests cover the pages, directory, search and sitemap. PR #5 is closed only after PR #30 is merged. |
| Guides, T-012 | **DONE IN BRANCH, VERIFIED LOCALLY** | The five earlier guides fact-checked (84 claims, 9 corrections) and extended; all eight guides are now 1,063-1,676 words of body text. See MASTER_TODO T-012. |
| Ticket and tour cards, T-011 | **VERIFIED LIVE (read-only API) with the final matcher** | 101 contexts, 27 attractions show products, 74 none; 86 of 86 products have provider, internal page, affiliate URL and price; 0 problems. Whole-word matching and more non-distinctive words removed the "Lights"/"Highlights", "dance" and "heritage" look-alikes. Unit tests cover the cases. |
| Photography audit | **VERIFIED LOCALLY** | All 143 entries: licence in the allowed list, author present, source page, 640 and 1280 files exist; three credit strings fixed; the Shoes memorial alt text says iron (not bronze); the Trinity Square alt text corrected (church on the right, rebuilt Finance Ministry on the left). The Deák Square hero is 987 px wide (source resolution). Five venues still have no licensed hero (T-005) and three heroes are shared artwork (T-006): unchanged, no unrelated photo was used. |
| Sanity seed | **VERIFIED LOCALLY, WRITE BLOCKED** | `--plan` and `--dry-run`: 14 categories, 2 regions, 8 guides, 116 attractions, 3 experiences, 2 neighbourhoods, 1 settings = 146 editorial documents, plus 116 histories (29 stories), 17 galleries (44 images) and 130 image files to upload, 43 cross-link patches; validation passed. `sanity:verify` reports 0 documents in production for every type (expected, nothing seeded). No credential, no write, no `--force`. B-001 to B-004 unchanged. |
| Local checks | **VERIFIED LOCALLY** | typecheck, lint, 133 unit tests, production build, validators (content, histories, batches, inline photos). Full Playwright: 528 passed, 49 skipped, 0 failed (desktop and mobile, mocked providers; includes the TourDesk-hidden tests). CI and CodeQL: PR only. |
| Live site | **NOT VERIFIED** | PR #30 is not merged or deployed; no live claim is made. The browser cannot reach www.gotobuda.com from this machine (organisation filter, B-008/B-009). |

## Phase 16 — content integration, 2026-11-02 (branch `feat/phase16-content`, base main `6c70fb4`; not deployed)

Nothing below is live until PR #30 is merged and the deployment is independently verified. GitHub PR #30
was opened via the connected GitHub integration. CodeQL and CI are running and will be evaluated before merge.
The initial CI build found an outdated Sanity gallery expectation (13/37 rather than the expanded 17/44);
its test was corrected in the PR. Structural validators cannot establish historical factual accuracy.
MASTER_TODO T-013 tracks independent editorial review and corrections across the 116 attractions.

| Item | Status | Evidence |
| --- | --- | --- |
| PR #5 (16 churches and synagogues) | **INTEGRATED IN BRANCH, VERIFIED LOCALLY** | Appended to `lib/attractions.json` (116 places), category "Sacred architecture"; local credited WebP photographs built from Commons (licence and author read from the Commons API: CC BY 2.5, CC BY-SA 3.0/4.0, CC BY 4.0, CC0, public domain); 4 galleries (7 images; one St Elizabeth image dropped because its Commons page names no author); the downtown Pest and Danube topic pages list them. PR #5 itself is superseded, not merged. Corrections against fetched sources: Queen of Heavens postcode 1041 (not 1042), Pozsonyi út 58 (1133), Újlak synagogue is the Frankel Leó Street synagogue, St Margaret stands at Váci út 34, Holy Family is a 1930s building (not "historic"), Kazinczy facade is plain (not "richly ornamented"). 12 browser tests (desktop + mobile) cover the 16 pages, directory, search, sitemap and neighbourhood links. |
| Counts | **VERIFIED LOCALLY** | The number of places is derived from the data (directory title and search label, home, 404, essentials, metadata, Sanity seed and verify scripts, validators, tests); `validate-content` reports 116 places and 116 source checks (all HTTP 200, 2026-10-29), `verify-photos` 143 photographs and 130 distinct source pages, all answering 200. |
| Long-form text, T-001 | **VERIFIED LOCALLY (validators and tests)** | 116 of 116 attractions: 12 hand-curated plus 104 researched (`lib/content-batches/g01..g10-long-form.json`), written by research agents that fetched Wikipedia, official and heritage pages. `npm run validate:batches`: 104 texts valid (35-70 word description, 140-700 word text, 2-5 tips, 2+ https sources, no price or opening-time wording). Sources that were thin or disagreed are described in the text, not smoothed over. A sample of entries was read by the assistant (Kopaszi-gát, Hospital in the Rock, Normafa); the rest are validated structurally, not fact-checked line by line: owner review recommended before deployment. |
| Histories, T-002 | **VERIFIED LOCALLY** | 46 new histories (`*-history.json`), 116 of 116 attractions now have one; `npm run validate:histories` passes (103 seed histories plus 13 baseline); 8 labelled stories (traditions worded as traditions). |
| Short descriptions, T-004 | **VERIFIED LOCALLY** | All descriptions are 35-70 words; cards show a 30-word excerpt (`cardExcerpt`, unit-tested), pages show the full text. |
| Guides, T-007 | **VERIFIED LOCALLY** | Getting around, bars and nightlife, food and markets: new sections, FAQs, sources, 3 credited inline photos each and "Places mentioned in this guide" links; 1,482 / 1,553 / 1,612 words. Fares, prices, clock times and opening hours are deliberately absent. |
| Ticket and tour cards, T-011 | **VERIFIED LIVE (read-only API), fix verified locally** | `scripts/verify-attraction-tours.ts` against production (2026-11-02): 109 attractions have a context, 49 showed products, 0 structural problems (all products Viator or Tiqets, internal `/tours/...` page, https provider URL with affiliate parameters, a real price). It also exposed loose matches (a Parliament tour on the Opera page, hill tours on the Gellért Bath page, cruises on the Shoes memorial page). The matcher is stricter now (unit-tested): 31 of 105 attractions show products, 74 show nothing. Not yet live. |
| TourDesk | **UNCHANGED, HIDDEN** | The switch defaults off; the TourDesk-hidden browser tests (desktop + mobile) are part of the full run below. Issue #21 and B-006, B-007, B-015 stay open. |
| Sanity seed | **VERIFIED LOCALLY, WRITE BLOCKED** | `--plan` and `--dry-run`: 116 attractions, 8 guides, 14 categories, 116 histories (29 stories), 17 galleries (44 images), 130 image files to upload, 43 cross-link patches; validation passed. No credential, nothing written, no `--force`. B-001 to B-004 unchanged. |
| Hero photographs, T-005 | **NOT DONE** | Re-searched Commons for Szamos Chocolate Museum, Budapest History Museum, Museum of Illusions, IKONO and Lupa Beach: no licensed exact-subject photograph exists, so no image was added. |
| Shared artwork heroes, T-006 | **NOT DONE (needs owner approval)** | Matthias Church, Parliament and Fisherman's Bastion keep the home-page artwork. |
| Local checks | **VERIFIED LOCALLY** | typecheck clean, lint clean, unit tests, production build, validators (content, histories, batches, inline photos, photos). Full Playwright run on the production build (mock providers, 1 worker): **528 passed, 49 skipped (not applicable to the project), 0 failed**, including the 14 TourDesk-hidden tests (desktop + mobile), the sacred-site, long-form, history, editorial-photo and marketplace specs. |

## Phase 15 — verified on live public site, 2026-10-29 (main `d5f8890`)

| Item | Status | Evidence |
| --- | --- | --- |
| PR #26, #27, #28 | **MERGED / GitHub CI VERIFIED** | PR #26 master tracker; PR #27 `e8ccee1` hides TourDesk; PR #28 `d5f8890` adds editorial content. CodeQL security warnings for unanchored URL regex tests were resolved with exact HTTPS hostname checks, then all required CI jobs including full browser tests passed. |
| TourDesk public hiding, D-020 (formerly P-003) | **VERIFIED LIVE** | `GET /api/marketplace/search` returns 27 first-page products and exactly `viator`, `tiqets` provider keys, with no `tourdesk` key or requests from normal UI. `?provider=tourdesk` responds HTTP 400; visible `/tours` title says `TWO PROVIDERS. ONE BUDAPEST.` and no TourDesk label/filter appears. `/privacy` contains only Viator and Tiqets; `/tours/tourdesk/12-2` redirects to `/tours`. Read-only public HTTP verification, not a native booking test. TourDesk integration remains in code and its native checkout stays off. |
| Editorial content | **VERIFIED LIVE (representative pages)** | `/attractions/hungarian-parliament` and `/attractions/heroes-square` display new About text; Heroes' Square includes the sourced statue-history section. `/guides/budapest-thermal-baths` shows the additional thermal-bath section and inline photography. All three pages HTTP 200. Remaining content work: T-001 88 attractions; T-002 30 histories; T-005 five missing heroes; T-007 three guides. |
| Gellért Thermal Bath status | **VERIFIED OFFICIAL** | `https://www.gellertbath.hu/en` and `https://www.gellertbath.hu/opening-hours`: closed since 2025-10-01 for renovations; planned reopening 2028. The editorial text uses this planned year as a provisional estimate. |
| PR #6 | **CLOSED — SUPERSEDED, NOT MERGED** | Sourced Heroes' Square and Gül Baba traditions were incorporated through PR #28; the unverified specific 1929 completion claim was replaced by a cautious sourced history. |
| PR #5 | **OPEN — NOT MERGED** | 16 additional photographed churches and synagogues require integration into modern `loadContent()` loader, seed/validator count changes and source/license checks. Master TODO T-003 remains open. |
| Sanity publication | **BLOCKED** | No published editorial documents at last read; Editor access / safe seed and signed webhook still required (B-001 through B-004). Do not claim production Sanity migration complete. |


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

## Content work, 2026-10-29 (historical pre-merge report; deployed later through PR #28)

| Item | Status | Evidence |
| --- | --- | --- |
| Long-form attraction text | **MOCKED (unit and browser tests; not live)** | 12 attractions have a long description, a main "About" text (190-320 words), a "Good to know" list and linked sources: `lib/attraction-long-form.ts`, rendered by the existing About section, migrated by the Sanity seed (`body`). Facts come from Wikipedia and Budapest Info; no prices, opening times or unsupported legends. 5 unit tests and 26 browser tests (desktop + mobile). |
| Histories | **MOCKED** | 7 new cited histories (`lib/attraction-history-batch-c.ts`); PR #6's labelled traditions (Archangel Gabriel dream, Father of Roses, the sultan's funeral) folded in. `validate-attraction-histories.mjs` passes (57 histories). Attractions without a history: 30 (was 37). |
| Guides | **MOCKED** | 5 guides gain a fact-checked section and a credited inline photo (`lib/guide-extra-sections.ts`, 45 inline placements). |
| Photography and credits | **VERIFIED (validators)** | Budapest Gallery hero added from Commons (CC BY-SA 4.0, Gámán Zsuzsa) with a cropped 640/1280 WebP pair; `verify-photos.mjs` and `validate-content.mjs` pass. The audit's "incomplete credit" findings were a rule error (public-domain works have no licence page). 5 attractions still lack a hero photo: no suitable licensed photograph was found. |
| Content audit now | **VERIFIED** | 12 with a long-form body, 81 one-line descriptions, 30 without a history, 5 without a hero photo, 3 shared artwork heroes (kept: they appear on the home page). |
| PR #5 and #6 | **REVIEWED** | See T-003 in the master TODO. |
| Sanity migration | **BLOCKED** | Unchanged; `--plan` and `--dry-run` pass with the new body field (100 attractions, 8 guides, 106 images). |

## TourDesk paused and hidden, 2026-10-29 (historical pre-merge report; deployed later through PR #27)

| Item | Status | Evidence |
| --- | --- | --- |
| Owner decision | **OPEN (recorded)** | TourDesk is paused until the owner provides a replacement API or new API access. Issue #21 stays open; the TourDesk tasks are BLOCKED in the master TODO (B-006, B-007, B-015). No further TourDesk diagnostics are run. |
| Switch | **MOCKED (unit and browser tests)** | `TOURDESK_MARKETPLACE_ENABLED` (`lib/marketplace/enabled.ts`) defaults to OFF without any configuration; only the exact value `true` turns it on. The adapter, discovery, booking engine, normalisation, tests, credentials and earlier reports are unchanged. |
| What the public site does while it is off | **MOCKED** | No TourDesk API request (mock log empty across `/tours`, the home row, the legacy offers API and the other public pages); the search API names only Viator and Tiqets and rejects `provider=tourdesk` with 400; no TourDesk filter, text, banner or count (provider filter lists All providers, Viator, Tiqets on desktop and mobile); `/tours` says "TWO PROVIDERS"; old `/tours/tourdesk/...` links redirect to `/tours`; `/api/booking/tourdesk/<id>` answers 404; native checkout answers 503 (its own gate). Privacy copy names only the partners in use. |
| Tests | **MOCKED** | 14 browser tests in `e2e/tourdesk-hidden.spec.ts` (default-configuration server on port 3103, desktop and mobile) plus 7 unit tests in `tests/marketplace-hidden.test.ts`; the preserved integration stays under test with the switch on (server 3101, the provider contract spec). |
| Live | **NOT DONE** | Becomes DONE (P-003) only after merge, deploy and a live check. |

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
