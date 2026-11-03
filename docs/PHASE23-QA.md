# Phase 23 — PR #39, production baseline, Dependabot branch (2026-11-03)

Labels: **VERIFIED LIVE** = observed on https://www.gotobuda.com or a public API; **VERIFIED LOCALLY** = local build, tests, dry run; **BLOCKED** = could not be done, with the reason. Evidence files are in `docs/phase23/`.

## 1. PR #39 (VERIFIED LIVE, GitHub public API)

https://github.com/savargeir-byte/gotobudapest/pull/39 is open, base `main` (`2390a86`), head `f4e047773e5f9411adb0b0d490b762972f3b8478` (unchanged since Phase 22), `mergeable_state: clean`. CodeQL, build, verify, analyze, photos, galleries, histories and Vercel Preview Comments are all **success**. The diff against main is 37 files (+2,453 / -312): cache policy and hashed fonts, 37 editorial corrections and fact-check data, Sanity seed fixes and verification, tests, documents; the local checks of Phase 22 (tsc, eslint, 145 unit tests, production build, 61 Playwright performance and accessibility tests) still apply because the head did not change.

**Not merged.** `gh` is not authenticated and the assistant has no other authorised GitHub connection; it did not try to log in again, push to main or bypass the branch protection. To merge: use the connected GitHub assistant or the owner, on head `f4e047773e5f9411adb0b0d490b762972f3b8478`. Production is on main `2390a86`, so there is no new main SHA and no new deployment to confirm.

## 2. Production headers today (VERIFIED LIVE, before the merge)

All of `/`, `/assets/*`, `/favicon.ico`, `/fonts/dm-sans-latin.woff2` and an attraction page answer `public, max-age=0, must-revalidate`; `/fonts/dm-sans-latin.9fea608a.woff2` is 404. This is the Phase 20 state, i.e. the intended policy (one-day assets and favicon, one-year immutable hashed fonts) is **not live**. After the merge, re-run: the fetches in `docs/phase23/production-headers-premerge.txt` (expect `max-age=86400, stale-while-revalidate=3600` for assets and favicon, `max-age=31536000, immutable` for the four hashed fonts, HTML unchanged), and open the CSS to confirm every font URL answers 200. The regression tests (`e2e/performance-guards.spec.ts`) passed locally against a production build in Phase 22.

## 3. Pre-merge live baseline (VERIFIED LIVE, main)

* `verify-live-pages.mjs --links`: 128 pages (116 attractions, 8 guides, 4 index pages) all 200, 0 problems; sitemap 137 URLs; 284 internal links and images, 0 failing.
* `verify-marketplace-live.mjs`: 19 queries and 8 product pages, 0 problems; 143 distinct products (Viator 109, Tiqets 34).
* `verify-attraction-tours.ts`: 101 contexts; 27 attractions show products (Phase 20 baseline 26), 74 none (75), 76 product cards (75); 0 incorrect matches. The difference is live provider inventory.
* TourDesk: none of the 137 sitemap pages contains the word; `/tours/tourdesk/1` redirects and the marketplace API rejects `provider=tourdesk`.
* No booking, form or provider link was followed. These runs must be repeated once after the merge.

## 4. Sanity (BLOCKED: no `SANITY_API_TOKEN`)

`sanity-seed.ts --plan` and `--dry-run` re-run: 146 documents (14 categories, 2 regions, 8 guides, 116 attractions, 3 experiences, 2 neighbourhoods, 1 settings), 116 histories (29 stories), 17 galleries (44 images), 131 image files, 43 cross-link patches, validation passed; `sanity:verify` against production: 0 of 146 published. Nothing was written. Required owner action for B-001 to B-004: provide a write token to the maintainer or the "Seed Sanity" GitHub workflow secret (not in chat, not from Vercel), run the seed (idempotent, no `--force`), then `npm run sanity:verify -- --strict`, then Playwright with `PW_EXPECT_SANITY=1`, add the revalidation webhook, and only then `REQUIRE_SANITY_CONTENT=1`. The code fallback stays.

## 5. Dependabot #34 and #36 (T-017)

Both open, both fail `npm ci` in CI (build and verify red; CodeQL, analyze green). #34: sanity-plugin-media ^6.5.0 to ^6.6.0 (head `acfb493`). #36: @sanity/client ^8.10.1 to ^8.14.1 and @sanity/vision ^6.20.0 to ^6.21.0, plus the lock entry of sanity (head `4ad2507`). Branch `chore/deps-sanity-npm10-lock` (`9b2775d`, 2 files) applies all three bumps to main's own lock with npm 10. Resolved: sanity and @sanity/vision 6.22.0, @sanity/client 8.14.1, sanity-plugin-media 6.6.1; top-level typescript 5.9.3 and eslint 9.39.5 unchanged (no TypeScript 7 or ESLint 10 introduced; the nested typescript 7.0.2 under @sanity/cli is the same as in main's lock). VERIFIED LOCALLY under Node 22 / npm 10: `npm ci`, tsc, eslint, 138 unit tests (main's count), production build. Not done: a pull request, CI and CodeQL for it (no GitHub authentication), the Playwright suite, the `@dependabot recreate` comment. Neither Dependabot PR was closed or changed.

## 6. Editorial (T-013), photographs, guides

One more targeted pass on the visitor-decision items found no new authoritative evidence (see T-013), so the texts and the 14 UNCERTAIN statuses stand; nothing was marked verified because it was softened. Recommendations, not owner approvals: keep the four text-only venues (Szamos, IKONO, Budapest History Museum, Museum of Illusions) without a hero until a licensed, correctly identified image exists; keep the shared artwork for Matthias Church, Parliament and Fisherman's Bastion (T-006); keep the three longer guides intact (T-007).

## 7. Performance and accessibility

No code changed. The PageSpeed Insights API without a key answered 429 (quota), the browser on this machine cannot open production, so Lighthouse and field LCP, CLS and INP (B-016, B-008, B-009) remain BLOCKED; the Phase 22 local results stand.
