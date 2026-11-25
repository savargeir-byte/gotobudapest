# UX, conversion and discovery pass: audit, changes and what is left

Branch `feat/ux-cro-2026-11`, built on `seo/growth-2026-11` (PR #72) so none of the SEO, privacy, Viator, image or security work is lost. NOT merged, NOT deployed, NOT observed on production.

Labels: **OBSERVED** (seen in a real browser on the local production build) · **MEASURED (lab)** (script measurement, local build) · **NOT MEASURED** (needs real-user or provider data).

## 1. How the audit was done

* A local production build served with the **mocked** provider catalogue (`e2e/support/mock-provider.mjs`). No live supplier, no production request, no booking.
* Real browser (Edge, Playwright), 15 representative pages at **360, 390, 430, 768, 1024 and 1440 px** (home, tours, three tour categories, an empty search, a Viator and a Tiqets product page, the attractions directory, two attraction pages, a neighbourhood, an experience, a guide, About and the 404 page), plus the cookie banner on first visit. Full-page captures at 390 and 1440 px, first screen at the other widths. Harness: `e2e/ux-audit-booking-ui.spec.ts` (skipped unless `UX_AUDIT_DIR` is set).
* Per page and width: horizontal overflow, number of `h1`, images without `alt`, targets smaller than 24 x 24 px (WCAG 2.2 AA 2.5.8), page height.
* Limits: the mock catalogue has no real photographs (supplier images are stubbed with a flat colour, so photo quality was not judged here; that is covered by the existing image tests) and no real titles or prices, so card typography with long real titles was judged from the code and the earlier live audit, not from these captures. Lighthouse was not run. No accessibility compliance is claimed: automated checks (axe in the existing suite) and the target-size measurement are not a full WCAG audit.
* The full-size captures (about 107 MB for before and after) are not committed. A small set of before/after crops is in `docs/ux/comparison/`; the per-page after metrics are `docs/ux/after-metrics.json`.

## 2. Findings, by booking impact

| # | Finding (OBSERVED) | Why it matters | Status |
| --- | --- | --- | --- |
| 1 | The header button on every page read "Check availability" but only opened the tours list, and was an outline button that looked like a secondary link. | A label that promises more than the click delivers; the main booking entry point was the weakest element in the header. | Fixed: filled "Book tours". |
| 2 | Tour cards on the homepage and on attraction pages said "Check availability" but opened our own product page (the grid said "View details"). | Same mismatch, and two labels for one action. | Fixed: every card says "View details". |
| 3 | `/tours`: intro, a 410 px photograph and a 4-line paragraph pushed the search and the category filters below the first screen (mobile search at about 700 px, filters at about 800 px). | The page that exists to find a tour made the visitor scroll to find the search box. | Fixed: compact intro, 190 px (96 px on phones) photograph; search, filters and the top of the first card are in the first screen at 390 x 844 and 1440 x 900 (tested). |
| 4 | Viator product page: the only booking control in the first screen was a small text link; the booking panel sat about 1,000 px lower, under a 440 px gallery. | The decision point was off screen on arrival. | Fixed: the gallery moved into the details column so the (sticky) booking panel sits beside it, with the supplier's price, rating and free-cancellation flag. The CTA text is unchanged ("Book on Viator ↗": it opens the exact experience on Viator, where date and guests are chosen). |
| 5 | Tiqets product page on a phone: no persistent booking link; the hand-off was at the very end of the page (Viator already had a sticky bar). | Long page, CTA far away. | Fixed: sticky "Tickets on Tiqets" bar with the exact same sponsored URL; absent when the product is not on sale. |
| 6 | Attraction pages on phones: tours and tickets came after the main photo, the whole photo gallery (3 photos at about 360 px each) and the history, about 2,500 px down. | Our competitive advantage (editorial pages that lead to bookings) was buried on the device most visitors use. | Fixed: the booking rail now follows the main photograph (DOM order changed, so keyboard and screen-reader order match what is seen); wide screens keep the right-hand column. |
| 7 | River cruises appeared under "Thermal baths". Root cause in `lib/marketplace/categories.ts`: the bath rule matched the bare words "Szechenyi", "Gellert", "Rudas", "Lukacs" (also the Chain Bridge, the hill and the statue every river cruise passes) and any bath word in the summary text. | Wrong tab, irrelevant cards, lost trust. | Fixed in the rules, not per product: famous names count only next to a bath word; the title decides the main activity (cruise, bath, transfer, day trip) and the summary can no longer add another one; provider-tagged results (Viator) are dropped from a tab only when the title clearly names a different main activity. A genuine combination ("Danube cruise and thermal bath") keeps both. Unit tests with realistic titles. |
| 8 | Homepage on a phone was 27,252 px tall: 28 full photo cards for neighbourhoods came before the guides. | Booking-relevant and planning content was far down; slow scroll. | Fixed: order is now hero and search, tours, a booking-trust strip, places, experiences, guides, neighbourhoods, essentials. Eight neighbourhood cards, the other 20 stay plain links (all 28 remain linked from the homepage, tested). Page height 18,987 px at 390 px wide (MEASURED, lab). |
| 9 | Homepage: no statement near the tours of who takes the booking and how the site earns money (it was only on `/about` and `/privacy`). | Trust at the point of decision. | Added a three-point strip (real partner catalogues; you book and pay with the provider, no payments or personal details here; commission disclosure, link to About). Names only the providers in use. |
| 10 | Footer links overflowed the page by 20 px at 768 px wide on every page (introduced by the About link added in PR #72, 11 links in a non-wrapping row). | A horizontal scrollbar on tablets. | Fixed: links wrap. (Caught by this audit; a regression of the SEO branch, not of `main`.) |
| 11 | Breadcrumb links were 14 px tall (target size). | WCAG 2.2 AA 2.5.8 asks for 24 x 24 px. | Fixed with a 24 px minimum height. Other measured small targets are the hidden "skip to content" links (visible only on focus). |
| 12 | The hero search placeholder was cut off on phones ("Search cruises, baths, sightseeing tours..."). | Small, but it is the first control. | Shorter placeholder. |
| 13 | The attraction intro and the "Open map" button touched each other. | Spacing. | Fixed. |

## 3. Collections

The homepage category row now also offers **Family experiences** (the existing family category) and **Priced from €25 or less** (the existing server-side price filter). "From" is deliberate: the provider's own lowest listed price, not a promise that every option is that cheap. Viator applies the price filter before paging; Tiqets values are checked on the page returned, and the filters panel already says so. No "bestseller" or "popular" claim exists anywhere (no sales data). "Experiences for couples" was **not** added: there is no verified way to classify it from supplier data without guessing.

## 4. Marketplace behaviour that was checked and left alone

* Sorting: the filters panel already says that with several providers sorting orders each page, not a global ranking. Nothing claims global sorting.
* Required photo credits and the "illustrative photo" disclosures are untouched; the image fallback and credit tests pass.
* Affiliate URLs are carried unchanged (new tests read the `href` of every Viator and Tiqets hand-off; no checkout is opened).
* No payment gateway, TourDesk still hidden, no provider configuration changed.

## 5. Measurement (consent-gated, unchanged rules)

* New `tour_card_impression`: once per card, placement and page view, only after at least half the card was on screen, at most 24 per page view, only with analytics consent.
* `tour_card_click` now carries `page_path` (the page the card was on). `tour_detail_view`, `availability_check`, `provider_handoff` and `affiliate_link_click` carry `from_placement` and `from_path` when the visitor reached the product page by clicking a card in the same visit. That value is kept in memory only (nothing is stored in the browser, so the privacy page stays accurate); a reload or a direct landing leaves it out.
* Still true: a hand-off is a click, never a booking. Confirmed bookings and commission can only come from Viator's and Tiqets' own reports. Unit tests assert the allow-lists and that no event is named like a purchase.
* Provider and source landing page: provider is on every event; the session landing page is GA4's built-in dimension. GA4 itself was not inspected (no access here), so nothing about volumes is claimed.

## 6. SEO and AI search

Everything in PR #72 is preserved (the full suite for it passes on this branch). This pass adds crawlable internal links rather than new thin pages: the homepage keeps a link to every neighbourhood, attraction pages put relevant tours near the top, and the new collection links point at existing, `noindex` filtered views of `/tours` (canonical to `/tours`, as before). No new indexable pages were created, because the keyword research (`docs/seo/keyword-research.md`) found the commercial opportunity is in strengthening the existing guides and attraction pages with sourced facts, not in category pages. Not done here and still open: the Christmas and New Year page, the day-trips hub, the Budapest Card break-even guide (each needs official sources first). No search volume, ranking or AI citation is claimed.

## 7. Not done, and why

* **Mobile filter drawer and bottom navigation:** the filters already open as a panel on phones; a bottom navigation bar would duplicate the header and cover the new sticky booking bars and the cookie banner. Not added without evidence it helps.
* **Photographs:** no photograph was replaced or generated. Product images in the capture are stubs, so a visual judgement of supplier photography needs the live site.
* **Core Web Vitals:** unchanged by design (lab values from the SEO pass: LCP 0.3-1.1 s, CLS <= 0.04). Field data comes from Search Console, which ChatGPT can read. Lighthouse not run.
* **Sticky panel on very short desktop windows, long real titles, real supplier photos:** verify on the preview deployment.
* **Owner approval:** the redesign is deliberately modest (no new visual language). Before/after crops are in `docs/ux/comparison/` for review; nothing here is merged or deployed.

## 8. Before and after (first screen and key blocks, JPEG crops)

| Page | Before | After |
| --- | --- | --- |
| Home, phone (390 px) | `comparison/home-390-before.jpg` | `comparison/home-390-after.jpg` |
| Home, desktop (1440 px) | `comparison/home-1440-before.jpg` | `comparison/home-1440-after.jpg` |
| Tours, phone | `comparison/tours-390-before.jpg` | `comparison/tours-390-after.jpg` |
| Tours, desktop | `comparison/tours-1440-before.jpg` | `comparison/tours-1440-after.jpg` |
| Viator product, desktop | `comparison/viator-product-1440-before.jpg` | `comparison/viator-product-1440-after.jpg` |
| Attraction (Parliament), phone | `comparison/attraction-parliament-390-before.jpg` | `comparison/attraction-parliament-390-after.jpg` |

Final layout check (MEASURED, lab, 15 pages x 6 widths = 90 captures, mocked catalogue): no horizontal overflow at any width, exactly one `h1` per page, no image without `alt`. The only targets under 24 x 24 px left are the "skip to content" links, which are visible only when focused.

## 9. Tests

See the PR description and `docs/MASTER_TODO.md` T-026 for the counts. New: `tests/marketplace-categories.test.ts`, `e2e/ux-conversion-booking-ui.spec.ts`, impression tests in `e2e/consent-ga.spec.ts` (run with `PW_EXPECT_GA=1`; the file's stale selectors were fixed, it is skipped in the default run and in CI).
