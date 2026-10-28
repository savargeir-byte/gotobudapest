# Booking engines: what was reused, ported, adapted and left unverified

Reference repositories (read-only, never modified): `GoIceTravel` @ `8d3e5523` (TourDesk),
`goTene` @ `5097540` (TourDesk, Viator, Tiqets). Compared 2026-10-26; the comparison found
Budapest already built on the proven engines, so only the gaps below were closed. Nothing was
rewritten.

## REUSED (verbatim)

| Area | Budapest file | Source |
| --- | --- | --- |
| TourDesk types | `lib/tourdesk/types.ts` | GoIceTravel `src/lib/tourdesk/types.ts` (comment/whitespace-identical) |
| Compatibility (slot-id classes A-C, product constraints) | `lib/tourdesk/compatibility.ts` | GoIceTravel `compatibility.ts` |
| Pricing (per-person, group, pickup, effective participant range) | `lib/tourdesk/bookingPricing.ts` | GoIceTravel `bookingPricing.ts` |
| TourBooking payload shape (`isWidget`, `availabilityId`, `pickupPlace: 0`, `variantId`, `priceCategories`, `bookableExtras`: flat rows or `null`, see the journey section below) | `app/api/booking/tourdesk/checkout/route.ts` | GoIceTravel `buildTourDeskPayload` |
| Viator affiliate-only model, exact API `productUrl` | `lib/budapest-offers.ts`, `lib/booking/products.ts`, `components/viator/*` | IcelandTripGuide approach; goTene also has `supportsBookingApi: false` |
| Viator product detail parsing (images/srcset, rating, duration, itinerary, logistics, inclusions, additional info, cancellation incl. `isFreeCancellation`, options, languages, booking requirements) | `lib/booking/viator-product.ts` | IcelandTripGuide `src/lib/viator/{types,utils,products}.ts` field names and rules; ADAPTED with defensive parsing (https-only URLs, markup stripped, absent sections omitted) |
| Viator season-aware schedules to bookable dates (`normalizeSchedules`, `dateAvailability`, 384-day open season, `summary.fromPrice`) | `lib/booking/viator-schedules.ts`, `app/api/booking/viator/schedules/[code]/route.ts` | IcelandTripGuide `src/lib/booking/adapter.ts` (logic verbatim, time zone Europe/Budapest, hardened `providerFetch`) |
| Viator live check (`POST /availability/check`: `unavailableReason`, `lineItems`, special/original retail price) | `app/api/booking/viator/check/route.ts` | IcelandTripGuide `adapter.ts` `extractRetailPrice`/`buildSlotPrice`; ADAPTED, response reduced to retail prices |
| Viator product page (gallery, details, calendar + age-band steppers, options, final "Continue to Viator") | `components/viator/ViatorProductPage.tsx`, `ViatorGallery.tsx`, `ViatorAvailability.tsx` | Structure follows IcelandTripGuide booking sheet; UI reuses the TourDesk `DateCalendar`/`Stepper`; Budapest navy/teal styling |
| Tiqets affiliate-only listing (`product_url`, `partner`) | `lib/budapest-offers.ts` `tiqets()` | goTene `providers/tiqets` model |

## PORTED from goTene in this change

