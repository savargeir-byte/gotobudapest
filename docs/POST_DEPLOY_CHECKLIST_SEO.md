# Post-deployment verification: SEO release (PR #72)

Run after PR #72 is merged and Vercel has deployed to production. Read-only requests only: no test bookings, no checkout, no requests that create anything at a provider. Record each result as OBSERVED with the date, or FAILED with the exact URL and status.

Base URL: `https://www.gotobuda.com` (the Vercel alias `https://gotobudapest.vercel.app` may be used for read-only checks before the domain switch).

## 0. Release blockers that must be closed first

* [ ] `/privacy` names the confirmed legal operator, registered address and a privacy e-mail address (see `docs/MASTER_TODO.md` B-026). Do not merge while the text still says these "will be published once confirmed".
* [ ] All GitHub checks on PR #72 are green: CodeQL, Security and content checks, Verify GoToBudapest, Verify Budapest Booking Partners, Editorial photography checks, Attraction gallery and history checks.

## 1. Homepage

* [ ] `/` answers 200 and renders the hero, the search box and the tour strip without console errors.
* [ ] `<title>` is `Budapest Travel Guide, Attractions & Tours | GoToBudapest`; the meta description is 160 characters or fewer.

## 2. Tour images (PR #68, already live)

* [ ] On `/tours` and the homepage strip, every card shows an image (no empty grey box).
* [ ] A card whose supplier image fails shows the credited illustrative photo with its caption, not a broken image.

## 3. Viator 404 fix (the 16 links observed on 2026-11-17)

* [ ] Open `/tours?provider=viator`: every card link `/tours/viator/<code>` answers 200 (spot-check at least 10, plus every category tab and page 2 and 3 of results).
* [ ] Re-request the 16 codes recorded in the 2026-11-17 audit: none answers 404. Where a product is no longer sold, it must not appear as a card.
* [ ] No card is a foreign product (Reykjavik, Golden Circle, whale watching).

## 4. Affiliate links

* [ ] On `/tours` the card button leads to the product page on this site; on a Viator product page the provider hand-off link points to `viator.com` and its URL still contains `pid=` (read the `href`, do not follow it into a checkout).
* [ ] Tiqets hand-off links still carry the Tiqets partner parameter (same: read the `href` only).
* [ ] Do not open any checkout and do not submit any booking form.

## 5. Titles, descriptions, canonicals

* [ ] View source on `/`, `/tours`, `/attractions`, one attraction, one neighbourhood, one guide, `/about`: one `<h1>`, a canonical on `https://www.gotobuda.com`, a description of 160 characters or fewer.
* [ ] `/tours?category=cruises` (or any filtered view) has `noindex` and a canonical to `/tours`.
* [ ] `/experiences/thermal-baths`, `/experiences/danube`, `/experiences/food-and-markets` carry the topic titles from `lib/seo-overrides.ts`.

## 6. About and Privacy

* [ ] `/about` loads, names only the providers in use (Viator, Tiqets), states that GoToBudapest takes no payments, links to `/privacy#affiliate`.
* [ ] `/privacy` shows the confirmed operator details and a working privacy e-mail address; the cookie list matches what the browser actually sets (with consent rejected: only `gtb_consent`).

## 7. Sitemap and robots

* [ ] `/sitemap.xml` answers 200, lists the 303 URLs Google read on 22 November plus `/about` (304 expected), every `<loc>` is on `https://www.gotobuda.com`.
* [ ] `/robots.txt` is `Allow: /` and names the sitemap.
* [ ] Google Search Console (`sc-domain:gotobuda.com`): the sitemap shows a fresh "last read" date and no errors. Do not claim indexing from this alone.

## 8. Mobile

* [ ] On a phone-width viewport (390 px) `/`, `/tours`, `/attractions`, an attraction page and `/about` have no horizontal scroll, the quick-answers block is readable, and the menu works.

## 9. Runtime errors

* [ ] Vercel runtime logs for the first hour after deployment show no new 5xx on `/tours`, `/api/marketplace/*` or `/tours/viator/*`.
* [ ] Browser console on the pages above shows no new errors.

## 10. Rollback

If a check in section 3 or 4 fails: revert the merge commit of PR #72 on `main` (a revert PR, never a force-push). PR #68 stays in place because it was merged earlier.
