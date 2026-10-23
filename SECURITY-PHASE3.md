# GoToBudapest — Phase 3 security verification

This branch is **not** a completed Sanity migration or a production security sign-off.

## Confirmed at branch creation
- Existing public site uses Next.js App Router and local JSON for attraction and guide data.
- Sanity project: `ut6qxuke`, dataset: `production`.
- Published content count in Sanity at audit time: **0**.
- PR #1 remains open. Latest `main` contains the subsequent photo and navigation improvements.
- `.env*` is gitignored, with `.env.example` as the exception.
- Existing HSTS incorrectly opted all subdomains in; now removed `includeSubDomains`.
- Added enforced minimal CSP and report-only exploratory public policy. This is **not** proof that full CSP enforcement is compatible with Studio.

## Required before production
1. Verify that the correct Sanity organization authorizes the intended editing account, and review Studio roles.
2. Verify published Sanity content can be read publicly and drafts cannot.
3. Install compatible stable Sanity dependencies with an updated committed npm lockfile.
4. Implement Studio, schemas, read-only GROQ queries, signed webhook, and idempotent migration.
5. Preserve local JSON and all slugs as rollback until migrated data passes spot checks and count checks.
6. Verify public and Studio CSP separately; remove unsafe CSP allowances in the final enforced policies.
7. Confirm HTTPS on every hostname before considering extended HSTS.
8. Add request-size and infrastructure rate limits to webhook, with tests for bad and valid signatures.
9. Run Playwright desktop/mobile and live production verification.
10. Investigate all high/critical audit results and record disposition.

Never store token values in documentation or commit logs.

## Status after the Sanity foundation work (see SECURITY.md for details)

| # | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Studio roles / authorised account | **Open (owner action)** | Enforced by Sanity; member roles and the Studio CORS origin must be set in sanity.io/manage. |
| 2 | Public reads published-only, no drafts | Done | `e2e/security.spec.ts` (anonymous draft count = 0, anonymous writes rejected). |
| 3 | Stable compatible Sanity packages + lockfile | Done | sanity 6.20.0 (above the 6.9.2–6.14.0 data-loss range), next-sanity 13.3.4, committed `package-lock.json`. |
| 4 | Studio, schemas, GROQ, webhook, idempotent migration | Done in code; **migration not yet run against the dataset** until `SANITY_API_TOKEN` is available to a build or a maintainer. | `sanity/`, `lib/sanity/`, `scripts/sanity-seed.ts`. |
| 5 | Local JSON + slugs kept as rollback | Done | `lib/*.json`, `lib/guides.ts`, `lib/topics.ts`, `backups/`; the site falls back to them automatically. |
| 6 | Public and Studio CSP separately | Done | Public CSP enforced without `unsafe-eval`/`https:` wildcards; Studio: enforced anti-framing subset plus Report-Only full policy. |
| 7 | HSTS only after HTTPS verified | Done | `max-age=31536000` only; no `includeSubDomains`/`preload`. |
| 8 | Webhook size limits, rate limits, signature tests | Done | `app/api/revalidate/route.ts`, unsigned/invalid/valid/oversized/rate-limit tests. Add a Vercel Firewall rate-limit rule (SECURITY.md). |
| 9 | Playwright desktop/mobile + live verification | Done locally and on the preview deployment | `npm run test:e2e`. |
| 10 | Audit disposition | Done | `npm run audit:gate`; accepted: braces GHSA-vfj7-8cjw-p6xm (dev/CLI tooling only). |