| Safeguard | Budapest file | goTene source |
| --- | --- | --- |
| `POST /TourBooking` failure classification: definite refusal (success:false / 4xx) = no order, retry allowed; anything uncertain (timeout, network error, 5xx, unreadable body, unusable checkout URL) = `ORDER_STATUS_UNKNOWN`, never "try again", UI locks resubmission (also across reload) and points to TourDesk; `diagnosticId`; safe log line | `lib/booking/checkout.ts`, checkout route, `components/tourdesk-booking.tsx` | `booking.ts` `classifyCheckoutFailure`, `BookingError`, TourDeskBookingWidget lock |
| 20 s timeout for the transactional POST (reads keep 12 s) | `lib/booking/checkout.ts`, `lib/booking/common.ts` | `client.ts` `BOOKING_TIMEOUT_MS` |
| Checkout/product host trust: https, no credentials, no port, host is `tourdesk.is` or `*.tourdesk.is`, plus reviewed `TOURDESK_ALLOWED_BOOKING_HOSTS`; spoofs (`checkout.tourdesk.is.evil.example`, `eviltourdesk.is`) rejected | `lib/booking/checkout.ts` (`isValidCheckoutUrl`, `safeTourdeskUrl`) used by offers, products and the checkout route | `booking.ts` `isValidCheckoutUrl` (a real incident there: an unlisted per-account host created an order but blocked the traveller) |
| Native TourDesk checkout gate, **default off**: `TOURDESK_BOOKING_ENABLED=true` or listed in `TOURDESK_PILOT_KEYS` | `lib/booking/gate.ts`, product page, checkout route | GoIceTravel `bookingGate.ts`/`config.ts`, goTene `config.ts` |
| Slot-id format D (`^\d{14}-\d{4}-\d{2}-\d{2}$`, open tickets) | `lib/tourdesk/compatibility.ts` | goTene `compatibility.ts` |
| Viator: widest image variant; optional `VIATOR_BUDAPEST_DEST_ID` override | `lib/budapest-offers.ts` | goTene `pickImages`, `destinations.ts` |
| Read-only catalogue diagnosis (global scan + geo scan + detail coordinates + text probes + verdict) | `scripts/diagnose-tourdesk-catalog.mjs` (`npm run diagnose:tourdesk`) | goTene `scripts/diagnose-tourdesk-catalog.mjs` |
| TourDesk Budapest **discovery**: geolocation search `{lat 47.4979, lon 19.0402, radius 30000}`, page 0, pageSize 500, paged until unique products == `totalCount` (max 10 pages; changed totals, no-progress pages, surplus uniques or an implausible total > 2000 are **rejected**, then retried once at pageSize 100); bounded text/global-scan fallback (max 30 pages of 500, marker + exclusion regexes) only when geo is empty or rejected; Budapest guard on every row (`safeTourdeskUrl` host, destination markers); 401/403 = "TourDesk rejected the credentials"; zero rows = `empty` with the strategies tried; result cached 30 min under tag `tourdesk-catalog`, marketplace search/filter/sort/cursor served from that cached subset | `lib/tourdesk/discovery.ts` (pure), `lib/tourdesk/discovery-cache.ts`, `lib/marketplace/providers/tourdesk.ts`, `tourdesk()` in `lib/budapest-offers.ts`, tests `tests/tourdesk-discovery.test.ts`, `e2e/tourdesk-discovery.spec.ts` (MOCKED) | goTene `catalog.ts` (geo contract, totalCount validation, GEO_MAX_PAGES, bounded text-scan fallback, fail-closed) **adapted**: Budapest centre/markers/exclusions (shape of `tenerife.ts`), Budapest guard and cache scope; the account-scoped cache key and "cache only definite answers" rules are ported as designs, not copied verbatim (different fetch layer: `providerFetch`, closed hosts) |

TourDesk discovery switches: `TOURDESK_DISCOVERY=geo|text|auto` (default `auto` = geo, then the bounded scan, then an honest empty note; `geo` never scans; `text` uses free-text only and is always best effort). `TOURDESK_API_BASE_URL` is **not supported** by the app (closed provider hosts in `lib/booking/common.ts`); it only exists in the owner diagnostic script. Region/tag/vendor filters are deliberately not used (non-functional on these accounts per GoIceTravel/goTene). Foreign inventory is never substituted: Iceland/Tenerife products are excluded, never shown.

Tests added: `tests/booking-safeguards.test.ts` (host spoofs, failure table, gate, format D, order id),
contract and browser tests updated for default-off gate and the uncertain-order lock.

## ADAPTED for Budapest

- Destination: Budapest/Hungary text and geolocation (47.4979, 19.0402, 30 km), no Iceland/Tenerife products ever substituted.
- Return URL: `NEXT_PUBLIC_SITE_URL` (validated origin) or `https://www.gotobuda.com` (`PRODUCTION_ORIGIN` in `lib/site.ts`) + `/booking/return` (server-owned, never browser input; invalid env values fall back to the production origin).
- Branding, copy and the neutral support wording (the site has no support contact, travellers are pointed to TourDesk).
- Currency: the provider's own currency is used and the quote must match; no ISK/EUR default.
- Hosts: Budapest account's checkout portal host is **unverified**; `*.tourdesk.is` covers per-account portals.

## NOT PORTED (with reason)

- goTene `appendAffiliate` and the synthetic `tours/<Destination>/d0-<code>` Viator handoff: Budapest keeps the exact API `productUrl` (more correct; tests assert it); goTene defaults (`mcid` 42383) belong to another account.
- Tiqets `/v2/cities` city id and `sort=popularity`, Viator tag resolver: unverified against live data for this key tier; keyword filtering remains.
- Tier pricing, exclusive category groups, multi-occupancy categories, per-person `chargePerBooking`, hidden prices, combo activities, question-based pickup: deliberately handed off to TourDesk's full flow (extras, dependants and pickup are now native, see below).
- `?k=<uniqueKey>` return parameter, Firestore-distributed rate limiter: not available/needed here.

