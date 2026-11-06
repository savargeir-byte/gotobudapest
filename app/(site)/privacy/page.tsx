import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import CookieSettingsLink from "@/components/consent/cookie-settings-link";
import { pageMetadata } from "@/lib/seo";
import { activeProviders, providerNames } from "@/lib/marketplace/enabled";
import { PROVIDER_LABEL } from "@/lib/marketplace/types";
import { CONSENT_COOKIE, CONSENT_MAX_AGE_DAYS, POLICY_VERSION } from "@/lib/consent/consent";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/config";

export const metadata: Metadata = pageMetadata({
  title: "Privacy and cookies",
  description:
    "What GoToBudapest collects and why: your cookie choices, optional analytics only with your consent, the cookies and services involved, retention and your rights.",
  path: "/privacy",
});

const gaOn = GA_MEASUREMENT_ID !== undefined;

// The partners named below are the providers actually in use (TourDesk is paused, see lib/marketplace/enabled.ts).
// The cookie inventory below mirrors the code: lib/consent/consent.ts (our one cookie) and lib/analytics (the tools).
export default function PrivacyPage() {
  const active = activeProviders();
  const partners = providerNames(active, PROVIDER_LABEL);
  const partnersOr = partners.replace(/ and (?=[^ ]+$)/, " or ");
  const imageHosts = providerNames(active.filter((p) => p !== "tiqets"), PROVIDER_LABEL).replace(/ and (?=[^ ]+$)/, " or ");
  return (
    <>
      <a className="skip" href="#privacy">
        Skip to content
      </a>
      <SiteHeader />
      <main>
        <div className="section article-title">
          <Breadcrumbs items={[{ name: "Privacy" }]} />
          <div className="eyebrow">YOUR PRIVACY</div>
          <h1>Your privacy and cookies</h1>
          <p>
            A plain description of what this website does with your data and how you stay in control. Policy version{" "}
            {POLICY_VERSION}, last updated 5 November 2026.
          </p>
        </div>
        <div className="section article-layout">
          <aside className="article-toc">
            <h2>On this page</h2>
            <ol>
              <li>
                <a href="#who">Who is responsible</a>
              </li>
              <li>
                <a href="#what-we-collect">What we collect and why</a>
              </li>
              <li>
                <a href="#consent">Your cookie choices</a>
              </li>
              <li>
                <a href="#cookies">Cookie inventory</a>
              </li>
              <li>
                <a href="#analytics">Analytics</a>
              </li>
              <li>
                <a href="#third-parties">Third-party services</a>
              </li>
              <li>
                <a href="#affiliate">Affiliate links</a>
              </li>
              <li>
                <a href="#retention">Retention and transfers</a>
              </li>
              <li>
                <a href="#rights">Your rights</a>
              </li>
              <li>
                <a href="#links">External links</a>
              </li>
              <li>
                <a href="#earlier-versions">Earlier versions</a>
              </li>
            </ol>
          </aside>
          <article id="privacy" className="article-body">
            <section id="who">
              <h2>Who is responsible</h2>
              <p>
                GoToBudapest is a sister site of{" "}
                <a href="https://www.goicetravel.is" target="_blank" rel="noopener noreferrer">
                  GoIceTravel
                </a>
                . The operator&apos;s legal name, registered address and the contact address for privacy requests are
                published here once they have been confirmed; until then this page cannot name them.
              </p>
            </section>
            <section id="what-we-collect">
              <h2>What we collect and why</h2>
              <p>
                GoToBudapest does not ask you to create an account, does not contain forms that send us your details, and
                does not take bookings or payments. The site does not use advertising or tracking cookies.
              </p>
              <ul>
                <li>
                  <strong>Needed to run the site.</strong> Your browser sends technical request data (such as IP address,
                  browser type and the page asked for) to the hosting platform, which uses it to deliver pages and keep the
                  service secure (legitimate interests, GDPR Article 6(1)(f)). We also store your cookie choice, see below.
                </li>
                <li>
                  <strong>Optional analytics, only with your consent.</strong> Counting visits and showing which pages and
                  tours are looked at (GDPR Article 6(1)(a) and the ePrivacy rules on storing and reading information on your
                  device). Nothing optional runs until you choose.
                </li>
              </ul>
              <p>
                Filtering guides and searching the place directory happen in your browser. The search box on the homepage
                opens the attractions page with your search words in the web address, so those words can appear in the
                hosting platform&apos;s request logs. Analytics never receive the words you search for.
              </p>
            </section>
            <section id="consent">
              <h2>Your cookie choices</h2>
              <p>
                The first time you visit you are asked to <strong>Accept all</strong>, <strong>Reject all</strong> or{" "}
                <strong>Manage preferences</strong>; all three have the same prominence and no optional category is
                pre-selected. The same rules apply wherever you are (the EEA, the UK, Switzerland or elsewhere).
              </p>
              <ul>
                <li>
                  <strong>Strictly necessary:</strong> always on; remembers your choice and keeps the site working. It does
                  not need consent.
                </li>
                <li>
                  <strong>Analytics:</strong> off until you allow it.
                </li>
                <li>
                  <strong>Functional personalisation:</strong> off until you allow it. The site has no such feature today, so
                  this switch currently changes nothing.
                </li>
                <li>
                  <strong>Marketing and advertising:</strong> off until you allow it. No advertising or remarketing tag is
                  installed today; the switch keeps Google&apos;s advertising signals denied unless you allow them.
                </li>
              </ul>
              <p>
                We keep your choice as evidence in one first-party cookie, <code>{CONSENT_COOKIE}</code>: the policy version
                ({POLICY_VERSION}), your four choices and the time you chose. It holds no identifier and is not sent to any
                analytics tool. It expires after {CONSENT_MAX_AGE_DAYS} days or earlier if this policy changes in a way that
                needs a new decision, and you are then asked again.
              </p>
              <p>
                You can change or withdraw your consent at any time with <CookieSettingsLink /> (also in the footer of every
                page). Withdrawing analytics consent stops further measurement at once and removes the Google Analytics
                cookies on this site. Withdrawing does not undo processing that happened before. If you clear your browser
                data, you are asked again.
              </p>
            </section>
            <section id="cookies">
              <h2>Cookie inventory</h2>
              <p>
                Every cookie this site can set. Cookies marked optional are set only after you allow that category.
              </p>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Provider</th>
                      <th scope="col">Purpose</th>
                      <th scope="col">Category</th>
                      <th scope="col">Lifespan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code>{CONSENT_COOKIE}</code>
                      </td>
                      <td>GoToBudapest (first party)</td>
                      <td>Remembers your choice: policy version, the four category choices and the time</td>
                      <td>Strictly necessary</td>
                      <td>{CONSENT_MAX_AGE_DAYS} days</td>
                    </tr>
                    <tr>
                      <td>
                        <code>_ga</code>
                      </td>
                      <td>Google Analytics 4</td>
                      <td>Tells returning visitors apart so visits can be counted</td>
                      <td>Analytics (optional)</td>
                      <td>Up to 2 years (Google&apos;s default)</td>
                    </tr>
                    <tr>
                      <td>
                        <code>_ga_&lt;container ID&gt;</code>
                      </td>
                      <td>Google Analytics 4</td>
                      <td>Keeps session state</td>
                      <td>Analytics (optional)</td>
                      <td>Up to 2 years (Google&apos;s default)</td>
                    </tr>
                    <tr>
                      <td>None</td>
                      <td>Vercel Web Analytics</td>
                      <td>Counts page views without storing a cookie in your browser, according to Vercel&apos;s documentation</td>
                      <td>Analytics (optional)</td>
                      <td>Not applicable</td>
                    </tr>
                    <tr>
                      <td>None</td>
                      <td>Functional personalisation</td>
                      <td>No such feature exists today</td>
                      <td>Functional (optional)</td>
                      <td>Not applicable</td>
                    </tr>
                    <tr>
                      <td>None</td>
                      <td>Marketing and advertising</td>
                      <td>No advertising or remarketing tag is installed today</td>
                      <td>Marketing (optional)</td>
                      <td>Not applicable</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                {gaOn
                  ? "Google Analytics 4 is configured on this site; its cookies appear only after you allow analytics."
                  : "Google Analytics 4 is not configured on this site at the moment, so the two Google cookies above are not set."}{" "}
                The site stores nothing else in your browser&apos;s local or session storage. The Studio used by editors
                (under /studio) is a separate area that visitors do not need; it uses the sign-in cookies of Sanity.
              </p>
            </section>
            <section id="analytics">
              <h2>Analytics</h2>
              <p>
                With your consent the site records these events: page views, views of attraction, guide, experience and tour
                pages, use of the site and tours search (only that a search happened and which filters were used, never the
                words typed), clicks on tour cards, checks of availability, and clicks on links to {partnersOr}. Each event
                carries only a page path without any query string, a content category or slug, the provider name, a product
                number, a placement name and, for a consent change, your category choices. We do not send names, e-mail
                addresses or other personal details, and we do not combine analytics with any account because there are none.
              </p>
              <p>
                A click on a link to a provider is recorded as a <em>hand-off</em>, not a booking: it only shows that a link
                was followed. Completed bookings and commission are known only from the provider&apos;s own reports and are
                not recorded by this site.
              </p>
              <p>
                Google Analytics is provided by Google, which states that Google Analytics 4 does not log or store IP
                addresses. Analytics is loaded only after you allow it, using Google consent mode v2: until
                then no request goes to Google, and advertising signals stay denied unless you also allow marketing.
                Vercel Web Analytics is provided by Vercel Inc., the hosting platform.
              </p>
            </section>
            <section id="third-parties">
              <h2>Third-party services</h2>
              <p>
                Even without analytics, loading a web page involves other services that receive technical information such as
                your IP address and browser details:
              </p>
              <ul>
                <li>
                  <strong>Hosting.</strong> The site is delivered through a third-party hosting platform (currently Vercel),
                  which processes technical request data to deliver the pages and to keep the service secure.
                </li>
                <li>
                  <strong>Content and images.</strong> Editorial content is managed in Sanity, and many photographs are served
                  from Sanity&apos;s image CDN, which receives standard network information when a photograph loads.
                </li>
                <li>
                  <strong>Google Fonts.</strong> The typefaces are loaded from Google Fonts, so your browser connects to
                  Google&apos;s servers when a page loads.
                </li>
              </ul>
              <p>
                Attraction and editorial photographs are generally served from this site or from the Sanity image CDN. When you
                scroll to the Tours &amp; Tickets recommendations, selected product photographs may load directly from{" "}
                {imageHosts} image hosts. Those hosts receive standard network information such as an IP address;
                GoToBudapest suppresses the referrer when loading those photographs. Tiqets images are not requested under its
                standard affiliate content permissions.
              </p>
              <p>
                To show bookable products, our server requests catalogues from {partners} using server-only partner
                credentials. We send an editorial destination or topic, not your payment information or personal details. We
                do not handle booking, payment or traveller information; these remain with the provider.
              </p>
            </section>
            <section id="affiliate">
              <h2>Affiliate links</h2>
              <p>
                Booking links to {partnersOr} may include an affiliate tracking parameter, and GoToBudapest may earn a
                commission if you book, at no extra cost to you. The provider then handles your booking and its own cookies
                under its own privacy policy. The commission does not change the price you pay.
              </p>
            </section>
            <section id="retention">
              <h2>Retention and transfers</h2>
              <ul>
                <li>
                  <strong>Cookie choice:</strong> {CONSENT_MAX_AGE_DAYS} days, then you are asked again.
                </li>
                <li>
                  <strong>Analytics data:</strong> kept by the analytics provider for the retention period configured for the
                  property by the operator; Google Analytics 4 offers 2 or 14 months for event data.
                </li>
                <li>
                  <strong>Hosting request logs:</strong> kept by the hosting provider for the period set out in its
                  documentation.
                </li>
              </ul>
              <p>
                Google and Vercel may process data outside the EEA, the UK and Switzerland, including in the United States.
                Transfers rely on the safeguards described in their data-processing terms, such as standard contractual clauses
                or an adequacy decision; see each provider&apos;s documentation.
              </p>
            </section>
            <section id="rights">
              <h2>Your rights</h2>
              <p>
                Under the GDPR (and the UK GDPR and the Swiss data protection law) you can ask for access to, correction or
                deletion of your personal data, restrict or object to its processing, ask for portability, withdraw consent at
                any time without affecting earlier processing, and complain to your data protection supervisory authority.
                Because analytics do not identify you, we usually cannot link a request to your visits; the provider&apos;s
                own tools apply for data they hold. The contact address for requests will be shown in the first section once
                confirmed.
              </p>
            </section>
            <section id="links">
              <h2>External links</h2>
              <p>
                Place pages, guides, credits and booking offers link to official visitor sites, transport operators, map
                services, Wikimedia Commons and {partnersOr}. Those sites have their own privacy policies and may set cookies
                or collect data once you follow a link. We do not control them.
              </p>
            </section>
            <section id="earlier-versions">
              <h2>Earlier versions of the site</h2>
              <p>
                An earlier version of GoToBudapest let you save places in your browser. That feature has been removed and
                nothing is saved by the site any more. If you used it, a leftover entry may remain in your browser&apos;s site
                data, which you can clear in your browser settings.
              </p>
            </section>
            <p>
              <Link className="textlink" href="/">
                Back to the homepage ↗
              </Link>
            </p>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
