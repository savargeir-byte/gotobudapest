import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import BookableOffers from "@/components/bookable-offers";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Budapest Tours & Tickets | Cruises, Baths & Sightseeing",
  description: "Explore real Budapest tours and admission tickets from TourDesk, Viator and Tiqets. Secure booking is completed with the provider.",
  path: "/tours",
  image: "/assets/danube.webp",
});

export default function BudapestToursPage() {
  return (
    <>
      <a className="skip" href="#bookable-tours">Skip to Budapest experiences</a>
      <SiteHeader />
      <main>
        <div className="section article-title">
          <Breadcrumbs items={[{ name: "Tours & Tickets" }]} />
          <div className="eyebrow">THREE PROVIDERS. ONE BUDAPEST.</div>
          <h1>Budapest tours <em>& tickets.</em></h1>
          <p>Choose the experiences that fit your visit. Compare bookable options from our booking partners and complete your reservation securely with the provider.</p>
        </div>
        <figure className="section article-hero">
          <div>
            <Image src="/assets/danube.webp" alt="Budapest's illuminated riverfront and the Hungarian Parliament viewed across the Danube" fill sizes="88vw" priority />
          </div>
        </figure>
        <div id="bookable-tours">
          <BookableOffers kind="popular" heading="Explore available Budapest experiences" description="Live partner listings when they are available. Click an individual tour to confirm dates, party size, total price and cancellation terms." />
        </div>
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
          <p>Offers, images and prices shown on this page come from our partners when their catalogues respond. We do not create orders, take payments or collect your passport or card details on GoToBudapest.</p>
          <p>The booking link takes you to the relevant provider, where you can confirm the real-time availability and final payment amount. A provider may not offer products for every place or date. Links may be affiliate links.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
