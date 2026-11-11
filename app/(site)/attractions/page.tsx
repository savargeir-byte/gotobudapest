import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import AttractionBrowser from "@/components/attraction-browser";
import Breadcrumbs from "@/components/breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { loadContent } from "@/lib/content";
import { summarize } from "@/lib/summary";
import AttractionCard from "@/components/attraction-card";
import { pick } from "@/lib/content";
import { newDayTripSlugs } from "@/lib/new-attractions/day-trips";
export async function generateMetadata(): Promise<Metadata> {
  const { attractions } = await loadContent();
  return pageMetadata({
    title: `${attractions.length} Budapest Attractions & Places to Explore`,
    description: `Explore ${attractions.length} Budapest landmarks, museums, baths, parks, churches and cultural venues. Search by name or category and follow official visitor links.`,
    path: "/attractions",
  });
}
export default async function AttractionsPage() {
  const content = await loadContent();
  // Places outside the city: reached from here (and the booking rail), not through a neighbourhood.
  const dayTrips = pick(content.attractions, [...newDayTripSlugs, "godollo-royal-palace"]).map(summarize);
  return (
    <>
      <a className="skip" href="#places">
        Skip to places
      </a>
      <SiteHeader />
      <main>
        <section className="section guide-hub-intro">
          <Breadcrumbs items={[{ name: "Attractions" }]} />
          <div className="eyebrow">{content.attractions.length} PLACES. YOUR OWN WAY TO EXPLORE.</div>
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
          <AttractionBrowser attractions={content.attractions.map(summarize)} />
        </section>
        {dayTrips.length ? (
          <section className="section" id="day-trips">
            <div className="section-heading">
              <div>
                <div className="eyebrow">BEYOND THE CITY</div>
                <h2>Day trips from Budapest</h2>
                <p>Historic towns, a royal palace and an open-air museum within reach of the city. Check the official pages for access before you travel.</p>
              </div>
            </div>
            <div className="cards">
              {dayTrips.map((a) => (
                <AttractionCard key={a.id} attraction={a} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
