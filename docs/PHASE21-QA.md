# Phase 21 — live verification of the Phase 20 release, editorial follow-up, MASTER_TODO reconciliation (2026-11-03)

Main `2390a86` (merge of PR #38). Evidence files are in `docs/phase21/`. Labels: **VERIFIED LIVE** = observed on https://www.gotobuda.com over public HTTP;
**VERIFIED LOCALLY** = local build or tests; **MOCKED** = local mock providers; **BLOCKED** = could not be done, with the reason.

## 1. GitHub state

| PR | State | Evidence |
| --- | --- | --- |
| #38 Phase 20 (title-only tour matching, responsive home hero, accessibility, editorial) | **merged** 2026-11-03 10:09 UTC, merge commit `2390a86` | its head `426df67` had all eight checks green: CodeQL, build, verify, analyze, booking-partners, photos, galleries, histories (+ Vercel Preview Comments); the merge commit reports build, verify and analyze green |
| #37 Phase 19 post-merge docs | merged, merge commit `e4f2f46` | |
| #34, #36 Dependabot (sanity-plugin-media 6.6.0, sanity group of 3 updates) | open, not reviewed in this phase | |
| Issue #22 (licensed photos for image-less Tiqets cards) | open | |

Deployment: production already serves the Phase 20 code (home HTML contains the `<picture>` hero and the `.hero>picture>img` rule and the phone shade `#05182370` are in the deployed stylesheet), observed 2026-11-03 10:28 UTC.
T-015 (open and merge the Phase 20 PR) is therefore **DONE**.

## 2. T-014 — live audit of all 101 attraction contexts (VERIFIED LIVE, read-only API)

`npx tsx scripts/verify-attraction-tours.ts` against production, 2.3 s between requests; `docs/phase21/attraction-tours-production.txt`.

| Measure | Expected from the local run | **Live result** |
| --- | --- | --- |
| Attraction contexts | 101 | **101** |
| Attractions with relevant products | 26 | **26** |
| Without a match (no row is drawn) | 75 | **75** |
| Product cards shown | 75 | **75** |
| Structural problems (provider, internal page, https affiliate URL on the provider domain, price) | 0 | **0** |

* **Every product shown names its attraction in its title.** The list was read line by line (all 75). Parliament: only products with "Parliament" in the title; St. Stephen's Basilica: only "Basilica" products (the Parliament-and-Basilica
  combo is the only mixed one and names both); Chain Bridge: one product that names it; Heroes' Square: two that name it; Margaret Island: four that name it; Dohány Street Synagogue and Rumbach: synagogue products;
  Széchenyi, Lukács, Rudas, Palatinus: products naming the bath. **No product is a generic sightseeing tour that merely lists the place in its description** (that was the Phase 19 defect, 21 of 121 matches).
* Hungarian State Opera, Gellért Bath, Light Art Museum, National Dance Theatre, the Garden of Philosophers, Museum of Fine Arts and the funicular show **no row**: no Parliament tour on the Opera page, no Gellért Hill tour as bath
  admission, no dinner cruise on Light Art Museum, no folklore show on National Dance Theatre.
* All 75 products carry the affiliate hand-off (`affiliate: yes` for 75, no `CHECK`), an internal `/tours/<provider>/<id>` page, a real provider price (Viator and Tiqets, EUR) and a provider-domain https booking URL.
* No incorrect association was found, so no code change and no new regression test were needed. T-014 is **DONE**. The rendered rows are drawn in the browser; the browser cannot open the site from this machine (see section 4), so the production DOM was not
  observed: the empty case (no relevant product, nothing rendered) is covered by the code (`ContextualTours` renders nothing) and by the mocked Playwright suite.

## 3. Marketplace end to end (VERIFIED LIVE, API)

`node scripts/verify-marketplace-live.mjs`, 2.4 s between requests; `docs/phase21/marketplace-production.txt`: 19 queries (default, provider=viator, provider=tiqets, 10 categories, price sorts ascending and descending, rating sort, a price filter,
a search for "parliament", page 2); 144 distinct products (Viator 110, Tiqets 34); only Viator and Tiqets in every response; https booking URLs on the provider domain with partner parameters; positive prices; internal pages (8 sampled, 200, one provider hand-off,
availability section); 9 of 10 categories return products (`family` returns 0 and is shown as the honest empty state); price sorts monotonic; page 2 repeats nothing; **0 problems**. Product photographs are provider-supplied https images (a card without one stays text-only);
availability is shown only on the product page and only from the provider. No booking was made; no provider hand-off link was opened.

