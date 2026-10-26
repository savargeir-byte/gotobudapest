# Release status: Sanity + booking (2026-10-26)

Legend: **VERIFIED** = observed against the real service or by a real browser; **MOCKED** =
passes against a local stand-in (not proof of the real provider); **BLOCKED** = could not be
done, with the failed operation; **OPEN** = needs a decision or action by the owner.

## Booking

| Item | Status | Evidence |
| --- | --- | --- |
| Live provider catalogue via production `/api/budapest-offers` (11 contexts) | **VERIFIED** | Viator 39 unique products, Tiqets 14, TourDesk 0 in every context (2026-10-26). |
| Viator affiliate URLs returned unchanged | **VERIFIED** | Live URLs carry `mcid`, `campaign`, `pid`, `medium`, `api_version` exactly as the API supplied them; photos on `media-cdn.tripadvisor.com` return 200. Affiliate URLs were inspected, not requested (no click inflation). |
| Tiqets links | **VERIFIED** | Live URLs carry `partner`; no photos (content permissions, by design). |
| TourDesk zero results: root cause | **BLOCKED** | Needs the key. No Vercel access (CLI not logged in, browser session redirects to vercel.com/login, preview behind SSO). Evidence for the likeliest cause (account catalogue is Iceland-focused; GoIceTravel's own audit documents 1,803 Iceland products and a non-functional region filter) is circumstantial. Run `npm run diagnose:tourdesk` with the project's key (see Owner actions) for a proven verdict. The site now logs `[offers] tourdesk response=… rows=… budapestRows=…` and `[booking-catalogue] <host> <status>` in Vercel runtime logs. |
| Vercel env scopes / redeploy needs | **BLOCKED** | `403`/no session; indirect proof only: Viator and Tiqets keys are valid in the Production scope because live responses contain data. TourDesk key presence unknown. |
| Live product detail, availability, pickup, capacity (≥2 products per provider) | **BLOCKED** | The detail/availability routes exist only on PR #10 / this branch, which is not deployed anywhere reachable (previews are protected) and no keys are available locally. |
| Browser-level booking UI, desktop + mobile (TourDesk and Viator screens) | **MOCKED** | 36 tests in `e2e/booking-ui.spec.ts` against `e2e/support/mock-provider.mjs`: date/departure/option/participants, sold-out, price/capacity change, 503, double-click (one POST), complex-config handoff, host spoof, Viator exact URL + non-transfer notice, return page never claims payment. |
| Server-logic contracts | **MOCKED** | `e2e/native-booking-contracts.spec.ts`, `e2e/provider-contracts.spec.ts`. |
| Checkout creation / confirmed payment | **NOT TESTED** | No real order, hold or payment was made. Checkout creation is unverified against TourDesk; payment confirmation is never claimed by the UI. |
| Native Viator / Tiqets booking | **NOT ENABLED** | Affiliate handoff only; no booking/hold/reserve endpoint is called (asserted by tests). |

## Sanity

| Item | Status | Evidence |
| --- | --- | --- |
| Dataset `production` document count | **VERIFIED: 0 documents** | `npm run sanity:verify` (public CDN read), 2026-10-26. |
| Why it is empty | **VERIFIED by code** | Seeding was only an implicit Vercel build side effect; it needs `SANITY_API_TOKEN` in that build scope and no log is visible to us. It is now opt-in (`SANITY_SEED_ON_BUILD=1`); use the manual workflow instead. |
| Seed run | **BLOCKED** | No write token available to this environment. Dry run: 100 attractions, 8 guides, 3 experiences, 2 neighbourhoods, 2 regions, 13 categories, 1 settings, 63 histories, 13 galleries, 106 image files. |
| Seed → GROQ → mapper round trip | **MOCKED** (real documents, `groq-js` evaluator) | `tests/sanity-pipeline.test.ts`. |
| Site renders Sanity data | **NOT YET** | `e2e/sanity-content.spec.ts` (`PW_EXPECT_SANITY=1`) and `REQUIRE_SANITY_CONTENT=1` are ready for after the seed. |
| Studio login, publishing, CORS, webhook creation | **BLOCKED / OPEN** | Needs a signed-in project member. CORS for `https://gotobudapest.vercel.app` was reported present by another contributor; not re-inspected here. |
| Signed webhook endpoint | **VERIFIED (local)** | Unsigned, invalid, oversized, wrong type, rate limit and correctly signed requests tested; not yet tested end-to-end from Sanity. |

## Release

| Item | Status |
| --- | --- |
| CI (verify, build+Playwright, CodeQL, security, photos, galleries, booking-partners) | see PR #1 checks |
| Preview verification | **BLOCKED**: deployment protection (302 to vercel SSO). Not bypassed. Set `PW_VERCEL_BYPASS` (automation bypass secret) to run `e2e` against the preview. |
| Merge / production deploy | **NOT DONE**: live acceptance criteria above are not met. |
| Indexing | **OPEN**: site is `noindex` until `NEXT_PUBLIC_SITE_URL` names the confirmed primary domain. |

## Owner actions (in order)

1. **TourDesk diagnosis (≈1 minute):** `vercel env pull .env.diagnose --environment=production`,
   then `node --env-file=.env.diagnose scripts/diagnose-tourdesk.mjs`, delete `.env.diagnose`.
   Send the printed verdict. If `NO_BUDAPEST_INVENTORY`: ask TourDesk to enable Budapest
   inventory for the affiliate account. If `AUTH_FAILED`: the key in this Vercel project is
   missing/invalid/for the wrong account; fix the Production (and Preview) value and redeploy.
2. **Preview access:** create a "Protection Bypass for Automation" secret and give it to the
   test run as `PW_VERCEL_BYPASS` (never commit it), or open the preview signed in and run
   `npm run test:e2e` yourself with `PW_BASE_URL`.
3. **Sanity seed:** add GitHub environment `sanity-production` with secret `SANITY_API_TOKEN`
   (Editor), run workflow "Seed Sanity (manual)" first as dry run, then for real; then
   `npm run sanity:verify`.
4. **Sanity Studio:** sign in at `/studio`, edit and publish one attraction, confirm the page
   updates (webhook below); check Project → API → CORS origins lists the production and
   preview origins with credentials only.
5. **Webhook:** create it per `SECURITY.md` and set `SANITY_REVALIDATE_SECRET` in Vercel.
6. After the seed: set `REQUIRE_SANITY_CONTENT=1` in Production and run
   `PW_EXPECT_SANITY=1 npx playwright test e2e/sanity-content.spec.ts`.
7. Confirm the primary domain and set `NEXT_PUBLIC_SITE_URL`.
8. Merge PR #1 only after the above; PR #10 and PR #2 are already contained in it.
