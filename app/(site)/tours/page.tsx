import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import Marketplace from "@/components/marketplace/Marketplace";
import { pageMetadata } from "@/lib/seo";
import { parseQuery } from "@/lib/marketplace/query";
import { searchMarketplace } from "@/lib/marketplace/registry";
import { withVenuePhotos } from "@/lib/marketplace/venue-photos";
import { activeProviders, providerNames } from "@/lib/marketplace/enabled";
import { PROVIDER_LABEL, type MarketplaceResult } from "@/lib/marketplace/types";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// The partners named on the page are the providers in use (TourDesk is paused, see lib/marketplace/enabled.ts).
const baseMetadata = () =>
  pageMetadata({
    title: "Budapest Tours & Tickets | Cruises, Baths & Sightseeing",
    description: `Search real Budapest tours and admission tickets from ${providerNames(activeProviders(), PROVIDER_LABEL)}, compare options and continue with the provider to book.`,
    path: "/tours",
    image: "/assets/danube.webp",
  });

// Filtered or paged views are shareable but only the plain page is indexed.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const base = baseMetadata();
  return Object.keys(sp).length ? { ...base, robots: { index: false, follow: true } } : base;
}

export default async function BudapestToursPage({ searchParams }: Props) {
  const sp = await searchParams;
  // The cursor is never part of a shareable URL: the first page is always rendered.
  const active = activeProviders();
  const parsed = parseQuery(sp);
  // An old shared link to a provider that is not in use (?provider=tourdesk) simply shows all providers.
  const query = { ...parsed, ...(parsed.provider && !active.includes(parsed.provider) ? { provider: undefined } : {}), cursor: undefined };
  let initial: MarketplaceResult | null = null;
  try {
    initial = await withVenuePhotos(await searchMarketplace(query));
  } catch {
    initial = null; // the client shows a retryable error state
  }
  return (
    <>
      <a className="skip" href="#bookable-tours">Skip to Budapest experiences</a>
      <SiteHeader />
      <main>
        <div className="section article-title">
          <Breadcrumbs items={[{ name: "Tours & Tickets" }]} />
          <div className="eyebrow">{active.length >= 3 ? "THREE" : "TWO"} PROVIDERS. ONE BUDAPEST.</div>
          <h1>Budapest tours <em>& tickets.</em></h1>
          <p>Search and compare real Budapest tours and tickets from our booking partners. Open a product here for the full details and availability; you continue with the provider only as the final step.</p>
        </div>
        <figure className="section article-hero">
          <div>
            <Image src="/assets/danube.webp" alt="Budapest's illuminated riverfront and the Hungarian Parliament viewed across the Danube" fill sizes="88vw" priority />
          </div>
        </figure>
        <section className="section mk-section" id="bookable-tours" aria-label="Search tours and tickets">
          <Marketplace initialQuery={query} initialResult={initial} activeProviders={active} />
        </section>
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">FIND YOUR BUDAPEST</div>
              <h2>Find a tour for the way you travel.</h2>
              <p>Start with a category or read a guide before booking.</p>
            </div>
          </div>
          <div className="related-chips">
            <Link href="/experiences/danube">Danube cruises ↗</Link>
            <Link href="/experiences/thermal-baths">Thermal baths ↗</Link>
            <Link href="/experiences/food-and-markets">Food and markets ↗</Link>
            <Link href="/neighbourhoods/castle-district">Castle District ↗</Link>
            <Link href="/guides/budapest-in-3-days">Budapest in three days ↗</Link>
          </div>
        </section>
        <section className="section offer-explainer">
          <h2>How tickets and bookings work</h2>
          <p>Products, photographs, prices and ratings come from our partners&apos; catalogues when they respond; we show only what they supply. Each product page shows availability and options where the provider authorises it.{active.includes("tourdesk") ? " For supported TourDesk products you can choose your date, departure and participants here before continuing to TourDesk checkout; payment and personal details are handled by TourDesk." : " For Viator products you can pick a date and group size here to see real availability and prices before continuing with Viator, where the booking is completed and paid."}</p>
          <p>Viator and Tiqets bookings are completed on their own websites through the link at the end of the product page. Dates and tickets you looked at here may need to be chosen again there. Links may be affiliate links and can earn GoToBudapest a commission at no extra cost to you.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
