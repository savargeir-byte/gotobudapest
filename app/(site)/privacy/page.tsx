import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "What GoToBudapest does and does not collect: no accounts, no analytics, no advertising cookies, and the third-party services your browser contacts.",
  path: "/privacy",
});

export default function PrivacyPage() {
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
            updated 23 October 2026.
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
                bookings or payments. The site does not use analytics, advertising
                or tracking cookies, and it does not set cookies itself.
              </p>
              <p>
                Filtering guides and searching the place directory happen in your
                browser. The search box on the homepage opens the attractions
                page with your search words in the web address, so those words
                can appear in the hosting platform&apos;s request logs.
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
                  <strong>Google Fonts.</strong> The typefaces are loaded from
                  Google Fonts, so your browser connects to Google&apos;s servers
                  when a page loads.
                </li>
              </ul>
              <p>
                Photographs and other images are served from this site, not from
                a third party.
              </p>
            </section>
            <section id="links">
              <h2>External links</h2>
              <p>
                Place pages, guides and credits link to official visitor sites,
                transport operators, map services and Wikimedia Commons. Those
                sites have their own privacy policies and may set cookies or
                collect data once you follow a link. We do not control them.
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
