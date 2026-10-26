# Claude — verify and release the GoToBudapest booking flow

Work only in `savargeir-byte/gotobudapest`. Do not modify GoIceTravel,
IcelandTripGuide or any sister-site configuration. Preserve the approved navy
and teal design, logo, favicon, editorial content, galleries and booking partners.

Start by reading `docs/PROVIDER_BOOKING_FLOWS.md`, all applicable AGENTS.md files,
current main, PR #1 and the PR for branch `feat/provider-booking-flows`. Fetch the
latest refs; do not reset branches, replace current work, or force-push.

The booking branch adds native TourDesk date/departure/option/participants/review
and TourDesk checkout, using GoIceTravel's types, compatibility and pricing
helpers. Complex configurations fall back to TourDesk's complete flow. Viator
uses IcelandTripGuide's affiliate approach: exact API `productUrl`, optional
availability preview and an explicit notice that selections do not transfer.
Tiqets keeps its returned affiliate URL unchanged. There are no native Viator
or Tiqets order/payment writes. Do not describe API keys as Full Booking approval.

TypeScript, lint, build and 14 mocked API contract tests passed during the
implementation. This is NOT authenticated end-to-end verification. The production
baseline on 2026-10-26 returned 5 Viator offers, 5 Tiqets offers and 0 TourDesk
offers. No real TourDesk order or payment was made.

## Finish this phase

1. Verify existing server-only keys in the correct GoToBudapest Vercel project,
   in team `go-ice-tene` (`team_tFwOZapg9IGEmk0tpyyqtDDh`). Check environment
   scopes and redeploy requirements without printing or committing key values.
   The previous connection had access to another team and received 403 here.
   Report authorization failures truthfully; do not assume missing credentials.
2. Investigate why TourDesk returns no Budapest listings. Inspect sanitized
   runtime errors, actual TourSearch responses, the account's Budapest inventory
   and official region/location filters. Fix the proven cause. Do not substitute
   Iceland/Tenerife products, broaden to every country, invent products or silently
   treat upstream errors as sold out. Confirm whether Budapest inventory is
   enabled on this affiliate account.
3. Verify real read-only responses for at least two Budapest products per
   available provider: detail, image, currency, date, options and participant
   categories. For TourDesk verify supported slot IDs, group/per-person prices,
   pickup, changing capacity and errors. Unsupported configurations must retain
   a working provider handoff. Never automatically retry transactional POSTs.
4. Test the product and booking screens on desktop and mobile. Cover selecting
   and changing dates/options/guests, refreshing failed availability, reviewing,
   back navigation, errors and double-click prevention. Use sandbox or mocked
   transactional responses; do not create real orders, holds or paid bookings.
   Checkout return must never claim payment success without provider confirmation.
5. Keep Viator attribution URLs exactly as returned by the API. Do not append
   guessed dates, travellers, option codes or checkout query parameters. Do not
   enable booking/hold/reserve endpoints without documented account capability.
   Keep the non-transfer notice visible near the availability preview.
6. Reconcile with Sanity PR #1 without losing the existing content or fallback.
   Do not run a speculative seed or replace existing media. CORS for
   `https://gotobudapest.vercel.app` with credentials was already present when last
   inspected; check current state before changing it. Keep official-image sourcing
   requirements intact; do not relabel Wikimedia/Unsplash assets as official.
7. Run the applicable repository checks, existing browser tests and
   `e2e/native-booking-contracts.spec.ts`. Verify the complete merged result,
   security headers and CSP as well as the individual branches. If all required
   checks and read-only live verification pass, merge/deploy the completed work
   and verify production. Otherwise leave a precise blocker with evidence.

## Report

Give the exact commit/PR/deployment URLs, TourDesk zero-result root cause, live
provider counts, tests run, and remaining blockers. Separate mocked tests from
live evidence and checkout creation from confirmed payment. State clearly whether
anything was merged/deployed. Do not claim a successful booking based on a CTA,
outbound click, return-page visit or HTTP 200 alone.
