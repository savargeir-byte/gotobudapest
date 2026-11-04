# Phase 22 — PR #39, cache policy review, Sanity readiness (2026-11-03)

Main is `2390a86`; PR #39 (the Phase 21 branch `feat/phase21-live-qa`) is open. Labels: **VERIFIED LIVE** = observed on https://www.gotobuda.com or the public Sanity API; **VERIFIED LOCALLY** = local build, tests or a dry run; **BLOCKED** = could not be done, with the reason.
The prompt for this phase arrived cut off after "4. Hist" (section 2 of the Sanity list), so only what was received was worked on.

## 1. PR #39

Read over the public GitHub API (the assistant has no GitHub authentication, so it cannot merge and was not asked to bypass anything):

| Head | Checks | State |
| --- | --- | --- |
| `9c4cacf` (Phase 21) | CodeQL, analyze, verify, build, histories, Vercel Preview Comments: success; `mergeable_state: clean` | would have been mergeable |
| `6effbb3` (cache policy, Phase 22) | the same checks run again on the new head | merge only when they are green for the head that is merged |

Merging, and the post-merge production checks (the `Cache-Control` headers, the new font URLs, all 128 pages, the marketplace, TourDesk), therefore remain with the owner or the connected GitHub assistant. T-016 stays open.

## 2. Cache policy review (VERIFIED LOCALLY)

The first version of the Phase 21 fix cached `/assets` for 7 days and `/fonts` for a year as `immutable`. That was **unsafe and was withdrawn before merge**:

* The photographs (262 files in `public/assets/photos`), the shared artwork, the logo and the favicon keep their file names when they are replaced. The logo has already been edited in place twice (`git log --diff-filter=M`). A visitor with a 7-day cache would keep the old file, and a photograph withdrawn for a licence reason would stay visible.
* The font files were not content-hashed, so a year of `immutable` would have been wrong as soon as one changed.

Final policy: the four font files are renamed with the first 8 hex digits of their SHA-256 (`dm-sans-latin.9fea608a.woff2`, referenced in `app/globals.css`), and only `/fonts` is `max-age=31536000, immutable`. `/assets` and `/favicon.ico` get `max-age=86400, stale-while-revalidate=3600`: still cached for repeat page views, out of a browser within a day of a replacement. HTML is unchanged.
`e2e/performance-guards.spec.ts` checks that every font file name matches its content, that the CSS references only existing files, that nothing but the fonts is `immutable` and that nothing that keeps its name is cached for more than a day. Rule for editors: **a replaced photograph should get a new file name** when it must be visible immediately.
Playwright performance and accessibility specs: 61 passed, 1 skipped (desktop and mobile).

## 3. Sanity readiness

Production still holds **0 of the 146** seeded documents (read with `npm run sanity:verify`, public API, no token: VERIFIED LIVE). `SANITY_API_TOKEN` is not available here, so nothing was written; no `--force`.

What was reviewed (the existing pipeline already had a seed → GROQ → mapper round-trip test; it compared slugs, counts and selected fields):

| Area | Result |
| --- | --- |
| Schemas against seeded fields | `validate()` in the seed checks top-level fields against the schema; unchanged and passing |
| Field-level fidelity (new, `tests/sanity-fidelity.test.ts`) | compares every rendered field of attractions, guides, experiences and neighbourhoods as built from the seed with the local content: texts, addresses, status, long-form text, sections, FAQs, sources, hero credits, gallery order, captions and credits |
| Histories | already covered (116 histories, 29 stories, headings, texts, sources) |
| Galleries | already covered (17 galleries, 44 images, order, alt, captions, credits) |

**Two real defects were found by the new test and fixed in the seed** (VERIFIED LOCALLY):

1. The disclosure caption under the stand-in hero of four guides ("Budapest city panorama — this is not a photograph of a bath", and the same for bars, food and the like) was not written (`heroImage.caption` was never set), so once the dataset was published the guides would have lost it.
2. The shared artwork heroes (Matthias Church, Fisherman's Bastion, Parliament, and a few more) would have received a credit line titled with a file name and an empty author ("budapest.webp, Unsplash License") that the site does not show today, changing the pages. The seed now writes none (the Unsplash source URLs stay in the README); an editor can add a credit in Studio. This relates to T-006 (owner decision on those heroes).

Intentional differences, not defects: creativecommons.org links become https; gallery credit titles are left empty instead of storing an internal key (`bridge`), and no component renders `credit.title`; a guide without an `seo` object uses its description, which is what the seed writes.

**Post-seed verification (new):** `npm run sanity:verify` now builds what the seed would create and compares the published dataset document by document (id, type, history, stories, gallery, sections, FAQs, hero). A missing document fails; differences in counts are warnings, or failures with `-- --strict` straight after seeding (before any Studio edit). Its logic is tested without network or token (`tests/sanity-verify.test.ts`: an exact dataset passes; an empty one is 146 missing; a deleted, draft-only and stripped document are caught; extra documents are informational). The "Seed Sanity" workflow already runs it after seeding.

Things to know before publishing (not changed, owner decisions):

* `lib/content.ts` takes a collection from Sanity as soon as it has at least one document of it (`attractions.length ? attractions : local`). If a seed stopped half way (it writes in batches of 50), attractions that are not yet in Sanity would disappear from the site until the seed is run again (it is idempotent). Run the seed, run `sanity:verify -- --strict`, and only then trust the dataset; `REQUIRE_SANITY_CONTENT=1` should be set only after that passes.
* The guide inline photographs (`lib/inline-photos.ts`) are placed by code, not in Sanity, so an editor cannot move them in Studio; they keep working when the dataset is published.
* The revalidation webhook (`app/api/revalidate`) needs `SANITY_REVALIDATE_SECRET` and the matching webhook in Sanity (B-004).

Seed `--dry-run` after the fixes: 146 documents (14 categories, 2 regions, 8 guides, 116 attractions, 3 experiences, 2 neighbourhoods, 1 settings), 116 histories, 17 galleries (44 images), 131 image files, 43 patches, validation passed. B-001 to B-004 stay BLOCKED (token).

## 4. Dependabot PRs #34 and #36 (diagnosis, no change made)

Both fail in CI at `npm ci`. Reproduced in an isolated folder with Node 22 / npm 10 (the CI versions): `Missing: typescript@7.0.2 from lock file` (21 entries); the same files pass under Node 24 / npm 11. Applying the `sanity-plugin-media@^6.6.0` bump to main's own lock file and regenerating it with npm 10 installs and passes `npm ci`, so the upgrade is not the problem, the generated lock file is. Suggested next step: `@dependabot recreate` on both, or regenerate the lock files with npm 10 (MASTER_TODO T-017).

## 5. Local checks

Typecheck and lint clean; 145 unit tests pass (138 before, plus 3 fidelity and 4 verify tests). The production build was run after the cache change.
