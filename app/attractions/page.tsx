import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import AttractionBrowser from "../../components/attraction-browser";
export const metadata: Metadata = {
  title: "100 Budapest Attractions & Places to Explore | GoToBudapest",
  description:
    "Explore 100 Budapest landmarks, museums, baths, parks and cultural venues. Search by name or category and save places to your trip.",
};
export default function AttractionsPage() {
  return (
    <>
      <a className="skip" href="#places">
        Skip to places
      </a>
      <SiteHeader />
      <main>
        <section className="section guide-hub-intro">
          <div className="eyebrow">100 PLACES. YOUR OWN WAY TO EXPLORE.</div>
          <h1>
            Find your
            <br />
            <em>Budapest.</em>
          </h1>
          <p>
            Landmarks you know. Museums to get lost in. A little more green
            space. Build a shortlist that feels like your kind of city break.
          </p>
          <p className="catalog-tip">
            A place directory, not a list of live bookable tickets. Seasonal and
            access notices appear on individual pages. Looking for an itinerary?{" "}
            <Link href="/guides">Start with our travel guides ↗</Link>
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
