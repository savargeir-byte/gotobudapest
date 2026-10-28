# Security

GoToBudapest is a mostly static Next.js site with an embedded Sanity Studio. This
document records the controls in place, the decisions behind them and the risks that
are knowingly accepted. Report vulnerabilities privately to the repository owner
(GitHub: Security → Report a vulnerability), not in public issues.

## Architecture in one paragraph

Visitors only ever receive pre-rendered pages. Content comes from Sanity at build and
revalidation time through a **public, token-less, published-only** client. Editors work
in the Studio at `/studio`, which requires a Sanity account that is a member of the
project. The only server endpoint is `POST /api/revalidate`, which refreshes cached
content when it receives a correctly signed Sanity webhook. The site has no accounts,
forms, cookies, analytics or payment flows.

## Secrets and environment variables

| Name | Scope | Used by | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | public | site, Studio | Not secret (appears in every CDN URL). |
| `NEXT_PUBLIC_SANITY_DATASET` | public | site, Studio | Not secret. |
| `NEXT_PUBLIC_SITE_URL` | public | canonical URLs, sitemap | Validated at build; invalid value fails the build. |
| `SANITY_API_TOKEN` | **server only** | `scripts/sanity-seed.ts` (manual workflow or maintainer machine) | Never imported by site code, never prefixed `NEXT_PUBLIC_`; not needed by the running site at all. Create it with the narrowest role that can create documents and upload images; use a separate token for Preview if Preview builds should not seed. |
| `SANITY_REVALIDATE_SECRET` | **server only** | `/api/revalidate` | Long random value, identical to the webhook secret in sanity.io/manage. Missing secret → endpoint answers 503 and does nothing. |

- `.env*` is git-ignored (only `.env.example` is tracked); CI never receives secrets.
- Logs contain fixed reason labels only; request bodies, headers and tokens are never logged.
- There is no diagnostic or environment-inspection endpoint. A test asserts that common
  names (`/api/env`, `/api/debug`, …) return 404.
- If a token or secret is ever exposed: revoke it in sanity.io/manage → API → Tokens (or
  generate a new webhook secret), update Vercel, redeploy. Rotate on staff changes.
- Seeding never happens implicitly. `scripts/sanity-seed-on-build.mjs` is **opt-in** (`SANITY_SEED_ON_BUILD=1`); the intended route is the approval-gated "Seed Sanity" GitHub workflow (environment `sanity-production`, secret `SANITY_API_TOKEN`) or `npm run sanity:seed` by a maintainer. The seed writes with `createIfNotExists` only: it adds missing documents but never overwrites or deletes editors' work.

## Sanity

- **Authentication:** Studio uses Sanity's own authentication. Only invited project
  members can sign in; roles (Viewer / Editor / Administrator) control who can publish
  or delete. Give people the lowest role they need.
- **Public reads:** the website reads published documents only (`perspective: "published"`).
  Drafts are never requested, there is no Draft Mode and there are no preview tokens. A
  Playwright test confirms anonymous clients see zero drafts and cannot write.
- **CORS:** configure only verified origins at sanity.io/manage → API → CORS origins:
  the production site origin and the Vercel preview origin, **with credentials** only for
  the origins that host the Studio. Never add `*` with credentials.
- **Uploads:** image fields accept JPEG/PNG/WebP only, with a 10 MB validation limit.
- **Rich text:** Portable Text supports plain blocks, lists, bold/italic and links. The
  renderer drops unknown block types, raw HTML and every link that is not `https:`,
  `mailto:` or a same-site path. All external URLs from the dataset must be `https:`.
- **Package versions:** Sanity Studio 6.20.0 is used. Versions 6.9.2–6.14.0 contain a
  Portable Text data-loss bug and are deprecated; do not downgrade into that range.

## Webhook (`/api/revalidate`)

