/* eslint-disable @next/next/no-img-element -- Provider photos are served from the original licensed URL. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import Breadcrumbs from "@/components/breadcrumbs";
import SiteFooter from "@/components/site-footer";
import TourDeskBooking from "@/components/tourdesk-booking";
import ViatorProductPage from "@/components/viator/ViatorProductPage";
import { getBookingProduct } from "@/lib/booking/products";
import { ProviderError } from "@/lib/booking/common";
import { isTourdeskBookingEnabledFor } from "@/lib/booking/gate";
import { getViatorSchedules, scheduleView } from "@/lib/booking/viator-schedules";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ provider: string; id: string }>;
}): Promise<Metadata> {
  const { provider, id } = await params;
  const safe = /^[a-z]{3,12}$/.test(provider) && /^[A-Za-z0-9-]{1,40}$/.test(id);
  return {
    title: "Book a Budapest experience | GoToBudapest",
    robots: { index: false, follow: true },
    // Own address, not the site-wide "/" canonical inherited from the root layout.
    alternates: { canonical: safe ? `/tours/${provider}/${id}` : "/tours" },
  };
}
export default async function TourPage({
  params,
}: {
  params: Promise<{ provider: string; id: string }>;
}) {
  const { provider, id } = await params;
  let product;
  try {
    product = await getBookingProduct(provider, id);
  } catch (e) {
    if (e instanceof ProviderError && e.status === 404) notFound();
    throw e;
  }
  if (product.provider === "Viator" && product.viator) {
    // Details come from GET /products/{code} (above); availability from GET
    // /availability/schedules/{code}. A schedules failure degrades the availability panel only.
    const schedule = scheduleView(await getViatorSchedules(id));
    return (
      <>
        <SiteHeader />
        <main className="section tour-detail vp-page">
          <Breadcrumbs
            items={[
              { name: "Tours & tickets", href: "/tours" },
              { name: product.title },
            ]}
          />
          <ViatorProductPage product={product} schedule={schedule} />
        </main>
        <SiteFooter />
      </>
    );
  }
  const t = product.tour;
  return (
    <>
      <SiteHeader />
      <main className="section tour-detail">
        <Breadcrumbs
          items={[
            { name: "Tours & tickets", href: "/tours" },
            { name: product.provider },
          ]}
        />
        <div className="eyebrow">
          BUDAPEST · {product.provider.toUpperCase()}
        </div>
        <h1>{product.title}</h1>
        {product.photos[0] ? (
          <div className="tour-detail-hero">
            <img
              src={product.photos[0]}
              alt={product.title}
              referrerPolicy="no-referrer"
            />
          </div>
        ) : null}
        <div className="tour-booking-layout">
          <article>
            <h2>About this experience</h2>
            <p>{product.description}</p>
            {product.duration ? (
              <p>
                <strong>Duration:</strong> {product.duration}
              </p>
            ) : null}
            {product.included ? (
              <section>
                <h2>What is included</h2>
                <p>{product.included}</p>
              </section>
            ) : null}
            {product.cancellation ? (
              <section>
                <h2>Cancellation terms</h2>
                <p>{product.cancellation}</p>
              </section>
            ) : null}
            {product.photos.length > 1 ? (
              <div className="tour-photo-strip">
                {product.photos.slice(1).map((u, i) => (
                  <img
                    src={u}
                    alt={`${product.title} — photo ${i + 2}`}
                    key={u}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            ) : null}
            <p className="booking-note">
              Product information and photographs supplied by {product.provider}
              . Confirm final inclusions and cancellation terms at checkout.
            </p>
          </article>
          <aside>
            {t && isTourdeskBookingEnabledFor(id) ? (
              <TourDeskBooking
                id={id}
                currency={product.currency}
                bookingUrl={product.bookingUrl}
                tour={{
                  minimumPassengers: t.minimumPassengers,
                  maximumPassengers: t.maximumPassengers,
                  pickupService: t.pickupService,
                  mandatoryPickup: t.mandatoryPickup,
                  questionsBasedPickup: t.questionsBasedPickup,
                }}
              />
            ) : (
              <section className="booking-panel">
                <h2>Book your experience</h2>
                <a
                  className="primary"
                  href={product.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Continue on TourDesk ↗
                </a>
              </section>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