## UNVERIFIED (needs live credentials or the owner)

- TourDesk Budapest inventory (live result is 0 offers in 11 contexts; cause unproven: run `npm run diagnose:tourdesk`).
- Real `POST /TourBooking` checkout creation, hosted checkout host, payment confirmation: no order was ever created.
- Viator `availability/check` on this key tier; Tiqets variants/availability.
- Vercel environment scopes (no access), live preview behaviour.
- Everything under "mocked" in `docs/RELEASE_STATUS.md` passed only against local stand-ins.

## TourDesk journey: GoIceTravel widget vs Budapest

Reference: GoIceTravel `src/components/TourDeskBookingWidget.tsx` (~1,770 lines) with
`src/components/tourdesk/*`, `src/lib/tourdesk/bookingCalendar.ts` / `bookingPricing.ts` and the
`/api/tourdesk/*` routes @ `8d3e5523` (read-only). No second booking engine was written:
Budapest keeps one TourDesk component (`components/tourdesk-booking.tsx`) behind the same product
page and the same default-off gate.

### Gap table

| Step of the journey | GoIceTravel | Budapest before | Budapest now |
| --- | --- | --- | --- |
| Available dates | month-grid calendar, `GetAllDates`, disabled/sold-out days, max view month | `<select>` of dates | **Ported calendar** (`components/tourdesk/calendar.tsx`, `lib/tourdesk/bookingCalendar.ts` verbatim): dialog, month navigation, Escape/focus return, bottom sheet on phones |
| Departure times | slot buttons with sold-out / few-left hints | `<select>` | Radio group (`steps.tsx` `SlotPicker`), sold-out/unavailable disabled, "(N left)" |
| Variants / options | variant cards, fixed group price | `<select>` | Radio cards (`VariantPicker`), "Group price" for fixed |
| Participants | steppers, default adult, `computeCategoryMaxQty`, effective range | number inputs | Steppers (`ParticipantRows`) clamped by the same helpers; dependant categories need an adult (goTene rule, enforced server-side too) |
| Add-ons (bookable extras) | per-category and flat extras, `limitByPax`, stock | handed off | **Native** (`ExtrasPicker`, `lib/tourdesk/extras.ts`), priced and validated server-side |
| Pickup | optional / mandatory, per-category pickup price | optional, tour level only | Optional or mandatory at tour **or option** level, priced per category |
| Live prices | breakdown in the panel | total only | Tickets / Pickup / Add-ons lines + total; total recomputed on the server from fresh availability |
| Secure checkout | `POST /api/tourdesk/book` | same route, goTene hardened | unchanged protections (below) |

### Verbatim vs adapted

| Piece | Status | Reference |
| --- | --- | --- |
| `lib/tourdesk/bookingCalendar.ts` | verbatim (2-line header) | `src/lib/tourdesk/bookingCalendar.ts` |
| `lib/tourdesk/bookingPricing.ts`, `types.ts`, `compatibility.ts` | verbatim (earlier change) | same names in GoIceTravel |
| Calendar, slot, variant, stepper, extras and pickup UI | **adapted**: same interaction model, rewritten as small client components with Budapest CSS (`components/booking-panel.css`), no Firebase/GA4/Sanity, no Iceland copy | `TourDeskBookingWidget.tsx`, `tourdesk/TourDeskBookingChoices.tsx` |
| Extras selection model (`ExtraSelections`, total, validation) | **adapted**, new file | GoIceTravel total formula; goTene `validateExtras` |
| `selection.ts`: non-empty price-category list rule, dependant-without-adult, extras in `selectionError`/`selectionTotal` | **adapted** | goTene `slotPriceCategories`, `DEPENDANT_WITHOUT_ADULT` |
| `bookableExtras` in `POST /TourBooking` | **adapted, deliberate divergence**: flat rows `{bookableExtraId, priceCategoryId, quantity}` as in TourDesk's public OpenAPI `TourBookingBookableExtra`; GoIceTravel sends a nested shape. Verify with a real key before enabling | TourDesk swagger |
| Server trust model | **stricter than GoIceTravel**: GoIceTravel's route does not recompute totals or validate extras; Budapest re-reads availability uncached and rejects forged variant/category/extra ids, over-limit quantities, stale stock and a quoted total that differs from the recomputed one | goTene `booking.ts` |

### What still hands off to TourDesk (and why)

Tier pricing, exclusive category groups, multi-occupancy categories, per-person
`chargePerBooking`, hidden prices, combo activities, question-based pickup and unsupported
slot-id formats. Each one changes price or validity rules the widget cannot show faithfully;
flattening them would risk charging the wrong amount. `selection()` flags them as unsupported
and the UI shows the provider link instead. The "See all options on TourDesk" link stays on the
native widget too. With the gate off (default) the whole product page is the provider handoff.

