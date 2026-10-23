import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import AttractionBrowser from "../../components/attraction-browser";
import Breadcrumbs from "../../components/breadcrumbs";
import { pageMetadata } from "../../lib/seo";
import { attractions } from "../../lib/attractions";
export const metadata: Metadata = pageMetadata({
  title: `${attractions.length} Budapest Attractions & Places to Explore`,
  description:
    `Explore ${attractions.length} Budapest landmarks, museums, baths, parks, churches and cultural venues. Search by name or category and follow verified source links.`,
  path: "/attractions",
});
export default function AttractionsPage() {
  return (
    <>
      <a className="skip" href="#places">
        Skip to places
      </a>
      <SiteHeader />
      <main>
        <section className="section guide-hub-intro">
          <Breadcrumbs items={[{ name: "Attractions" }]} />
          <div className="eyebrow">{attractions.length} PLACES. YOUR OWN WAY TO EXPLORE.</div>
          <h1>
            Find your
            <br />
            <em>Budapest.</em>
          </h1>
          <p>
            Landmarks you know. Museums to get lost in. A little more green
            space. Pick the places that feel like your kind of city break.
          </p>
          <p className="catalog-tip">
            A place directory, not a list of live bookable tickets. Seasonal and
            access notices appear on individual pages. Looking for ideas?{" "}
            <Link href="/guides">Start with our travel guides ↗</Link> or{" "}
            <Link href="/experiences">browse experiences ↗</Link>
          </p>
        </section>
        <section className="section catalog-section" id="places">
          <Suspense fallback={<p>Loading the place directory…</p>}>
            <AttractionBrowser />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
