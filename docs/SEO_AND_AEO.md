# SEO, AI search (AEO/GEO) and conversion: audit, changes and plan

Status date: 2026-11-17. Branch `seo/growth-2026-11` (VERIFIED LOCALLY in part, see section 7; NOT merged, NOT live).
Labels: **OBSERVED** (read from the live site, read-only, Vercel alias) · **VERIFIED LOCALLY** (local build and tests) · **NOT MEASURED** (no data source available) · **OWNER ACTION**.

No search metrics appear in this file because none were available: there is no Search Console access from this environment (the GSC Wizard integration is not available here) and no keyword tool. Nothing below claims indexing, rankings, impressions or AI citations.

## 1. Audit (OBSERVED 2026-11-17, all 303 sitemap URLs, read-only)

| Finding | Evidence | Impact | Status |
| --- | --- | --- | --- |
| `/tours` lists Viator cards whose product page answers **404** | 16 `/tours/viator/<code>` links answered 404 | Direct revenue loss: a visitor clicks a card and lands on an error page | Fixed in this branch by merging the already-tested `fix/viator-listing-matches-detail` (listing and detail now share one acceptance rule); never reached `main` before |
| Home title was "GoToBudapest — A city worth getting lost in" and the description said "116 places" | live `<title>` and meta description; the site has 220 attraction pages | No keyword in the most important title; stale number | Fixed |
| 118 pages had meta descriptions over 165 characters (up to 338) | crawl | Truncated in results, text not under our control | Fixed: descriptions are clamped to 160 at a sentence or word end |
| 30 pages had titles over 62 characters with the site name | crawl | Cut mid-word in results | Fixed: such titles drop the site-name suffix |
| `/experiences/thermal-baths` etc. were titled "Soak up the city" (31 characters, no topic) | crawl | Weak relevance signal | Fixed with search-title overrides (`lib/seo-overrides.ts`); the on-page heading is unchanged |
| 5 attraction pages had no inbound internal link, 32 had fewer than 3 | link graph over the sitemap | The directory loads more places only with JavaScript | Fixed: `/attractions` now carries a server-rendered index of every place by category |
| 75 sitemap entries had no `lastmod` | sitemap | Minor | Neighbourhoods now carry their real research date; entries without a trustworthy date are left without one |
| No page told visitors or AI systems what the business is and how booking and affiliate links work | no About page, no contact page | Trust and answer-engine gap | `/about` added (partners named are the providers in use; no payment system of our own; affiliate disclosure) |
| No answer-first Q&A on attraction pages; no FAQ markup there | page structure | AI systems and snippets quote short direct answers | Quick answers block plus matching FAQPage JSON-LD added |
| Operator identity and a contact address for privacy requests are placeholders in `/privacy` | text of the page | Trust, and a legal requirement for the owner | **OWNER ACTION** (nothing was invented) |
| No `google-site-verification` or `msvalidate.01` tag on production | live HTML | Search Console cannot be connected through the tag | **OWNER ACTION**: set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (the code already renders it) or verify by DNS |

Already healthy (OBSERVED): 0 non-200 URLs, 0 canonical mismatches, 0 accidental noindex (filtered `/tours?...` views are intentionally noindex and canonical to `/tours`), 0 missing titles or descriptions, 0 duplicate titles or descriptions, exactly one `h1` per page, 0 images without alt, valid JSON-LD on every page, `lang="en"`, `robots.txt` allows all crawlers and names the sitemap.

## 2. Security

Next.js advisory GHSA-mfr8-8qww-v76h (medium, information disclosure across root params when a `use cache` function is called through `unstable_cache()`): affected `>= 16.3.0, <= 16.4.4`, first patched `16.4.5`. The repository uses `unstable_cache` in `lib/tourdesk/discovery-cache.ts`. Updated `next` 16.4.3 -> **16.4.5** (the smallest patched version). The lockfile was changed only for `next` and `@next/*` (a plain `npm install` with npm 11 rewrote about 500 lines, so it was reverted and the entries were bumped surgically). `npm ci`, type check and `npm audit` confirm `next` is no longer reported.
Remaining: 21 moderate advisories, all in the `sanity` / `next-sanity` dependency chain, whose fix needs a major `sanity` upgrade. Not done here (breaking change, unrelated to this task): see `docs/DEPENDENCY_REVIEW.md`.

## 3. AI search accessibility (AEO/GEO)

* **Crawler access (OBSERVED):** `robots.txt` is `User-agent: * / Allow: /` with the sitemap. No AI crawler (OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot, Google-Extended, Bingbot and others) is blocked, and there is no `X-Robots-Tag` header. Nothing to change. `Disallow: /api/` was considered and rejected: the tour rows load from those endpoints and a rendering crawler should be able to fetch them.
* **Content readable without JavaScript:** attraction, neighbourhood, guide and hub pages are server-rendered. The tour rows are loaded client-side, so partner products are not part of the indexable text; that is intended (they are third-party, changing data).
* **Answer-first structure added:** attraction pages now open a "Quick answers" block built only from page data (address and neighbourhood, Hungarian name, nearby places with distances, how booking works, where to check hours and prices) with FAQPage JSON-LD that mirrors the visible text exactly. It states no hours, prices or availability. Unit tests assert this.
* **Entity description:** `/about` describes the business, the sourcing method and the booking partners in plain language; the home JSON-LD already declares `Organization` and `WebSite`.
* **`llms.txt` (evaluated, not implemented):** no major search or assistant vendor has documented using it for retrieval or ranking, and adding it would only be a marketing claim. It can be added in about ten lines if a vendor documents support; revisit then.
* **AI referrals:** GA4 records the referrer as the session source, so visits from assistants appear under their hostnames (for example chatgpt.com, perplexity.ai, copilot.microsoft.com, gemini.google.com). Create a GA4 channel group or exploration that matches those hostnames. This captures only measured clicks from assistants and only for visitors who consented to analytics; it says nothing about citations that produce no click. NOT MEASURED yet (no GA4 access here).

