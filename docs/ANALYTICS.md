# Analytics, consent and privacy framework

Status date: 2026-11-05. Labels: **VERIFIED LIVE** (observed on https://www.gotobuda.com), **VERIFIED LOCALLY** (tests on a local production build), **NOT LIVE / OWNER ACTION** (needs a decision, an account or a secret).

## 1. Audit of what existed (VERIFIED LIVE, 2026-11-05, before this change)

* Home, `/privacy`, `/tours`, an attraction page: HTTP 200, **no `Set-Cookie`**, no third-party script, no `gtag`, Google Tag Manager, Google Ads, Meta pixel, Hotjar or Clarity code in the HTML. CSP: `script-src 'self' 'unsafe-inline'`, `connect-src 'self'`.
* Repository: no GA4, no consent manager, no booking-conversion events, no use of `localStorage`/`sessionStorage`/`document.cookie` outside this change (an old saved-places feature was removed earlier). The privacy page said "no analytics".
* `/_vercel/insights/script.js` answers 200 on production: Vercel Web Analytics is switched on for the project in the Vercel dashboard, but the site did not load it. This change loads it only after analytics consent.
* Search Console: no `google-site-verification` or `msvalidate.01` tag on the live site. The "GSC Wizard" integration is not available in this environment, so whether gotobuda.com is a connected property could not be checked (see section 8).
* Affiliate hand-off: provider links are plain `rel="sponsored"` links on the Viator and Tiqets product pages; no server-side click logging.

## 2. What is implemented (VERIFIED LOCALLY)

| Part | Where |
| --- | --- |
| Consent model, cookie record, Google Consent Mode v2 signals | `lib/consent/consent.ts` |
| Consent store (client) | `lib/consent/store.ts` |
| Banner (first layer), preferences dialog (second layer), footer "Cookie settings" | `components/consent/` |
| GA4 runtime (basic consent mode, injected environment) | `lib/analytics/ga.ts`, `lib/analytics/client.ts` |
| Typed events, parameter allow-list, deduplication | `lib/analytics/events.ts` |
| Consent -> tools, page views, delegated click events, Vercel Web Analytics | `components/analytics/analytics-runtime.tsx` |
| CSP: Google hosts only in a build that has a GA4 ID | `next.config.ts` |
| Search Console / Bing verification tags from environment | `app/layout.tsx` |
| Privacy and cookie page with inventory | `app/(site)/privacy/page.tsx` |

### Consent

* Categories: strictly necessary (always on), analytics, functional personalisation, marketing and advertising. Optional categories are off until the visitor opts in; no pre-selected switch.
* First layer: **Reject all**, **Manage preferences**, **Accept all**; the three buttons have the same size and style (a test compares them). The banner is a bar fixed to the bottom edge and never moves page content.
* The same rules apply to every visitor (EEA, UK, Switzerland and everyone else): the strictest common case, no geolocation guess.
* Evidence: one first-party cookie `gtb_consent` = policy version, the four choices and the time of the choice. No identifier, not sent to any tool. Lifetime 180 days (`CONSENT_MAX_AGE_DAYS`); a record from another policy version, from the future or older than 180 days counts as "no choice". **Bump `POLICY_VERSION` in `lib/consent/consent.ts` whenever the categories, the tools behind them or the privacy text change materially**, so everyone is asked again.
* Withdrawal: footer "Cookie settings" on every page. Withdrawing analytics disables the Google tag (`ga-disable-<ID>`), sends `consent update` with everything denied, removes the Google cookies (`_ga*`, `_gid`, `_gat*`, `_gcl_*`, `_gac_*`, `_gads`, `_gpi`) on the host and parent domain, and stops Vercel events immediately (`beforeSend` re-checks live).
* Google Consent Mode v2, basic flavour: **the Google tag is not loaded at all** (no request to Google) until analytics consent exists. Defaults are all denied; after consent `consent update` is sent first, then `config` with `send_page_view: false`. `ad_storage`, `ad_user_data`, `ad_personalization` follow only the marketing choice; `allow_google_signals` and ad personalisation follow only marketing.
* Marketing and functional switches change nothing today (no advertising tag, no personalisation feature exist) and the banner text says so. No Google Ads tag is installed and none was invented.
* No fingerprinting, no hidden tracking, nothing queued before consent.

### Events

Sent only with analytics consent, only these parameters, validated by `sanitizeParams` (unknown fields dropped, slug-like strings only, no e-mail, paths without query string or fragment). An event that fails validation is dropped, not guessed.

| Event | Parameters | Fired when |
| --- | --- | --- |
| `page_view` | `page_path`, `content_category` | once per route (config sends none automatically) |
| `attraction_view` | `attraction_slug`, `page_path` | once per visit of `/attractions/<slug>` |
| `guide_view` | `guide_slug`, `page_path` | once per visit of `/guides/<slug>` |
| `experience_view` | `experience_slug`, `page_path` | once per visit of `/experiences/<slug>` |
| `site_search` | `search_scope`, `has_query` | homepage search submitted. **Never the words.** |
| `marketplace_search` | `provider`, `search_category`, `sort`, `has_query` | visitor changes search or filters on `/tours` (not first load, not Back/Forward) |
| `tour_card_click` | `provider`, `product_id`, `placement` | click on "View details" of a product card |
| `tour_detail_view` | `provider`, `product_id`, `page_path` | once per visit of `/tours/<provider>/<id>` |
| `availability_check` | `provider`, `product_id` | click on "Check availability" (Viator) |
| `provider_handoff` | `provider`, `product_id`, `placement` | click on the sponsored link that leaves for the provider |
| `affiliate_link_click` | `provider`, `product_id`, `placement` | same click, link-level view of it |
| `cookie_consent_update` | `consent_action`, `analytics`, `functional`, `marketing` | the visitor saves a choice **while analytics is granted** |

Deduplication: views fire once per route visit (key = path + visit number, safe under React strict mode); clicks at most once per 800 ms for the same event and parameters. `product_id` is `<provider>:<provider key>`; `provider` is `viator` or `tiqets` (anything else, including the hidden TourDesk, is dropped).

**Hand-off is not a booking.** `provider_handoff` and `affiliate_link_click` mean a link was followed. Nothing records a purchase, revenue or commission, and no event named like one exists (a test asserts it). Confirmed bookings and commission must come from the providers' own reports (Viator and Tiqets partner dashboards or conversion feeds) and be imported as a separate, verified dataset; that data is **not available to this site**, so no conversion or revenue figure exists or may be claimed.

**Limitation (inherent):** a visitor who rejects cannot be counted, so the GA4 data cannot show the rejection rate. `cookie_consent_update` shows only consent that was granted. A rejection rate would need a separate, identifier-free server-side counter, which is not built.

## 3. Environment variables (nothing is hard-coded)

| Variable | Effect | Without it |
| --- | --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` (`G-…`) | enables GA4 after analytics consent; adds the Google hosts to the CSP | GA4 cannot load; CSP unchanged |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console meta tag | no tag |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Bing Webmaster `msvalidate.01` meta tag | no tag |

They are read at **build time**; changing one needs a new deployment. The owner sets them (Vercel project settings); this repository never contains the values.

## 4. Testing (VERIFIED LOCALLY, desktop and mobile)

* Unit (`tests/consent.test.ts`, `tests/analytics.test.ts`): record round trip, stale/foreign/future/tampered records, consent-mode signals per category, GA4 ordering (default denied, update, config, tag), nothing before consent, nothing queued, withdrawal (events stop, update sent, cookies removed, own cookie kept), re-grant without double load, parameter allow-list, paths, deduplication.
* Browser, no GA ID in the build (`e2e/consent.spec.ts`, runs in CI): first visit (three equal buttons, no cookie, no storage, no analytics or Google request), reject, accept all (Vercel script requested only afterwards), manage preferences (all switches off, necessary locked), marketing only (analytics stays off), Escape, footer link on every page type, withdrawal removing `_ga*`, clearing cookies, other policy version, expired record, privacy page content.
* Browser with a GA ID (`e2e/consent-ga.spec.ts`; build with `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST123456`, run with `PW_EXPECT_GA=1`; Google is answered with a stub, so what is checked is the data layer): ordering, one page view per navigation, typed view events, no search words anywhere in the data layer, card click, detail view, availability check, hand-off, no booking-like event name, withdrawal.
* Every other Playwright spec starts with a pre-set "reject" cookie (`playwright.config.ts`) so the banner is not in front of unrelated checks.

## 5. Not yet live and needs the owner

1. **GA4 property** and its measurement ID in `NEXT_PUBLIC_GA_MEASUREMENT_ID` (the owner creates the property; no ID is in the repository). Until then GA4 does not run, and the privacy page says so.
2. In the GA4 property: data retention to 2 or 14 months (state the chosen value on the privacy page), Google signals off unless marketing is wanted, accept the data processing terms, review data-sharing settings.
3. Vercel Web Analytics is already enabled for the project (`/_vercel/insights/script.js` answers); after this change it counts only visitors who accepted analytics.
4. Search Console and Bing Webmaster verification tokens (section 8).
5. The legal review items in section 9.

## 6. Recommendations driven by aggregated data (prepared, not live)

Principle: contextual first, aggregated second, individual only with consent. The existing contextual tour rows (`components/marketplace/ContextualTours.tsx`, matched by attraction, guide and experience) already show the right products for a thermal-bath or Danube-cruise page without any tracking. No profile is built from a visitor's behaviour and nationality is never inferred from an IP address.

What aggregated data can add once GA4 has collected enough (not available yet, so nothing is shown and nothing is claimed):

* Most viewed attractions and tours per **country of session** (GA4 reports country as the place of the session, not as nationality) and per season: a nightly or weekly job reads the GA4 Data API (or a BigQuery export) with a service account kept as a secret, writes a small JSON of counts per market (only market buckets with a minimum size, for example 50 sessions, to avoid singling anyone out), and the existing card components read it to order a "popular with visitors from your region" row.
* Popular paths (attraction -> guide -> tour) from `page_view` sequences in aggregate; provider hand-off rate per placement from `tour_card_click`, `tour_detail_view`, `availability_check`, `provider_handoff`; content that leads to hand-offs.
* Persistent per-visitor behavioural profiles are **not** built. If ever wanted they need the functional or marketing category to be on, a documented legal basis and an updated privacy page (bump `POLICY_VERSION`).

## 7. Reporting and monitoring workflow (prepared, not running)

Nothing recurring has been created and no monitoring is claimed to be live.

* Daily (5 minutes, once GA4 and Search Console are connected): GA4 Realtime / DebugView shows page and click events after accepting analytics in a test browser; Search Console Sitemaps shows 137 URLs read and no new coverage errors; tag failures show as missing events in DebugView, and an outage shows as a day with zero `page_view` in GA4 while Search Console clicks continue.
* Weekly report (one page): Search Console clicks, impressions, CTR, average position, by country, device and landing page; GA4 sessions, engaged sessions, top attractions and guides, `tour_detail_view`, `availability_check`, `provider_handoff` counts and the funnel `tour_card_click` -> `tour_detail_view` -> `availability_check` -> `provider_handoff` with drop-off per step, split by provider; the share of visits with consent is not measurable (see limitation above). Bookings and commission: from the providers' dashboards, reported separately and labelled as such.
* Connections needed first: GA4 property with the ID set; Search Console property with the DNS or meta verification done; Bing property. Only then may a report claim to be live.

## 8. Search Console and Bing

* Verification: set the two environment variables above (meta tags) or verify by DNS TXT (preferable for a domain property, owner-side). The sitemap is `https://www.gotobuda.com/sitemap.xml` (137 URLs, VERIFIED LIVE in an earlier phase) and `robots.txt` serves 200.
* "GSC Wizard": not available in this environment, so no property was configured and no connection is claimed. Nothing was submitted anywhere.

## 9. Legal review items (not claimed as done; none of this is legal advice)

1. **Operator identity and contact** (GDPR Article 13(1)(a), (b)): legal name, registered address, contact address for privacy requests and whether a data protection officer or an EU/UK representative is required. The privacy page says plainly that these will be published once confirmed. They are not invented.
2. Data processing agreements and vendor documentation: Google (GA4 data processing terms in the property), Vercel (hosting and Web Analytics), Sanity (content and image CDN). Viator and Tiqets act under their own privacy policies after the hand-off.
3. International transfers: confirm the safeguard each vendor relies on (adequacy decision or standard contractual clauses) and record it; the privacy page names the mechanisms only generally.
4. Retention: GA4 event retention setting, hosting log retention at the host.
5. Confirm with counsel the national rules that apply to the target audience (ePrivacy implementations, for example France, Spain, Germany, Italy; UK PECR and UK GDPR; Swiss law), the 180-day consent lifetime, and equal prominence of Reject and Accept.
6. Whether Vercel Web Analytics may be run without consent in the relevant countries. It is gated by consent here, the conservative choice.
7. Affiliate disclosure wording for each market.
8. Legal bases stated on the page (Article 6(1)(a) for optional analytics, 6(1)(f) for hosting and security) and the cookie text ("up to 2 years" for the Google cookies is Google's documented default and should be rechecked when GA4 is configured).
