# Phase 19 — post-merge public verification (2026-11-03)

This is a **read-only post-release verification** of the deployed GoToBudapest website after Phase 19. It supplements, but does not replace, the detailed original Phase 19 report in `docs/PHASE19-LIVE-QA.md`.

## GitHub release

| Change | PR | Merge commit |
| --- | --- | --- |
| Accessible templates, smaller assets, licensed Lupa Beach hero, public QA tooling and reports | #31 | `f18839b27d3428ec2b27384b8f6aa0475231c58e` |
| Updated GitHub Actions and Dependabot ignore rules | #32 | `dda5bf39d626e9f6f77bd25a0de57a64bb926f9f` |
| Next.js 16.4.3, next-sanity 13.4.0 and npm 10 lockfile | #33 | `4afe4ff1bdbaf982558377d157dc595d0a67e0a8` |

Every PR passed its latest complete GitHub CI/CodeQL run **before merge**, including Playwright. The latest `main` commit also reported success in GitHub for its build, verify, analyze, Dependabot and deployment status checks. This evidence was obtained **through GitHub only**; no Vercel account, API, CLI or dashboard access was used.

The merged `package.json` and `package-lock.json` both retain `axe-core@4.14.0` and Next.js 16.4.3, with next-sanity ^13.4.0.

## Post-merge public site checks

A public external content-fetch tool was used with fresh-or-origin-cache-bounded reads to inspect **all 128 known page URLs** listed in `lib/attractions.json` and the existing guide/index route set:

- **116/116 attraction pages:** fetched and rendered, correct self-canonical, title and both `About` / `Plan your visit` text markers
- **8/8 guides:** fetched and rendered, correct self-canonical, title and substantial text
- **4/4 index pages:** fetched and rendered (`/`, `/attractions`, `/guides`, `/tours`) with self-canonicals. The homepage's canonical omits the final slash (`https://www.gotobuda.com`), which is equivalent to the requested root URL
- The separately fetched `sitemap.xml` was parsed as containing **137 URLs**, with no TourDesk entry in the observed content
- The three church pages previously left unchecked (Armenian Catholic Church — Újbuda, Pozsonyi Road Reformed Church, Rumbach Street Synagogue) displayed the expected content, photos/credits in the extracted main text, and correct canonicals
- `/tours` returned substantive Viator/Tiqets marketplace content with no visible TourDesk text

**Evidence limits:** The external content-fetch result does not expose a raw HTTP status code for each success, so this new post-merge check records 128 successful fetch/render/canonical observations rather than independently claiming 128 HTTP 200 responses. The older Phase 19 report *did* record 128/128 HTTP 200 via the dedicated Node script before these merges. The external extractor may omit caption and image-credit elements even when a photo is present; compare against `lib/photos.json` and live DOM before classing a photo as missing.

## Fresh public marketplace GET checks

The following **read-only** calls were made to public search endpoints, without booking or provider handoff:

| Public API query | Products returned | Errors in sampled item fields |
| --- | ---: | --- |
| `/api/marketplace/search?provider=viator` | 24 Viator | 0 |
| `/api/marketplace/search?provider=tiqets` | 16 Tiqets | 0 |
| `/api/marketplace/search` | 26 mixed | 0 |

All sampled products had matching provider labels, positive prices, HTTPS booking URLs and internal detail URLs; the responses listed only `viator` and `tiqets` provider keys and **zero TourDesk products**. The amounts and product counts are a point-in-time API sample, **not** inventory guarantees, checkout tests, or proof of real-time bookability.

The earlier Phase 19 report already contains a separate live read-only 101-attraction-context / 27-match verification. **That full `verify-attraction-tours.ts` run was not repeated after the Phase 19 merges.** Task T-014 therefore remains IN PROGRESS until this acceptance step is re-run or a maintainer explicitly accepts the existing evidence.

## Outstanding limits / decisions

- **Sanity:** 146-document seed is validated in plan/dry-run, but no publication credential or published editorial dataset has been established. B-001–B-004 stay BLOCKED.
- **Field performance:** the local lab improved CLS (about 0.28 to 0.02–0.06) and transferred bytes, but **mobile LCP sometimes regressed**; production LCP and INP were not measured. T-010/B-016 remain open.
- **Editorial review:** model-based fact-check still has 21 UNCERTAIN attractions; human review not recorded. T-013 stays open.
- **Images:** Lupa Beach licensed hero added, four venue heroes still missing; shared artwork replacements require owner approval (T-005/T-006).
- **Guides:** three guides exceed the earlier 1,200-word target; owner's keep/trim choice pending (T-007).
- **TourDesk:** intentionally hidden and not called, pending replacement API access (B-006, B-007, B-015).
- **Accessibility:** automated axe and browser checks passed locally and in CI, but a manual screen-reader pass and live human accessibility review were not performed.

Do not mark those unresolved items DONE merely because CI passed.
