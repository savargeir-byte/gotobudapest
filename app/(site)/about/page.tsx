import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import JsonLd from "@/components/json-ld";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { loadContent } from "@/lib/content";
import { activeProviders, providerNames } from "@/lib/marketplace/enabled";
import { PROVIDER_LABEL } from "@/lib/marketplace/types";

export const metadata: Metadata = pageMetadata({
  title: "About GoToBudapest: how we write and how booking works",
  description:
    "What GoToBudapest is, how its Budapest guides are researched and sourced, which partners supply the tours and tickets, and how affiliate links and payment work.",
  path: "/about",
});

// A plain statement of what the site is and how it works, for visitors and for search and AI systems that need to describe it.
// Every figure comes from the live content; the partner names are the providers actually in use.
export default async function AboutPage() {
  const content = await loadContent();
  const partners = providerNames(activeProviders(), PROVIDER_LABEL);
  const partnersOr = partners.replace(/ and (?=[^ ]+$)/, " or ");
  return (
    <>
      <a className="skip" href="#about">
        Skip to content
      </a>
      <SiteHeader />
      <main id="about">
        <div className="section article-title">
          <Breadcrumbs items={[{ name: "About" }]} />
          <div className="eyebrow">ABOUT</div>
          <h1>About GoToBudapest</h1>
          <p>
            GoToBudapest is a Budapest travel guide with a booking shelf attached. It explains the city place by place and lets you open tours and tickets from
            partners without leaving the guide.
          </p>
        </div>
        <div className="section article-layout">
          <article className="article-body">
            <section>
              <h2>What you will find here</h2>
              <p>
                {content.attractions.length} attraction pages, {content.neighbourhoods.length} neighbourhood guides, {content.guides.length} travel guides,
                {" "}
                {content.experiences.length} themed experience pages and practical visitor guides on getting around, money, food, culture and day trips. Start with the{" "}
                <Link href="/attractions">attractions directory</Link>, the <Link href="/neighbourhoods">neighbourhood guides</Link> or the{" "}
                <Link href="/guides">travel guides</Link>.
              </p>
            </section>
            <section>
              <h2>How the guides are written</h2>
              <p>
                Attraction and neighbourhood pages are written from named sources, and the sources are listed on each page: official visitor sites, institutional
                pages and reference works. Hungarian names are given where they are known, so you can recognise them on signs and maps. Where sources disagree, the text says so or leaves
                the detail out.
              </p>
              <p>
                GoToBudapest does not publish opening hours, ticket prices or live availability for places, because they change. Each page links to the source to
                check. A page that says a source was &quot;checked&quot; on a date records that review, not that the venue is open today.
              </p>
              <p>
                Photographs are credited with their author and licence. Where a page has no photograph of the place itself, none is shown rather than a picture of
                somewhere else.
              </p>
            </section>
            <section>
              <h2>Tours, tickets and booking partners</h2>
              <p>
                Tours and tickets come from {partners}. Prices, ratings, photographs and descriptions are what those providers supply; GoToBudapest does not
                invent them and does not check availability itself. Opening a product here shows its details; the booking is completed with the provider on its own
                website, where you choose the date and travellers and pay. GoToBudapest has no payment system of its own and never sees your card details.
              </p>
              <p>
                Links to {partnersOr} may carry an affiliate tracking parameter, and GoToBudapest may earn a commission if you book, at no extra cost to you. The
                commission does not change the price. Details, and what is measured when you click, are in the <Link href="/privacy#affiliate">privacy and cookies page</Link>.
              </p>
            </section>
            <section>
              <h2>Where to go next</h2>
              <p>
                Browse <Link href="/tours">Budapest tours and tickets</Link>, plan with <Link href="/guides/budapest-in-3-days">Budapest in 3 days</Link>, or see{" "}
                <Link href="/guides/getting-around-budapest">how to get around</Link>.
              </p>
            </section>
          </article>
        </div>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About GoToBudapest",
          url: absoluteUrl("/about"),
          about: { "@id": absoluteUrl("/#organization") },
          isPartOf: { "@id": absoluteUrl("/#website") },
        }}
      />
      <SiteFooter />
    </>
  );
}