### TourDesk stays hidden (VERIFIED LIVE)

`/api/marketplace/search?provider=tourdesk` answers 400 "Invalid parameter: provider"; `/tours/tourdesk/70001-1` answers 307 to `/tours`; `/tours` and `/tours?provider=tourdesk` contain no "TourDesk" text (0 occurrences); no TourDesk key in any
marketplace response; no TourDesk link on `/`, `/attractions`, `/guides`, `/tours`. The integration code is untouched.

### The 128 pages (VERIFIED LIVE)

`node scripts/verify-live-pages.mjs --links`: **128 of 128** answer 200 (116 attractions, 8 guides, `/`, `/attractions`, `/guides`, `/tours`) with canonical, h1, long-form and history sections, meta descriptions of 35-70 words, the exact guide inline photo counts and
sitemap entries (137 URLs); **284 unique internal links and local images, 0 failing**; 0 problems. This is an HTTP check, not visual QA.

## 4. Homepage hero and performance on production

**Verified live over HTTP (not rendered):** the home HTML has exactly one hero `<picture>` with `<source media="(max-width: 900px)" srcSet="/assets/danube-1280.webp">` and one `<img src="/assets/danube.webp">` (2000x1325), so a phone is told to fetch the 1280 px
file (127,730 bytes, 1280x848) and a wide screen the full file (384,250 bytes, 2000x1325); the only image preload link is the logo (no duplicate hero preload); the deployed stylesheet has the `.hero>picture>img` rule and the deeper phone shade. The artwork is the
same photograph. Fetching and layout in a browser (the phone really downloads only the 1280 px file, no CLS regression) is covered locally by `e2e/performance-guards.spec.ts` and `e2e/accessibility.spec.ts` (hero contrast) on the identical build.