### Safeguards and gate (unchanged, re-tested with add-ons)

- Gate: `TOURDESK_BOOKING_ENABLED=true` or `TOURDESK_PILOT_KEYS`; default **off**.
- `ORDER_STATUS_UNKNOWN` (`classifyCheckoutFailure`), `diagnosticId`, 20 s POST timeout, no
  automatic retry; client lock (sessionStorage, 30 min, survives reload); single in-flight POST
  (double click creates one order); host trust `tourdesk.is` / `*.tourdesk.is` +
  `TOURDESK_ALLOWED_BOOKING_HOSTS`; Budapest-only destination guard; server-owned return URL;
  provider currency, never a default.

### Tests (all MOCKED, no real order, hold or payment)

- `e2e/booking-ui.spec.ts`: full journey (calendar, radios, steppers, dependants, add-ons,
  pickup, price breakdown, flat payload, one POST), mandatory pickup (option and tour level),
  add-on price drift, add-on stock drop, uncertain order with add-ons; desktop 1440x900 and
  mobile Pixel 7 projects, with layout/overflow and keyboard checks.
- `e2e/native-booking-contracts.spec.ts`: in-process checks of `POST /api/booking/tourdesk/checkout`:
  flat extras payload, forged/stale/over-limit extras (409, no POST), malformed extras (400),
  quoted-total drift including add-ons and pickup, dependants, unknown/ghost variants, mandatory
  and unavailable pickup, `ORDER_STATUS_UNKNOWN` with add-ons (one POST).

### Risks that need a real key

1. Whether the live Budapest products expose extras/variants as the mock assumes.
2. The flat `bookableExtras` row shape against the real `POST /TourBooking` (documented, unproven).
3. The Budapest account's checkout host (covered by `*.tourdesk.is`, unconfirmed).
4. `pickupPlace: 0` with mandatory pickup and no pickup place chosen: TourDesk may require one.

## Marketplace UI (`/tours`, editorial rows, Tiqets product page)

Status labels: **MOCK VERIFIED** = proven in Playwright/node:test against the local mock provider
(no live provider contacted); **UNVERIFIED** = written against documented APIs, never run live.

| Piece | Source | Status |
| --- | --- | --- |
| `/tours` search, tabs, filters, sort, chips, Load more | New UI on the committed `GET /api/marketplace/search` contract | MOCK VERIFIED |
| Product cards (internal "View details & availability" link only) | New; provider URL never on a card | MOCK VERIFIED |
| Editorial rows (home, attraction, experience, neighbourhood, guide) | `ContextualTours` + `lib/marketplace/context.ts`, lazy client fetch of the same API | MOCK VERIFIED |
| `/tours/tiqets/[id]` product page | Adapted from goTene's Tiqets detail/availability mapping (read-only GETs only) | MOCK VERIFIED; live response shapes UNVERIFIED |
| Attraction photo on the Tiqets page | Credited editorial photo, only on an exact name match; no supplier images | MOCK VERIFIED |

Not ported: any Tiqets order, booking, reservation, hold or payment call (a unit test fails if
`tiqets-detail.ts` ever names one); supplier imagery (the key tier returns none and licensing is
unconfirmed); discounts/"was" prices (never displayed).

Hand-off rule: the card links to our page; the page ends with "Continue to Tiqets" carrying the
API's `product_url` byte for byte. Selections made on our page may need repeating on the provider.

Open items: live Tiqets `/products/{id}` and `/availability` field names (the mapper whitelists
several candidates); whether the account is authorised for availability (403 is handled);
Tiqets category searches send one broad word (`TIQETS_CATEGORY_TERM`), live recall unverified.

## Image quality (issue #11)

Nothing here is reused from GoIceTravel or goTene: the photo selection is new, in
`lib/marketplace/images.ts`. Helpers other surfaces can use: `normalizeVariants` (validate and bound
provider renditions), `pickVariant(variants, cssWidth, dpr)` (smallest sufficient real rendition, or the
widest flagged source-limited), `buildSrcSet(variants, "grid" | "row")` and `cardImage(image, layout)`
(src/srcSet/sizes for a card). The Viator product gallery can call `pickVariant(image.variants, width,
dpr)` instead of `image.small`; `image.src` is the widest stored rendition. Rule of thumb that must hold:
never use a rendition narrower than 320 px, never enlarge a poor source, never fetch more than ~1200 px
for a card.
