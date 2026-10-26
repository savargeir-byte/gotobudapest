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
| TourBooking payload shape (`isWidget`, `availabilityId`, `pickupPlace: 0`, `variantId`, `priceCategories`, `bookableExtras: null`) | `app/api/booking/tourdesk/checkout/route.ts` | GoIceTravel `buildTourDeskPayload` |
| Viator affiliate-only model, exact API `productUrl` | `lib/budapest-offers.ts`, `lib/booking/products.ts`, `components/viator-booking.tsx` | IcelandTripGuide approach; goTene also has `supportsBookingApi: false` |
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

Tests added: `tests/booking-safeguards.test.ts` (host spoofs, failure table, gate, format D, order id),
contract and browser tests updated for default-off gate and the uncertain-order lock.

## ADAPTED for Budapest

- Destination: Budapest/Hungary text and geolocation (47.4979, 19.0402, 30 km), no Iceland/Tenerife products ever substituted.
- Return URL: `NEXT_PUBLIC_SITE_URL` or `https://gotobudapest.vercel.app` + `/booking/return` (server-owned).
- Branding, copy and the neutral support wording (the site has no support contact, travellers are pointed to TourDesk).
- Currency: the provider's own currency is used and the quote must match; no ISK/EUR default.
- Hosts: Budapest account's checkout portal host is **unverified**; `*.tourdesk.is` covers per-account portals.

## NOT PORTED (with reason)

- goTene `appendAffiliate` and the synthetic `tours/<Destination>/d0-<code>` Viator handoff: Budapest keeps the exact API `productUrl` (more correct; tests assert it); goTene defaults (`mcid` 42383) belong to another account.
- Tiqets `/v2/cities` city id and `sort=popularity`, Viator tag resolver: unverified against live data for this key tier; keyword filtering remains.
- Native extras / tier pricing / dependent categories: deliberately handed off to TourDesk's full flow.
- `?k=<uniqueKey>` return parameter, Firestore-distributed rate limiter: not available/needed here.

## UNVERIFIED (needs live credentials or the owner)

- TourDesk Budapest inventory (live result is 0 offers in 11 contexts; cause unproven: run `npm run diagnose:tourdesk`).
- Real `POST /TourBooking` checkout creation, hosted checkout host, payment confirmation: no order was ever created.
- Viator `availability/check` on this key tier; Tiqets variants/availability.
- Vercel environment scopes (no access), live preview behaviour.
- Everything under "mocked" in `docs/RELEASE_STATUS.md` passed only against local stand-ins.