**New finding, fixed on this branch:** the static files in `/assets` (images, logo) were served with `Cache-Control: public, max-age=0, must-revalidate`, so a returning visitor revalidated every image and font. The branch sets
`max-age=604800` plus a day of stale-while-revalidate for `/assets`, a year and `immutable` for `/fonts`, one day for `/favicon.ico`; pages are unchanged (the platform's HTML caching). `e2e/performance-guards.spec.ts` guards it. VERIFIED LOCALLY; reaches production when merged.

**Production Lighthouse and field Core Web Vitals: BLOCKED (B-016).** Attempted again today: Microsoft Edge opens the site as "Content blocked by your organisation" (an organisation filter), Chrome fails with `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`, the
PageSpeed Insights API answers 429 (the unauthenticated daily quota is exhausted) and the CrUX API answers 403 (it needs an API key). No key was requested. LCP, CLS and INP of the live site are therefore unmeasured; the figures in `docs/PHASE20-QA.md` are
lab figures from local builds with browser-applied throttling and are not field data.

**B-008 and B-009 (live browser QA):** still BLOCKED for the same reason; HTTP checks do not replace visual QA and none is claimed.

## 5. T-013 — editorial follow-up (model-based; no human editor has signed it off)

Three research passes over the 19 attractions that were UNCERTAIN, using operator pages, registers and authoritative histories; 37 corrections applied; no claim was turned into VERIFIED because it was softened.

| Resolved | Result |
| --- | --- |
| Margaret Island motor traffic | Budapest Közút: you cannot drive through the island, entry needs a permit, the only parking is at the north end (text rewritten; CORRECTED) |
| Hungarian National Gallery | the late Gothic altarpieces are a permanent exhibition on mng.hu; a tourism listing says they will move to the Museum of Fine Arts after restoration (no date): a caution was added |
| Natural History Museum | the museum's own history page confirms the rebuilt Ludovika riding hall and the former Alfa cinema that burned in 1992 (VERIFIED; the "arson" wording dropped) |
| Kazinczy Street Synagogue | the congregation's page gives Kazinczy utca **29-31** (the house number is now in the address) |
| Goldberger Textile Collection | the museum's site lists five units and interactive elements with no Tamási or tutyi section; description and paragraph rewritten |
| Várkert Bazár | the official history page mentions several hundred stone and iron bullets "probably 1686" (restored with attribution); no current finds display is listed |
| Rumbach Street Synagogue | the official site confirms the 2021 reopening and the synagogue, events and Jewish Museum exhibition use; it names the Neolog community as commissioner while CJA and Wikipedia say Status Quo Ante: the text shows both |
| Fisherman's Bastion, Veli Bej, ice rink, City Park, Gellért Hill, Clark Ádám stone | construction years, the 1926 state (entrance hall only), the 27 June 1889 circus date and similar details reworded with their sources; disagreements are stated, not picked |

**Totals now** (`docs/ATTRACTION_FACT_CHECK.md`, `docs/fact-check/*.json`): 1,614 claims; 249 corrections; attractions **36 VERIFIED, 66 CORRECTED, 14 UNCERTAIN** (was 19), 0 BLOCKED; claims 1,402 verified, 165 corrected, 11 removed, 26 qualified, 10 uncertain.
**Still UNCERTAIN (14):** House of Music (sound dome wording only from Archinect), Andrássy Avenue (UNESCO wording: whc.unesco.org returns 403), Fisherman's Bastion (construction years differ), Gellért Hill (128 ha only from one Wikipedia article), City Park, City Park Ice Rink, Underground Railway Museum
(depth, 1960s plan and tunnel length from Wikipedia only; the address has no house number in the operator's page), Szamos Chocolate Museum (the official page is undated), Light Art Museum (strobe guidance only from a March 2026 guide), Veli Bej (1574-75 against 1570-72),
Millenáris (the view claim comes only from the operator), Clark Ádám stone (the 1849 move only from English Wikipedia), Rumbach and Kazinczy (current visiting not confirmed by an official page). Every one of them is attributed or hedged in the text.

## 6. T-005, T-006, T-007 (no change)

* **T-005**: Commons searched (Phase 20); production Sanity holds no assets (0 documents); the official sites that load (Szamos, the Castle Museum) carry no reuse licence (the Castle Museum: "© BTM Vármúzeum"), IKONO and the Museum of Illusions did not answer. No legitimate photograph was found for Szamos Chocolate Museum, IKONO,
  Budapest History Museum or Museum of Illusions; they keep the text-only design. The Lupa Beach hero from Phase 19 stays.
* **T-006**: the three shared artwork heroes (Matthias Church, Parliament, Fisherman's Bastion) are unchanged; replacing them needs the owner's approval.
* **T-007**: the three long guides (1,550, 1,624 and 1,676 words) are unchanged. They are practical and sectioned (getting around: ticket types, metro, trams, night network, funicular, boats, accessibility; bars and nightlife: areas, etiquette, getting home;
  food and markets: dishes, market halls, cafés, diets); each section answers a separate traveller question and carries its own FAQ and sources. Nothing in them is repetition or filler, so trimming to a number would remove usable detail. The owner decides: keep them
  (recommended) or ask for shorter versions.

## 7. Sanity (VERIFIED LOCALLY, write BLOCKED)

`--plan` and `--dry-run` run twice, identical output: 14 categories, 2 regions, 8 guides, 116 attractions, 3 experiences, 2 neighbourhoods, 1 settings = 146 editorial documents; 116 histories (29 stories); 17 galleries (44 images); 131 image files; 43 cross-link patches; validation passed (unique ids, schema
fields, references, https URLs, alt text). Photo licences: `verify-photos` 144 entries, 131 distinct source pages, all 200, licences allowed. The seed uses `createIfNotExists` and `setIfMissing` only. `sanity:verify` reads production without credentials: 0 documents of every type. `SANITY_API_TOKEN`
is not set here, so nothing was written, no `--force`. B-001 to B-004 stay BLOCKED.

## 8. Local checks for this branch

Typecheck, lint, 138 unit tests, production build, content, history, batch and photo validators pass; full Playwright run: 600 passed, 51 skipped, 0 failed (desktop and mobile).
