# Phase 24 — final production verification (2026-11-04)

Labels: **VERIFIED LIVE** = observed on https://www.gotobuda.com or a public API today; **VERIFIED LOCALLY** = local build, tests or dry run; **BLOCKED** = not possible, with the reason. Production runs main `fcceee3` (PR #39 merged as `91ddccf`, PR #40 as `fcceee3`). Evidence: `docs/phase24/`.

> Reconciled on 2026-11-05 (Phase 25): PR #41 is merged as `434bd9d`; the fix described in section 3 is PR #42 (open, clean, 5 of 5 checks green, head `4fb1c02`); this document is PR #43. The text of sections 1 and 3 below records what was read on 2026-11-04.

> **Post-report update (2026-11-04):** PR #42 has now merged into main (`8fd7a0ac3ab482ff4ab9c0e0b68cb619765efd33`) after all five GitHub checks passed, including CodeQL. GitHub deployment status is SUCCESS. The font cache observations below predate this merge; a fresh public header check of the old un-hashed font 404 and four hashed font 200 responses is still required before T-018 may be marked DONE. See the newer section at the top of `docs/RELEASE_STATUS.md`.

## 1. PR #41 (state on 2026-11-04; merged as `434bd9d` since)

Read over the public GitHub API: open, base main, head `4522526823bb496fd08b3d4b0d4e11c1a5947089` (`docs/phase23-status`), mergeable; CodeQL, analyze, verify and Vercel Preview Comments success, build still running at the last read. The assistant has no GitHub authentication and did not try to log in or bypass anything, so it did not merge: the connected GitHub assistant should merge that head once all checks are green. Main is `fcceee3` until then.

## 2. Live site (VERIFIED LIVE)

* `verify-live-pages.mjs --links`: 128 pages (116 attractions, 8 guides, 4 index pages) 200, 0 problems; 284 internal links and images, 0 failing; sitemap 137 URLs. A separate pass over all 137 sitemap URLs: 137 answer 200, the canonical URL equals the sitemap URL on all 137, every page has an h1, none contains "tourdesk".
* `verify-attraction-tours.ts`: 101 contexts; 27 with at least one relevant product, 74 none, 76 product cards (62 Viator, 14 Tiqets); 0 problems, 0 incorrect matches. Same as the Phase 23 values.
* `verify-marketplace-live.mjs`: 19 queries (provider, category, sort), 8 product pages, 0 problems; 143 distinct products (Viator 109, Tiqets 34). Provider links are the affiliate hand-offs the script checks by URL only; nothing was followed or booked.
* TourDesk is not on any page, `/tours/tourdesk/1` redirects, the API rejects `provider=tourdesk`.
* `node scripts/verify-photos.mjs` (VERIFIED LIVE against the source pages): 144 entries, 131 distinct source pages, all files present, licences allowed, all pages 200. Histories, photo credits and canonical URLs are the ones the page audit checks; the history and gallery validators run in CI (photos, galleries, histories checks of PR #39 were green).

## 3. Static asset caching (VERIFIED LIVE)

The home page links two CSS files; their four `@font-face` URLs are `/fonts/dm-sans-latin.9fea608a.woff2`, `dm-sans-latin-ext.a5d38fe9`, `manrope-latin.8c2def02`, `manrope-latin-ext.2f733511`: all 200, `public, max-age=31536000, immutable`. `/assets/*` (logo, favicon.svg, hero renditions, photos) and `/favicon.ico`: `public, max-age=86400, stale-while-revalidate=3600`. HTML, sitemap and robots: `public, max-age=0, must-revalidate`. Nothing under /assets or /favicon is long-cached. The home hero is `<picture>` with the 1280 px file up to 900 px width and the full 2000 px artwork above (danube-1280.webp 127,730 bytes; danube.webp 384,250 bytes; all 200), as the local guard test expects.

**One genuine defect found.** `/fonts/dm-sans-latin.woff2` (the removed pre-hash name) answers 404 with `max-age=31536000, immutable`, because the header rule `/fonts/:path*` matches every path. Impact is small (only a visitor holding the old CSS asks for that URL, and the CSS is revalidated by the HTML), but a 404 should not be cached for a year and the rule "immutable only for hashed names" was not literally true. Fix as PR #42, branch `fix/fonts-immutable-only-for-hashed-names` (`4fb1c02`): the rule matches only `.<8 hex>.woff2`; a guard test asserts the old path is 404 and not immutable. VERIFIED LOCALLY: tsc, 145 unit tests, production build, full Playwright 602 passed / 51 skipped (Sanity-dependent) / 0 failed. Not merged by the assistant (no GitHub authentication); PR #42 was opened by someone with access. MASTER_TODO T-018.

## 4. Sanity (BLOCKED: no `SANITY_API_TOKEN`)

No token exists in this environment, so nothing was written. Seed `--dry-run`: 146 documents (14 categories, 2 regions, 8 guides, 116 attractions, 3 experiences, 2 neighbourhoods, 1 settings), 116 histories (29 stories), 17 galleries (44 images), 131 image files, 43 cross-link patches; validation (ids, schema fields, references, https URLs, alt text) passed; photo licences OK (above). The seed only creates missing documents (`createIfNotExists`, `setIfMissing`), so it cannot overwrite Studio edits; `--force` is not used. `npm run sanity:verify`: 0 of 146 published. Owner action for B-001 to B-004: give the "Seed Sanity" workflow (or a maintainer) a write token, run the seed, `npm run sanity:verify -- --strict`, Playwright with `PW_EXPECT_SANITY=1` (51 specs that are skipped today), the revalidation webhook, and only then `REQUIRE_SANITY_CONTENT=1`.

## 5. Editorial, photographs, guides

T-013: the visitor-decision items were looked at again; the House of Music official site cannot be opened (expired certificate), no current official hours were reachable for the Underground Railway Museum or Veli Bej, and third-party pages disagree. No new authoritative evidence: no text changed, all 14 stay UNCERTAIN, nothing marked verified, no human sign-off claimed. T-005: Szamos, IKONO, Budapest History Museum and Museum of Illusions keep the text-only presentation. T-006: shared artwork for Matthias Church, Parliament and Fisherman's Bastion unchanged. T-007: the three long guides unchanged (200, canonical, h1 on all eight live). Owner sign-off for T-006 and T-007 is still outstanding.

## 6. Performance and accessibility

Live: responsive hero and caching as above. No real-user LCP, CLS or INP: PageSpeed Insights without a key answered 429 on 2026-11-03 and the browser of this machine cannot open production, so B-008, B-009 and B-016 stay BLOCKED; the Phase 22 local results (Playwright performance and accessibility specs, now inside the 602 passed) are lab results only.

## 7. Totals

Counted from the MASTER_TODO of main `434bd9d` (PR #41): DONE 32, IN PROGRESS 4 (T-005, T-007, T-010, T-013), BLOCKED 16, TODO 1, FUTURE 5. This branch adds T-018, so TODO is 2.
