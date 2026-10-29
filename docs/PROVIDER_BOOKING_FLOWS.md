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

The native UI is the ported GoIceTravel journey: month-grid date calendar → departure
radios → option cards → participant steppers (default adult, per-category and
per-option maximums, dependants need an adult) → add-ons (per-category or flat,
`limitByPax`, stock) → pickup (optional or mandatory, priced per category) → live
price breakdown → review → secure TourDesk checkout. The server re-validates every
one of those choices against fresh availability and recomputes the total including
add-ons and pickup. Tier pricing, exclusive category groups, multi-occupancy
categories, per-person `chargePerBooking`, hidden prices, combo activities,
question-based pickup and unsupported slot formats direct users to the provider's
full selection. These configurations must not be silently flattened. Details and
the comparison with GoIceTravel: `docs/BOOKING_REUSE.md`.

Viator has an internal product page: marketplace card, then the full product
information from `GET /products/{code}`, then availability, options and prices
where the key allows it (`GET /availability/schedules/{code}` for bookable dates
and the "from" price, `POST /availability/check` for live options and totals),
and only then the final handoff **Continue to Viator**. That link is the only
link to viator.com on the page: the exact API `productUrl`, `target="_blank"`,
`rel="sponsored noopener noreferrer"`, nothing appended. Date, group and option
selections do not transfer; the page says they must be repeated on Viator. A
mobile sticky bar is an internal anchor to the availability section. Sections
the API did not return are not rendered. If schedules are forbidden/missing/empty
the page says live availability is not available and still offers the handoff;
a transient schedules or check failure shows an inline retry and never "sold out".
No booking, hold, reserve, cart, target-lander or payment endpoint is used. Only
retail price fields are returned to the browser.

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
fallback is `https://www.gotobuda.com`. It must identify this website,
never a sister site's domain. `TOURDESK_ALLOWED_BOOKING_HOSTS` may list reviewed
custom provider hosts. See `docs/BOOKING_REUSE.md` for what was reused, ported and left unverified.

API routes enforce bounded JSON, same-origin browser writes, server-side
geographic checks and a best-effort per-instance request limiter. Platform-level
rate limits remain useful. Checkout responses use `Cache-Control: no-store`.

Rate limits (30 requests/minute per client address on booking, marketplace search and the
revalidation webhook) are unchanged in production. Tests never forge client addresses:
in-process contract tests call `resetBookingGateForTests()` between tests (test-only, never called
by a route); the shared Playwright servers scale the budget with `RATE_LIMIT_TEST_SCALE`
(`lib/rate-limit.ts`; ignored on Vercel and for anything but an integer 1-1000); and
`e2e/rate-limits.spec.ts` proves the real limit (31st request = 429 + `Retry-After: 60`) on a
dedicated unscaled server (port 3102).

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
options, complex, rich (options + dependants + add-ons + pickup), mandatory pickup, foreign), so desktop and mobile projects run in parallel without sharing
state. Scenarios: product page render and layout; date → departure (sold-out/unavailable
shown but disabled) → participants, limits and pickup → review → edit (selection kept);
double click creates exactly one `TourBooking` POST and hands over to the HTTPS provider host;
price or capacity changed after the quote (refreshed total, no order); all sold out; upstream
503 and malformed JSON on dates (retriable error, never "sold out"); failed checkout creation
(one attempt, no automatic retry); spoofed checkout host; two options with fixed group
price; complex configuration provider handoff; foreign products refused; keyboard focus;
the ported journey end to end (calendar, radios, steppers, dependant rule, add-ons with
`limitByPax`, optional and mandatory pickup, price breakdown, flat `bookableExtras` rows in the
single POST); add-on price change and add-on stock drop after the quote (refused, no order);
uncertain order with add-ons (lock survives reload, one POST);
Viator exact `productUrl` (tracking parameters unchanged), non-transfer notice, availability
preview success/none/error, no booking/hold/reserve endpoint ever called; return page never
claims payment or confirmation.

Run: `npx playwright test e2e/booking-ui.spec.ts` (after `npm run build`). Screenshots for
visual review are written to `test-results/booking-ui-shots/`.

## TourDesk is paused in the public marketplace (2026-10-29)

`TOURDESK_MARKETPLACE_ENABLED` (read on the server in `lib/marketplace/enabled.ts`) decides whether the public
marketplace uses TourDesk. It defaults to OFF with no configuration. While it is off the site makes no TourDesk
request and shows nothing about TourDesk; old product links go to `/tours`. Everything else is preserved: the
adapter, discovery, booking engine, tests and credentials. To use TourDesk again after a working API has been
tested, set the variable to `true`; native checkout is a separate gate (`TOURDESK_BOOKING_ENABLED`) and stays off.