## 4. Measurement and consent (unchanged, already in place)

Events (`lib/analytics/events.ts`): `tour_card_click`, `tour_detail_view`, `availability_check`, `provider_handoff`, `affiliate_link_click`, plus page, attraction, guide, experience and search events. They fire only after analytics consent (consent-first; verified live on 2026-11-11: banner with Reject all, no Google request before consent). An `affiliate_link_click` or `provider_handoff` is a click, never a purchase; confirmed bookings and commission must come from the providers' own reports. No change was made to tracking.

## 5. Lab performance (OBSERVED, unthrottled, real Edge, 2026-11-17)

Home, `/tours`, `/attractions`, a landmark page, a day-trip page, a neighbourhood and a guide, each on a Pixel 7 profile and desktop: largest contentful paint 0.3-1.1 s, layout shift at most 0.04, time to first byte 85-175 ms. These are lab figures on a fast machine without throttling, not field data (Core Web Vitals from real users need Search Console / CrUX): NOT MEASURED in the field. Lighthouse was not run.

## 6. Keywords, content and links (research, not measurements)

Full documents: `docs/seo/keyword-research.md` and `docs/seo/backlink-research.md`. Both were produced from live search results and fetched pages; they contain **no** volumes, difficulty scores or rankings (no tool provided them) and list what could not be verified.
Highest-value findings:
1. The only indexable commercial URL is `/tours`; product pages and category views are noindex by design. The plan is to strengthen existing guides and attraction pages with sourced facts and curated product cards, not to create indexable thin category pages.
2. Stale copy to fix next: the Danube guide still says live booking is not connected; product pages are titled "Book a Budapest experience | GoToBudapest | GoToBudapest".
3. Time-critical: a Christmas and New Year page (markets opened 13 November; the marketplace holds Christmas and New Year's Eve cruise products).
4. Rebuild the day-trips hub (Vienna, Szentendre, Danube Bend, Gödöllő, Puszta); rewrite the Budapest Card guide with a break-even example from official prices; add the train and shuttle to the airport page; write 2-day and 1-day itineraries.
5. Overlapping pages to differentiate (cannibalisation risk): four thermal-bath pages, three Danube pages, two bar pages, three Buda Castle pages.
6. **No price or availability from third-party summaries may be published**: sources conflict on Széchenyi, Lukács, Parliament, the 100E fare and the Fisherman's Bastion terrace; each needs the official source and a "checked on" date first.
7. Link building (ethical, manual, nothing sent): two verified broken-link opportunities, several editorial targets with a specific gap our pages fill, five linkable assets we could build from facts we can source, and ten outreach drafts marked DRAFT - NOT SENT. Prerequisites the research found: an About and disclosure page (now added) and a contact address (owner).

## 7. Verification status of this branch

All checks below ran locally on 2026-11-23 against a local production build and the local mock providers (no live provider and no production request).

* Type check clean; ESLint clean; **232 unit tests passed, 0 failed**; `npm audit`: `next` is no longer reported (21 moderate advisories remain, all in the `sanity` chain); production build succeeded.
* **Playwright, all projects (desktop, mobile, mocked booking UI, TourDesk-hidden, rate limits, discovery): 961 passed, 0 failed, 62 skipped** (optional or single-device tests).
* The Viator 404 fix is covered by `tests/viator-listing-parity.test.ts` (listing and detail share one rule) and the new `e2e/viator-links-booking-ui.spec.ts`: every Viator card in every category and on every page of results opens a product page that loads, no foreign product is listed, and the provider URL keeps its `pid` tracking parameter. The 16 production links that answered 404 were observed live on 2026-11-17; they have NOT been re-checked on production (not deployed).
* New SEO end-to-end spec (`e2e/seo-growth.spec.ts`): every sitemap page has one h1, a canonical on the real host, a description of 160 characters or fewer and a unique title; the crawlable index lists every place; quick answers match the FAQ markup; About page; sitemap lastmod.
* Existing tests that looked for a link or card by name on `/attractions` were scoped to the filterable directory (`#places`) because the new category index lists every place too.
* The photo-credit and card-image work (the `fix/card-images-final` commits, PR #68) is part of this branch unchanged; its tests (`card-images-booking-ui`, `image-quality`, `marketplace-ui`, accessibility) pass.
* NOT live: nothing is merged or deployed; production behaviour of every change is unobserved. Indexing, rankings and AI citations are not claimed.
