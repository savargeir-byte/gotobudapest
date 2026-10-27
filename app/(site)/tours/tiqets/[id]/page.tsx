import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import PhotoCredit from "@/components/photo-credit";
import "@/components/marketplace.css";
import { loadContent } from "@/lib/content";
import { matchAttractionPhoto } from "@/lib/marketplace/attraction-match";
import {
  getTiqetsAvailability,
  getTiqetsProduct,
  isTiqetsId,
  type TiqetsAvailability,
  type TiqetsDetail,
} from "@/lib/marketplace/providers/tiqets-detail";

type Props = { params: Promise<{ id: string }> };

// Product pages of third-party catalogues are not indexed; the editorial pages are.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = isTiqetsId(id) ? await getTiqetsProduct(id) : undefined;
  return {
    title: result?.state === "ok" ? `${result.product.title} | Tiqets` : "Budapest ticket",
    robots: { index: false, follow: true },
  };
}

function Facts({ p }: { p: TiqetsDetail }) {
  return (
    <ul className="mk-facts" aria-label="Key facts">
      {p.price ? (
        <li>
          <span>Price</span>
          <strong>{p.price.label}</strong>
        </li>
      ) : null}
      {p.rating ? (
        <li>
          <span>Rating</span>
          <strong>
            ★ {p.rating.value.toFixed(1)} <small>({p.rating.count.toLocaleString("en-GB")} reviews)</small>
          </strong>
        </li>
      ) : null}
      {p.durationLabel ? (
        <li>
          <span>Duration</span>
          <strong>{p.durationLabel}</strong>
        </li>
      ) : null}
      {p.cancellation ? (
        <li>
          <span>Cancellation</span>
          <strong>{p.cancellation.summary}</strong>
        </li>
      ) : null}
    </ul>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h2>{title}</h2>
      <ul className="mk-list">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  );
}

function AvailabilityPanel({ availability }: { availability: TiqetsAvailability }) {
  return (
    <section className="booking-panel mk-availability" aria-labelledby="mk-availability-title">
      <h2 id="mk-availability-title">Availability</h2>
      {availability.state === "ok" ? (
        <>
          {availability.ticketTypes.length ? (
            <>
              <h3>Ticket types</h3>
              <ul className="mk-list">
                {availability.ticketTypes.map((t) => (
                  <li key={t.label}>
                    {t.label}
                    {t.description ? <span className="mk-muted"> · {t.description}</span> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <h3>Upcoming dates</h3>
          <ul className="mk-dates">
            {availability.days.map((d) => (
              <li key={d.date} className={d.available ? "" : "mk-soldout"}>
                <time dateTime={d.date}>
                  {new Date(`${d.date}T12:00:00Z`).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  })}
                </time>
                {d.available ? (
                  <span>
                    {d.fromPrice ? d.fromPrice.label : "Available"}
                    {d.timeslots.length ? (
                      <small> · {d.timeslots.join(", ")}</small>
                    ) : null}
                  </span>
                ) : (
                  <span>No tickets left</span>
                )}
              </li>
            ))}
          </ul>
          <p className="booking-note">
            Dates, times and prices are as reported by Tiqets for the next 30 days and can change
            before you book.
          </p>
        </>
      ) : availability.state === "empty" ? (
        <p role="status">
          Tiqets reports no available dates in the next 30 days
          {availability.nextAvailableDate ? (
            <>
              {" "}
              (next available date: <time dateTime={availability.nextAvailableDate}>{availability.nextAvailableDate}</time>)
            </>
          ) : null}
          .
        </p>
      ) : availability.state === "unavailable" ? (
        <p role="status">
          {availability.reason === "sales-disabled"
            ? "Tiqets is not selling this product at the moment."
            : "Live availability for this product is not available through our Tiqets account. You can check dates on Tiqets."}
        </p>
      ) : (
        <p role="status">Availability could not be loaded right now. You can check dates on Tiqets.</p>
      )}
    </section>
  );
}

export default async function TiqetsProductPage({ params }: Props) {
  const { id } = await params;
  if (!isTiqetsId(id)) notFound();
  const result = await getTiqetsProduct(id);
  if (result.state === "not-found") notFound();

  if (result.state === "error")
    return (
      <>
        <SiteHeader />
        <main className="section tour-detail">
          <Breadcrumbs items={[{ name: "Tours & tickets", href: "/tours" }, { name: "Tiqets" }]} />
          <h1>This ticket is temporarily unavailable</h1>
          <p role="alert">
            We could not load the Tiqets product right now. Please try again in a moment, or
            browse more <Link href="/tours">Budapest tours &amp; tickets</Link>.
          </p>
        </main>
        <SiteFooter />
      </>
    );

  const p = result.product;
  const [availability, content] = await Promise.all([
    p.onSale ? getTiqetsAvailability(id) : Promise.resolve<TiqetsAvailability>({ state: "unavailable", reason: "sales-disabled" }),
    loadContent(),
  ]);
  // A correctly credited photo of the exact attraction, never supplier imagery.
  const place = matchAttractionPhoto(p.title, content.attractions);

  return (
    <>
      <SiteHeader />
      <main className="section tour-detail">
        <Breadcrumbs
          items={[
            { name: "Tours & tickets", href: "/tours" },
            { name: "Tiqets" },
            { name: p.title },
          ]}
        />
        <div className="eyebrow">BUDAPEST · TIQETS</div>
        <h1>{p.title}</h1>
        {p.tagline ? <p className="mk-lead">{p.tagline}</p> : null}
        <Facts p={p} />
        {place?.photo ? (
          <figure className="mk-place-photo">
            <div>
              <Image
                src={place.photo.src1280}
                alt={place.photo.alt}
                fill
                sizes="(max-width: 900px) 92vw, 60vw"
                priority
              />
            </div>
            <figcaption>
              Photo of {place.name}, not supplier imagery.{" "}
              {place.photo.credit ? <PhotoCredit photo={place.photo} /> : null}
            </figcaption>
          </figure>
        ) : null}
        <div className="tour-booking-layout">
          <article className="mk-article">
            <h2>About this ticket</h2>
            {p.description.length ? (
              p.description.map((t) => <p key={t}>{t}</p>)
            ) : (
              <p>Tiqets has not supplied a description for this product.</p>
            )}
            <List title="Highlights" items={p.highlights} />
            <List title="What is included" items={p.inclusions} />
            <List title="Not included" items={p.exclusions} />
            {p.openingInfo ? (
              <section>
                <h2>Opening information</h2>
                <p>{p.openingInfo}</p>
              </section>
            ) : null}
            <List title="Good to know" items={p.importantInfo} />
            <p className="booking-note">
              Product information supplied by Tiqets. Confirm final inclusions, opening times and
              cancellation terms on Tiqets before you book.
            </p>
          </article>
          <aside>
            <AvailabilityPanel availability={availability} />
            <section className="booking-panel mk-handoff" aria-labelledby="mk-handoff-title">
              <h2 id="mk-handoff-title">Continue to Tiqets</h2>
              {p.onSale ? (
                <>
                  <a
                    className="primary"
                    href={p.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                  >
                    Continue to Tiqets ↗
                  </a>
                  <p className="booking-note">
                    Booking and payment are completed on Tiqets. Dates and tickets you looked at
                    here may need to be chosen again there. The link may earn GoToBudapest a
                    commission at no extra cost to you.
                  </p>
                </>
              ) : (
                <p role="status">Tiqets does not currently list this product for sale.</p>
              )}
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
