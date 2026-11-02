# Phase 19 live QA — production, 2026-11-02

Read-only checks of https://www.gotobuda.com after PR #30 was merged (main `d09dc7d`). Only public HTTP requests were made (no Vercel access, no
bookings, no forms, no provider hand-off followed). Evidence files are in `docs/phase19/`. The tools are `scripts/verify-live-pages.mjs`,
`scripts/verify-marketplace-live.mjs` and `scripts/verify-attraction-tours.ts`.

## 1. The 128 public pages — VERIFIED LIVE

`node scripts/verify-live-pages.mjs --links` (400 ms between requests, retry on 429): `docs/phase19/live-pages-production.json`.

| Check | Result |
| --- | --- |
| Pages requested | **128** = 116 attraction pages + 8 guides + `/`, `/attractions`, `/guides`, `/tours` |
| HTTP 200 | **128 of 128** (0 failures, 0 redirects) |
| Canonical URL ends with the page path | 116 of 116 attractions, 8 of 8 guides |
| `<h1>` contains the attraction name | 116 of 116 |
| Long-form sections ("About …" and "Plan your visit") | 116 of 116 attractions |
| Photo credit line present | 111 of 116 attractions; the other 5 have no photograph (T-005, see below). For the three shared-artwork heroes (Matthias Church, Parliament, Fisherman's Bastion, T-006) the credit found is the gallery's, the hero artwork itself is uncredited |
| Listed in `sitemap.xml` (137 URLs) | 116 of 116 attractions, 8 of 8 guides |
| Guides carry a photo credit | 8 of 8 |
| Internal links and local images found on the pages and requested once | **268 unique, all HTTP 200** |
| TourDesk product link on `/`, `/attractions`, `/guides`, `/tours` or in the sitemap | **none** |
| Problems reported by the script | **0** |

Not covered by this check: mobile layout and the rendered ticket rows (they are drawn in the browser; the browser cannot reach www.gotobuda.com from this
machine — organisation filter, B-008/B-009). Those are covered by the local Playwright run (desktop and mobile) and by section 3.

### The three pages whose live check had been incomplete

Fetched and inspected directly (HTTP 200, title, one h1, canonical, JSON-LD, 49-51 word description, history headings, cited source links, images):

| Page | h1 | Hero credit | Images | Content checks |
| --- | --- | --- | --- | --- |
| `/attractions/armenian-catholic-church-ujbuda` | Armenian Catholic Church — Újbuda | Globetrotter19 · CC BY-SA 3.0 · Wikimedia Commons | hero 200 image/webp (210 KB) | address "Orlay", the corrected interview quote ("first family") present; 5 history headings, 12 external source links |
| `/attractions/pozsonyi-road-reformed-church` | Pozsonyi Road Reformed Church | Karelj · Public domain · Wikimedia Commons | hero 200 image/webp (26 KB) | 6 history headings, 12 source links; the photo's Commons page is in the category "Pozsonyi Road Reformed Church" |
| `/attractions/rumbach-street-synagogue` | Rumbach Street Synagogue | József Rozsnyai · CC BY-SA 4.0 · Wikimedia Commons | hero and 2 gallery images 200 image/webp | Phase 18 wording live: facade colours not stated ("left unstated"), tablets of Moses attributed; 5 history headings, 14 source links |

All 16 sacred-architecture pages answer 200 with long-form text, photo credit and sitemap entry.

## 2. Marketplace (Viator and Tiqets) — VERIFIED LIVE (read-only API)

`node scripts/verify-marketplace-live.mjs` (2.4 s between requests, under the API's 30 per minute): `docs/phase19/marketplace-production.json`.

| Check | Result |
| --- | --- |
| Queries | 19: default, provider=viator, provider=tiqets, 10 categories, 3 sorts, a price filter, a search (`parliament`), page 2 |
| Distinct products seen | **146** (Viator 111, Tiqets 35) |
| Providers present | Viator and Tiqets only; TourDesk absent from every response and its status is not reported |
| Booking URLs | https, provider domain, partner parameters (Viator `pid` + `mcid`, Tiqets partner parameter): 0 problems |
| Prices | every product has a positive price with a currency; none invented (a price is shown only when the API supplies it) |
| Internal product pages | every product has `/tours/<provider>/<id>`; 8 sampled pages (4 per provider) answer 200 with exactly one provider hand-off link, an availability section and no TourDesk link |
| Categories | 9 of 10 return products; `family` returns 0 (shown as the honest empty state) |
| Sorting | price low→high and high→low are monotonic (2.87 … and 8,559.79 … EUR); rating sort answers |
| Pagination | page 2 repeats no product of page 1 |
| Problems reported | **0** |

### Ticket and tour cards on attraction pages (conservative matching)

`npx tsx scripts/verify-attraction-tours.ts` against the production API with the page's own filter: `docs/phase19/attraction-tours-production.txt`.
101 attractions have a booking context; **27 show products, 74 show none**; 86 of 86 products have a Viator or Tiqets provider, an internal page, an affiliate
URL on the provider domain and a real price; **0 problems**. Same set of 27 attractions as the Phase 17 run. The four named failure cases are absent: no
Parliament product on the Opera page, no Gellért Hill tour on the Gellért Bath page, no dinner cruise on Light Art Museum, no folklore show on National Dance
Theatre (their pages show no row). The rows are drawn in the browser, so the production DOM itself was not observed; the local mocked Playwright suite does.

## 3. What this does not prove

* Browser rendering on production (layout, mobile navigation, the ticket rows, TourDesk hidden in the DOM) — BLOCKED from this machine; covered locally.
* Sanity production state — see `docs/RELEASE_STATUS.md` (Phase 19).
* Field Core Web Vitals (INP) and production Lighthouse — BLOCKED (see `docs/PERFORMANCE.md`).