POST only; `Content-Type: application/json`; `Content-Length` required and ≤ 32 KB;
per-IP fixed-window rate limit (30/min per instance); HMAC signature verified with
`next-sanity/webhook` before the body is trusted; `_type` must be one of the content
types; only the fixed `sanity` cache tag is revalidated, so callers cannot pick paths.
Configure the webhook at sanity.io/manage → API → Webhooks: URL
`https://<production-domain>/api/revalidate`, dataset `production`, triggers
create/update/delete, filter `_type in ["attraction","guide","experience","neighbourhood","region","category","siteSettings"]`,
projection `{_type, _id, "slug": slug.current}`, method POST, drafts **off**, secret =
`SANITY_REVALIDATE_SECRET`.

## HTTP security headers

Defined in `next.config.ts` and covered by `e2e/security.spec.ts`.

- **Public pages:** enforced CSP (`default-src 'self'`, no third-party scripts, images
  from `self` and `cdn.sanity.io`, Google Fonts for CSS/fonts, `object-src 'none'`,
  `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`), `X-Frame-Options:
  DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Permissions-Policy` denying camera, microphone,
  geolocation, payment and USB.
- **Studio (`/studio`):** the non-fetch directives (`frame-ancestors 'self'`,
  `object-src 'none'`, `base-uri`, `form-action`) are enforced; the full policy is
  delivered as **Report-Only** and stays so until it has been observed with real signed-in
  editing sessions. `Cache-Control: no-store`.
- **HSTS:** `max-age=31536000` only. `includeSubDomains` and `preload` are intentionally
  **not** set; enable them only after every affected hostname has been verified.

## Vercel

- Keep production and preview secrets separate; do not give preview builds a token that
  can touch production content unless seeding on preview is wanted (set
  `SANITY_SEED_ON_BUILD=0` on Preview to opt out).
- Firewall: add a rate-limit rule for `POST /api/revalidate` (for example 60 requests/min
  per IP). Do not IP-allowlist or challenge it, since Sanity webhook source addresses are
  not fixed, and do not challenge crawlers on `/`, `/robots.txt` or `/sitemap.xml`. The
  firewall is a second layer: the endpoint verifies signatures regardless.
- `/studio` is already protected by Sanity authentication; do not replace that with a
  firewall rule.

## Dependency risk decisions

`npm run audit:gate` fails the build on any high or critical advisory unless its id is
listed in `scripts/audit-gate.mjs` together with a written decision here. **Nothing is
currently accepted:** `npm audit` reports 0 vulnerabilities (checked 2026-10-26 with
npm 11 and npm 10).

Advisories met during this work and how they were closed:

| Advisory | Package | Resolution |
| --- | --- | --- |
| GHSA-vfj7-8cjw-p6xm (high) | `braces <= 3.0.3` (dev/CLI glob tooling) | Reported on 2026-10-23 with no patched release; it is no longer reported by npm audit on 2026-10-26. It was never reachable in the deployed site. Re-check on each Dependabot run. |
| js-yaml, smol-toml, uuid (moderate/high) | inside `@vercel/frameworks` / `typeid-js` (Sanity CLI) | npm `overrides` to patched releases. |
| GHSA-xjj6-f33q-929c and others (high) | `undici 7.29.x` (Sanity CLI tooling) | npm `overrides`: `undici ^7.30.1`. |
| GHSA-mrhx-c7xc-m3w5 (high) | `zod < 4.6.6` inside `sanity-plugin-media` | npm `overrides`: `zod ^4.6.7`. The plugin only uses `z.object`/`z.string`/`z.array`, which are unchanged in zod 4. Verify the media browser after signing in to the Studio. |

## Residual risks

- Public pages use `script-src 'unsafe-inline'` because static pages cannot carry
  per-request nonces. Mitigations: no user-supplied HTML, no third-party scripts,
  restricted Portable Text, `object-src 'none'`, `base-uri 'self'`.
- The in-process rate limiter is per server instance; rely on the Vercel Firewall rule for
  a global limit.
- Studio runtime behaviour behind sign-in (editing, publishing, role enforcement) is
  enforced by Sanity, not by this repository, and must be exercised by a project member.
