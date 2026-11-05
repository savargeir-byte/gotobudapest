import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { activeProviders, providerNames } from "@/lib/marketplace/enabled";
import { PROVIDER_LABEL } from "@/lib/marketplace/types";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "GoToBudapest privacy and cookie policy: optional, consent-based Google Analytics, third-party providers and your choices.",
  path: "/privacy",
});

// The partners named below are the providers actually in use (TourDesk is paused, see lib/marketplace/enabled.ts).
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
          <h1>Your privacy</h1>
          <p>
            A plain description of what this website does with your data. Last
            updated 5 November 2026.
          </p>
        </div>
        <div className="section article-layout">
          <aside className="article-toc">
            <h2>On this page</h2>
            <ol>
              <li>
                <a href="#what-we-collect">What we collect</a>
              </li>
              <li>
                <a href="#cookies">Cookies and analytics</a>
              </li>
              <li>
                <a href="#third-parties">Third-party services</a>
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
            <section id="what-we-collect">
              <h2>What we collect</h2>
              <p>
                GoToBudapest does not ask you to create an account, does not
                contain forms that send us your details, and does not take
                bookings or payments. Optional Google Analytics 4 is loaded only
                after you actively allow analytics cookies. Advertising and
                remarketing tracking are not enabled. A small essential localStorage
                record saves your cookie preference.
              </p>
              <p>
                Filtering guides and searching the place directory happen in your
                browser. The search box on the homepage opens the attractions
                page with your search words in the web address, so those words
                can appear in the hosting platform&apos;s request logs.
              </p>
            </section>
            <section id="cookies">
              <h2>Cookies and analytics</h2>
              <p>
                When you first visit, optional analytics are off. You can allow,
                reject, or later change that decision using the Cookie settings
                control in the footer. Rejecting analytics does not prevent you
                from browsing places, guides or tours.
              </p>
              <p>
                We store your choice in the browser as
                <code>gtb-cookie-consent-v1</code> for up to 180 days. This
                essential preference record contains your selection, policy
                version and decision time, not an advertising identifier.
              </p>
              <p>
                If you opt in, Google Analytics 4 (measurement ID
                G-GCVBYQPJ9W) may set first-party cookies named
                <code>_ga</code> and <code>_ga_*</code>, with their
                cookie lifetime configured to six months. It records page views
                and interactions so that we can improve travel content and
                understand which links lead to booking partners. We do not
                receive payment or completed-booking details from those links.
                We do not deliberately transmit search text, names or email
                addresses to Google Analytics.
              </p>
              <p>
                Google processes analytics data as a service provider and may
                transfer data internationally subject to its applicable safeguards.
                Google Analytics data retention and account-level settings are
                managed separately from browser cookie lifetimes. If you
                withdraw your consent, we stop further analytics loading
                and remove the applicable first-party analytics cookies where
                your browser permits. You can also clear site data in your browser.
              </p>
            </section>
            <section id="third-parties">
              <h2>Third-party services</h2>
              <p>
                Even without tracking, loading a web page involves other
                services that receive technical information such as your IP
                address and browser details:
              </p>
              <ul>
                <li>
                  <strong>Hosting.</strong> The site is delivered through a
                  third-party hosting platform (currently Vercel), which
                  processes technical request data to deliver the pages and to
                  keep the service secure.
                </li>
                <li>
                  <strong>Fonts.</strong> Our web fonts are hosted directly
                  on GoToBudapest, not fetched from Google Fonts when you view a page.
                </li>
                <li>
                  <strong>Optional analytics.</strong> Google Analytics 4 is
                  loaded only after consent. The Google tag and Analytics
                  endpoints then receive technical request information and
                  consented page/activity events. Google&apos;s own privacy
                  documentation describes its processing and safeguards.
                </li>
              </ul>
              <p>
                Attraction and editorial photographs are generally served from this site or
                from the Sanity image CDN. When you scroll to the Tours &amp; Tickets
                recommendations, selected product photographs may load directly from
                {imageHosts} image hosts. Those hosts receive standard network
                information such as an IP address; GoToBudapest suppresses the referrer
                when loading those photographs. Tiqets images are not requested under
                its standard affiliate content permissions.
              </p>
              <p>
                To show bookable products, our server requests catalogues from
                {partners} using server-only partner credentials.
                We send an editorial destination or topic, not your payment
                information or personal details. We do not handle booking,
                payment or traveller information; these remain with the provider.
              </p>
            </section>
            <section id="links">
              <h2>External links</h2>
              <p>
                Place pages, guides, credits and booking offers link to official visitor
                sites, transport operators, map services, Wikimedia Commons and
                {partnersOr}. Booking links may include an affiliate
                tracking parameter and may earn us a commission. Those providers
                have their own privacy policies and may set cookies or collect
                data once you follow a link. We do not control them.
              </p>
            </section>
            <section id="earlier-versions">
              <h2>Earlier versions of the site</h2>
              <p>
                An earlier version of GoToBudapest let you save places in your
                browser. That feature has been removed and nothing is saved by
                the site any more. If you used it, a leftover entry may remain in
                your browser&apos;s site data, which you can clear in your browser
                settings.
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
