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
