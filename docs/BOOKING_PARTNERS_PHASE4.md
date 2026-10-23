# GoToBudapest — Booking partners (Phase 4)

Public entry points:
- `/tours` — Budapest products from the three partners
- `/attractions/[slug]`, `/guides/[slug]`, `/experiences/[slug]` and `/neighbourhoods/[slug]` — context-specific recommendations.
- `/api/budapest-offers?kind=popular&slug=` — read-only, bounded catalogue endpoint.
- No Trip Planner, in-house checkout, credit card collection, customer PII, booking writes or booking order creation.

## Vercel Environment Variables

Set on the **GoToBudapest** Vercel project, server-side only (Preview + Production):

| Name | Purpose |
| --- | --- |
| `TOURDESK_API_KEY` | TourDesk API v1.0 `ApiKey` request header |
| `VIATOR_API_KEY` | Viator v2 `exp-api-key` request header |
| `VIATOR_CAMPAIGN_VALUE` | Optional campaign; defaults to `gotobudapest`. The returned Viator affiliate product URL must be used unchanged |
| `VIATOR_API_BASE_URL` | Optional: `https://api.viator.com/partner` (default) or exact official sandbox URL; any other value is rejected in favour of production |
| `TIQETS_API_KEY` | Tiqets `Authorization: Token ...` header |
| `TOURDESK_ALLOWED_BOOKING_HOSTS` | Optional comma-separated HTTPS booking hosts if TourDesk supplies an approved custom merchant checkout domain. Review domains before adding |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN` | Reserved for the separate CMS integration. Sanity content migration is **not** completed by this booking implementation |

**Security:** Never use `NEXT_PUBLIC_` on booking tokens or put credentials in source, client bundles, URLs or logs. Use Sensitive env settings where supported. The page and its JSON endpoint do not expose tokens. Server code only contacts fixed official supplier API origins; no user-provided upstream URL is permitted.

**Partner permissions:** Viator affiliate credentials tied to AuroraVision / partner `P00290839` must be approved by Viator for GoToBudapest use before commerce launches. Credentials alone do not grant partner rights for a second brand. Tiqets affiliate access usually grants Product and Availability APIs, not Full Booking API; images are **not** available by default, so we do not render Tiqets images. TourDesk catalogue availability depends on the affiliate's configured regions; existing access does not guarantee Budapest suppliers.

## How it works

- TourDesk `POST /api/v1.0/TourSearch` with an actual Budapest text filter. Displays only products identifying Budapest/Hungary and a safely validated checkout URL.
- Viator v2 `GET /destinations` selects a Budapest CITY destination and `POST /search/freetext` requests only Budapest products. Uses `productUrl` unchanged to retain affiliate credit.
- Tiqets `GET /v2/products?city_name=Budapest...` reads only available Budapest products and uses the API-provided `product_url` unchanged, including Tiqets tracking.
- Each provider request is server-only, cached 20–60 minutes as appropriate; API results are bounded and sanitised. No price is shown unless it is present in the provider response. No automatic price conversion or invented availability is performed.
- The browser fetches the catalogue **only when the recommendation section becomes visible**, avoiding 100+ TourDesk/Viator/Tiqets queries during Next.js static builds. The public API route only accepts approved editorial slugs and does not act as an arbitrary search proxy.
- Products are interleaved across providers and not falsely tagged as available if the provider doesn't return them. Missing keys, 401/403/429/503 and timeouts degrade to an empty recommendations message; review safe server-side diagnostics and credentials if that occurs.

## Testing

CI:
```sh
npm ci
npm run validate:content
npm run typecheck
npm run lint
npm run build
npx playwright install --with-deps chromium
npx playwright test e2e/booking-offers.spec.ts e2e/provider-contracts.spec.ts
```

Provider contract tests simulate responses and verify header names, Budapest location restrictions, bookability URLs and no Tiqets image assumptions. Browser tests inspect placement and handling of unavailable products. **They do not prove production API keys are valid**. A separate live authenticated read-only smoke check in Vercel is still required; avoid testing order-creation endpoints against production.

## Post-release verification

1. Confirm all keys are present in the GoToBudapest project's **Production** and **Preview** environments; redeploy after saving.
2. Open `/tours`, scroll to products, and use Developer Tools Network to inspect `/api/budapest-offers?kind=popular&slug=`. It should return `offers` from configured and enabled partners; no `*API_KEY` values.
3. Check one `/experiences/danube` and one `/attractions/hospital-in-the-rock` request.
4. Confirm provider URLs lead to Budapest and preserve each partner's affiliate tracking. Verify permissions, prices and real date availability at final checkout.
5. Compare outgoing clicks with each partner's reporting, and inspect sanitized upstream status metrics for auth/rate-limit errors before scaling traffic.
6. Roll back the GitHub/Vercel deployment if card rendering or partner offers fail and fix the failing adapter without guessing.

References:
- https://api.tourdesk.io/swagger/index.html
- https://docs.viator.com/partner-api/technical/
- https://developers.tiqets.dev/getting-started/performing-your-first-api-call.md
- https://developers.tiqets.dev/basics/openapi/content-api/products/search-and-filter-products.md
