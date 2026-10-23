import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  attractions,
  getAttraction,
  suggestedGuides,
} from "../../../lib/attractions";
import { getGuide } from "../../../lib/guides";
import SiteHeader from "../../../components/site-header";
import SiteFooter from "../../../components/site-footer";
export function generateStaticParams() {
  return attractions.map((a) => ({ slug: a.slug }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getAttraction(slug);
  if (!a) return {};
  return {
    title: `${a.name}, Budapest | GoToBudapest`,
    description: a.description,
    openGraph: {
      title: `${a.name} — GoToBudapest`,
      description: a.description,
      type: "website",
    },
  };
}
export default async function AttractionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getAttraction(slug);
  if (!a) notFound();
  const mapUrl = a.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${a.coordinates.latitude},${a.coordinates.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.name + " Budapest")}`;
  const related = attractions
    .filter((p) => p.category === a.category && p.slug !== a.slug)
    .slice(0, 3);
  return (
    <>
      <a className="skip" href="#place">
        Skip to place details
      </a>
      <SiteHeader />
      <main id="place">
        <div className="section article-title detail-panel">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/attractions">Attractions</Link>
            <span>/</span>
            <span>{a.name}</span>
          </nav>
          <div className="eyebrow">{a.category.toUpperCase()}</div>
          <h1>{a.name}</h1>
          <p className="detail-description">{a.description}</p>
          {a.notice ? <div className="status-note">{a.notice}</div> : null}
          <div className="dialog-actions">
            <a
              className="outline"
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open map ↗
            </a>
          </div>
        </div>
        {a.image ? (
          <figure className="section article-hero detail-panel">
            <div>
              <Image
                src={`/assets/${a.image}`}
                alt={a.imageAlt || a.name}
                fill
                sizes="88vw"
                priority
              />
            </div>
          </figure>
        ) : null}
        <div className="section detail-panel article-body">
          <dl className="place-facts">
            <div>
              <dt>CATEGORY</dt>
              <dd>{a.category}</dd>
            </div>
            <div>
              <dt>LOCATION</dt>
              <dd>
                {a.address ||
                  "Budapest & surroundings — confirm the precise location using the visitor source."}
              </dd>
            </div>
          </dl>
          <section>
            <h2>Plan your visit</h2>
            <p>
              {a.category === "Baths & wellness"
                ? "Check admission conditions, the facilities covered by your ticket and any age restrictions before choosing a bathing session."
                : a.category === "Arts & culture"
                  ? "Choose your visit around the current programme: exhibitions, performances and building access may use different tickets."
                  : a.category === "Museums"
                    ? "Review the current exhibitions and visitor conditions before setting aside time for an indoor visit."
                    : a.category === "Parks & outdoors"
                      ? "Plan around the weather and the specific facilities you want to use. Outdoor areas and seasonal attractions can have different access arrangements."
                      : "Make this a stop on a wider neighbourhood walk. Check individual interior visits or paid areas separately before making fixed plans."}
            </p>
            <p>
              GoToBudapest does not show live opening hours, availability or
              ticket prices for this place. Use the official visitor information
              below for the latest details, and confirm accessibility for your
              own needs.
            </p>
            <a
              href={a.sourceUrl}
              className="textlink"
              target="_blank"
              rel="noopener noreferrer"
            >
              {a.sourceLabel} — visitor information ↗
            </a>
            {a.additionalSource ? (
              <p>
                <a
                  className="textlink"
                  href={a.additionalSource}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Operator’s current notice ↗
                </a>
              </p>
            ) : null}
            <p className="catalog-tip">
              Directory source checked {a.checked}. This records the source
              review, not a guarantee that the venue is open today.
            </p>
          </section>
          <section>
            <h2>Build a day around it.</h2>
            <div className="related-chips">
              {suggestedGuides(a.category)
                .map((s) => getGuide(s))
                .filter((g) => g !== undefined)
                .map((g) => (
                  <Link key={g.slug} href={`/guides/${g.slug}`}>
                    {g.shortTitle} ↗
                  </Link>
                ))}
            </div>
          </section>
          {related.length ? (
            <section>
              <h2>More to explore</h2>
              <div className="related-chips">
                {related.map((p) => (
                  <Link key={p.slug} href={`/attractions/${p.slug}`}>
                    {p.name} ↗
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
          <section>
            <Link className="textlink" href="/attractions">
              ← Back to all 100 places
            </Link>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
