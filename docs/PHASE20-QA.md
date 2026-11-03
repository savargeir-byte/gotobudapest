# Phase 20 QA — tour matching on production, mobile LCP, accessibility follow-up (2026-11-03)

Main at the start: `4afe4ff` (PR #30, #31, #32, #33 merged). PR #37 (Phase 19 post-merge docs) was still open; this branch is stacked on it, so it carries the PR #37 commit and
supersedes it if both are opened. Evidence files are in `docs/phase20/`.

Labels: **VERIFIED LIVE** = observed on https://www.gotobuda.com over public HTTP; **VERIFIED LOCALLY** = local build or tests; **MOCKED** = local mock providers; **BLOCKED** = could not be done.

## 1. T-014 — production tour matching (101 attraction contexts)

`npx tsx scripts/verify-attraction-tours.ts` asks the production API (`/api/marketplace/search`) exactly as an attraction page does and applies the page's own filter; read-only, 2.3 s apart.

| Run | Contexts | Attractions with products | Without | Products shown | Problems |
| --- | --- | --- | --- | --- | --- |
| Production as deployed (title and description matching), 2026-11-03 | 101 | 27 | 74 | 86 | 0 (all Viator/Tiqets, internal page, affiliate URL on the provider domain, real price) |
| This branch (title-only matching), same day, same live data | 101 | **26** | **75** | **75** | **0** |

Why the filter was tightened: of the 121 products the old filter matched on live data, 21 matched only because the place name appears in the product description. Examples that
were shown on attraction pages: a Danube night cruise and a "River Cruise and Walking Tour" on Chain Bridge, "General sightseeing tour" and a "hot pools and heroes" audio tour on Heroes'
Square, a city sightseeing tour on St. Stephen's Basilica, a private guided tour on Andrássy Avenue, a Danube cruise on Margaret Island, an e-scooter Citadel tour on the Garden of
Philosophers. None of them is a ticket or tour for that place. **Attraction pages now match the product title only** (`TourContext.titleOnly`); guides, experiences and
neighbourhoods keep title and description because they ask about a theme. Opera pages also accept the title phrases "State Opera" and "Opera House" (Opera products are titled either way).
Result: every product shown names the attraction in its title; the Garden of Philosophers row disappeared; with no matching title, no row is drawn.

Checked by name on live data: Hungarian Parliament shows only products with "Parliament" in the title; Hungarian State Opera, Gellért Bath, Light Art Museum and National Dance Theatre show **no**
row; no Gellért Hill product appears on the bath page, no dinner cruise on Light Art Museum, no folklore show on National Dance Theatre.

Regression tests (`tests/marketplace-ui.test.ts`): a description-only mention is not shown (generic sightseeing tour, Danube cruise, e-scooter tour), a title mention is shown, editorial
contexts still read descriptions, the Opera phrases, plus the earlier cases (Parliament on the Opera page, Gellért Hill on the bath page, whole-word matching, no-row places).

`node scripts/verify-marketplace-live.mjs` (19 queries, 2.4 s apart): 145 distinct products (Viator 110, Tiqets 35), Viator and Tiqets only, https booking URLs on the provider domain with partner
parameters, positive prices, internal `/tours/<provider>/<id>` pages (8 sampled, 200, one provider hand-off), 10 categories (`family` returns 0, shown as the honest empty state), price sorts
monotonic, page 2 repeats nothing, TourDesk absent from every response; **0 problems**. VERIFIED LIVE (API). The rendered rows are drawn in the browser; the browser cannot reach the site from this
machine (B-008), so the production DOM is not observed; the local mocked Playwright suite covers it. T-014 is DONE for the audit; the title-only change reaches production when this branch is merged.

## 2. T-010 / B-016 — why mobile LCP looked worse in Phase 19, and what is true

Lighthouse (Lantern simulation) reported mobile LCP up to +1.1 s after Phase 19. A second method was used: the browser applies the throttling itself (CPU 4x slower, 1.6 Mbit/s, 150 ms), Pixel 7
emulation, cold cache, 5 runs per cell, the LCP element and the request waterfall read from the page (`docs/phase20/lcp-real-throttle.json`). Builds compared: `d09dc7d` (before Phase 19), Phase 19 as merged, and the
responsive home hero of this branch. VERIFIED LOCALLY (lab).

| Page | Before Phase 19 | Phase 19 as merged | This branch |
| --- | --- | --- | --- |
| `/` | 7,608 ms | 5,128 ms | **3,176 ms** |
| `/attractions` | 996 ms | 832 ms | (same) |
| `/attractions/matthias-church` | 8,048 ms | 3,872 ms | (same) |
| `/guides/budapest-in-3-days` | 3,428 ms | 2,856 ms | (same) |

* **The Phase 19 "regression" was a property of the simulation, not of the pages:** with the throttling applied by the browser, every page improved in Phase 19 (home -2.5 s, a place page -4.2 s).
* **The actual LCP element** on `/`, on place pages with a shared-artwork hero and on guides is a hero image; on `/attractions` it is text. LCP is bandwidth-bound: the hero starts at about 200 ms, but the
  376 KB hero was finishing at 5.1 s because it shared the link with the logo (71 KB), fonts (78 KB), the JavaScript chunks (about 130 KB), three card images that start loading at 2.2 s, and eight route prefetches
  (about 70 KB, from 2.5 s).
* **Fix on this branch:** phones and tablets (up to 900 px) download the 1280 px rendition of the same hero artwork (125 KB instead of 376 KB); wide screens still get the full 2000 px file. Home LCP 5.1 s -> 3.2 s. The
  picture, crop and layout are unchanged. A preload link was tried and was not needed (same 3.2 s). `e2e/performance-guards.spec.ts` checks that a phone never fetches the 2000 px file.
* **Disagreement to know about:** Lighthouse's simulation scores the same variant worse (3.8-4.2 s against 3.1-3.2 s). Real users and Search Console field data follow the real network, not the simulation, but PageSpeed Insights
  (which uses the simulation) may show a different number. Which one the live site follows can only be settled with production data.
* **Still BLOCKED (B-016):** Lighthouse and field data on https://www.gotobuda.com (the browser cannot open the site from this machine, PageSpeed Insights answers 429 without an API key); INP (field only) was not measured. Remaining
  optimisation candidates, not done because each needs production measurement first: delay the route prefetches until after the hero, preload nothing else, shrink the 71 KB logo further.

## 3. Accessibility follow-up (VERIFIED LOCALLY)

* **Hero text contrast over the photograph (was an axe "incomplete" item):** measured by photographing the hero with the text hidden and comparing the pixels under each text extent with the text colour. Desktop: 0 % of pixels
  below the WCAG need (4.5:1, 3:1 for the large heading). **Phones: 12.9 % behind the eyebrow line and 23 % behind the intro line were below 4.5:1** because the shade fades out on the right. The phone shade
  now ends at alpha 0x70 instead of 0x30; after the change 0 % (worst pixel 4.9:1 and above). `e2e/accessibility.spec.ts` keeps it under 2 %.
* **Phone menu:** Escape did not close the open menu. It now closes it and returns focus to the menu button (test added). The hamburger glyph is decorative (`aria-hidden`); the name stays "Toggle navigation".
* **axe "incomplete" items reviewed** (7 templates, desktop and mobile): `color-contrast` over images and gradients — the hero (measured above), the card category tags (a tag has an 80 % opaque dark background, about 7:1 in the worst case, calculated rather than sampled) and the gallery zoom icon
  (decorative, `aria-hidden`); `label-content-name-mismatch` on icon-only buttons — fixed for the menu, the gallery buttons carry an `aria-hidden` glyph.
* Already covered and unchanged: skip link, focus ring on every tab stop, gallery and date dialogs (focus in, Escape, focus back), the mobile filter drawer (focus trap), labelled filters, `role="status"` counts, reduced motion.
* **Not done:** NVDA, VoiceOver and TalkBack testing. No claim of complete WCAG conformance is made.

## 4. Editorial

Seven visitor statements that could not be confirmed against a current official source were softened or removed (the Margaret Island car rule, the Capa print count, the Railway Park handcars, simulator, model railway and "since 2006", a planned store display at
the Goldberger collection, the Szamos tour languages); the Római-part and boating-lake sentences had been reworded in Phase 19. Fact-check totals now: 1,511 claims; attractions 36 VERIFIED, 61 CORRECTED, 19 UNCERTAIN;
claims 1,326 verified, 147 corrected, 11 removed, 13 qualified, 14 uncertain. No UNCERTAIN claim was turned into VERIFIED. The review is model-based; no human editor has signed it off.

Photographs: Commons was searched again (Hungarian and English names, categories) for Szamos Chocolate Museum, IKONO, Budapest History Museum and Museum of Illusions: nothing usable (the only Museum of Illusions files are Antwerp and Erbil; the Castle Museum has
archive Fortepan photographs and a courtyard sign, not a current view of the museum). All four keep the honest text-only design (T-005). The three shared artwork heroes are unchanged (T-006, owner approval). The three longest guides are unchanged (T-007, owner decision).

## 5. Sanity (VERIFIED LOCALLY, write BLOCKED)

`--plan` and `--dry-run` run twice with identical output: 14 categories, 2 regions, 8 guides, 116 attractions, 3 experiences, 2 neighbourhoods, 1 settings = 146 editorial documents; 116 histories (29 stories); 17 galleries (44 images);
**131** image files to upload (the Lupa Beach hero added one); 43 cross-link patches; validation passed (unique ids, schema fields, references, https URLs, alt text). The seed only uses `createIfNotExists` and `setIfMissing` patches, so it never replaces an existing
document or a Studio edit; `--force` needs `SANITY_SEED_FORCE=1` plus a token and is not used. `sanity:verify` reads production without credentials: 0 documents of every type. `SANITY_API_TOKEN` is not set here. B-001 to B-004 stay BLOCKED.
