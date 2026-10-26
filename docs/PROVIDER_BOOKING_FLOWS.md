# Provider booking flows

## Behaviour

TourDesk and Viator catalogue cards now lead to a GoToBudapest product page at
`/tours/{tourdesk|viator}/{id}`. The existing external booking URL remains intact.
Tiqets continues to use its API-supplied affiliate URL unchanged.

TourDesk supports date → departure → option → participants → review → secure
TourDesk checkout. The server reloads availability without caching, validates
categories and capacity, compares the current price with the displayed quote,
and sends the actual availability/variant/category IDs to `POST /TourBooking`.
TourDesk collects personal details and payment. Transactional writes are never
retried automatically. A checkout URL must be https on `tourdesk.is` or `*.tourdesk.is` (or a reviewed host from `TOURDESK_ALLOWED_BOOKING_HOSTS`), without credentials or port.
The return page does not assert that an order has been paid or confirmed.

The native UI handles standard per-person categories, pickup, and fixed group
prices. Tier pricing, dependent/exclusive categories, multi-occupancy categories,
extras, question-based pickup and unsupported slot formats direct users to the
provider's full selection. These configurations must not be silently flattened.

Viator offers a primary **Book on Viator** CTA and a secondary live availability
preview. Date and participant selections do not transfer to Viator. The exact
API `productUrl` is retained; no guessed checkout parameters, hold, reserve or
booking endpoint is used. Only retail price fields are returned to the browser.

## Reference implementations inspected (read-only)

- `savargeir-byte/GoIceTravel` at `607c4e5d6a0142eea15960d78cdf1cb740654103`:
  TourDesk `client.ts`, `availability.ts`, `booking.ts`, `types.ts`,
  `compatibility.ts`, `bookingPricing.ts`, widget and book route.
  The types, compatibility and pure pricing helpers were adapted directly;
  server payload and selection validation follow that contract. Iceland-specific
  branding, checkout return URL and region restrictions were not copied.
- `savargeir-byte/IcelandTripGuide` at `15e71339ab35f7312707c15063c4147566e0fc10`:
  Viator client, availability routes, validation, adapter and affiliate handoff.
  Availability input validation is reused. Full native Viator booking is not
  activated because the reference implementation uses affiliate handoff.

No sister-site repository or configuration was modified.

## Configuration

Existing server-only keys: `TOURDESK_API_KEY`, `VIATOR_API_KEY`, `TIQETS_API_KEY`.
No new key is required. Native TourDesk checkout is **off by default** (ported from GoIceTravel/goTene): set
`TOURDESK_BOOKING_ENABLED=true` or list a product in `TOURDESK_PILOT_KEYS` (comma list of `id-id` keys).
Without it the product page shows the provider handoff link and the checkout API answers 503. An unset/missing
key returns a temporary-unavailability response rather than a fake booking.

`NEXT_PUBLIC_SITE_URL` controls TourDesk's server-generated return origin;
fallback is `https://gotobudapest.vercel.app`. It must identify this website,
never a sister site's domain. `TOURDESK_ALLOWED_BOOKING_HOSTS` may list reviewed
custom provider hosts. See `docs/BOOKING_REUSE.md` for what was reused, ported and left unverified.

API routes enforce bounded JSON, same-origin browser writes, server-side
geographic checks and a best-effort per-instance request limiter. Platform-level
rate limits remain useful. Checkout responses use `Cache-Control: no-store`.

## Verification and limits

Read-only production baseline on 2026-10-26:
`/api/budapest-offers?kind=popular&slug=` returned 10 offers:
5 Viator, 5 Tiqets and 0 TourDesk. This confirms listings were returned; it does
not confirm all partner account permissions or a successful payment.

The local contract suite uses synthetic provider responses and dummy keys.
It tests payload transfer, uncached availability, changed capacity/prices,
forged/duplicate categories, foreign destinations, upstream failures, malicious
checkout hosts, request boundaries, disabled checkout, group pricing and Viator
affiliate handoff. It never contacts real transactional endpoints.

Actual TourDesk order creation, payment and UI behaviour with authenticated
live provider responses have **not** been verified. Local keys were unavailable.
Vercel returned 403 for the owning team `go-ice-tene`; the current connection
has access to a different team. Investigate TourDesk's empty live catalogue via
the correct project's safe runtime logs and read-only API calls before release.

Run:

```sh
npm run typecheck
npm run lint
npm run validate:content
npm run build
PW_BASE_URL=https://gotobudapest.vercel.app npx playwright test e2e/native-booking-contracts.spec.ts e2e/provider-contracts.spec.ts --project=desktop
```

Those two contract suites make mocked server calls; `PW_BASE_URL` only skips
starting an unnecessary local browser server. It is not live end-to-end proof.
The CI booking workflow also runs the existing browser placement tests.

The Sanity PR #1 remains separate and was not merged or replaced by this work.

## Mocked browser tests (`e2e/booking-ui.spec.ts`)

**All mocked. No live provider is contacted.** They prove UI behaviour against
synthetic responses; they are not live availability, checkout creation or payment
verification.

How it works: Playwright starts `e2e/support/mock-provider.mjs` (127.0.0.1:3900) and a
dedicated `next start` on port 3101 with `BOOKING_MOCK_ORIGIN=http://127.0.0.1:3900` and
dummy provider keys. Server-side provider API requests are redirected to the mock by
`lib/booking/test-origin.ts`. The hook is honoured only for exactly
`http://127.0.0.1:<port>` / `http://localhost:<port>` and never when
`VERCEL_ENV=production`; it only rewrites the provider API hosts (TourDesk, Viator,
Tiqets), so provider-returned checkout and booking URLs still pass the unchanged exact-host
allowlists (`tests/booking-test-origin.test.ts`). Browser requests to any third-party host
are intercepted by the tests (images and the TourDesk checkout page are fulfilled locally,
everything else is aborted).

Each test uses its own product id (the id range selects the scenario: standard, group/two
options, complex, foreign), so desktop and mobile projects run in parallel without sharing
state. Scenarios: product page render and layout; date → departure (sold-out/unavailable
shown but disabled) → participants, limits and pickup → review → edit (selection kept);
double click creates exactly one `TourBooking` POST and hands over to the HTTPS provider host;
price or capacity changed after the quote (refreshed total, no order); all sold out; upstream
503 and malformed JSON on dates (retriable error, never "sold out"); failed checkout creation
(one attempt, no automatic retry); spoofed checkout host; two options with fixed group
price; complex configuration provider handoff; foreign products refused; keyboard focus;
Viator exact `productUrl` (tracking parameters unchanged), non-transfer notice, availability
preview success/none/error, no booking/hold/reserve endpoint ever called; return page never
claims payment or confirmation.

Run: `npx playwright test e2e/booking-ui.spec.ts` (after `npm run build`). Screenshots for
visual review are written to `test-results/booking-ui-shots/`.
