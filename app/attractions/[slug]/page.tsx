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
import Breadcrumbs from "../../../components/breadcrumbs";
import JsonLd from "../../../components/json-ld";
import PhotoCredit from "../../../components/photo-credit";
import { topicsForPlace } from "../../../lib/topics";
import { pageMetadata } from "../../../lib/seo";
import { absoluteUrl } from "../../../lib/site";
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
  return pageMetadata({
    title: `${a.name}, Budapest`,
    description: a.description,
    path: `/attractions/${a.slug}`,
    image: a.photo?.src1280,
  });
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
          <Breadcrumbs
            items={[
              { name: "Attractions", href: "/attractions" },
              { name: a.name },
            ]}
          />
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
        {a.photo ? (
          <figure className="section article-hero detail-panel">
            <div>
              <Image
                src={a.photo.src1280}
                alt={a.photo.alt}
                fill
                sizes="88vw"
                priority
              />
            </div>
            {a.photo.credit ? (
              <figcaption>
                <PhotoCredit photo={a.photo} />
              </figcaption>
            ) : null}
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
          {topicsForPlace(a.slug).length ? (
            <section>
              <h2>Explore it in context</h2>
              <div className="related-chips">
                {topicsForPlace(a.slug).map((t) => (
                  <Link key={t.href} href={t.href}>
                    {t.title} ↗
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristAttraction",
          name: a.name,
          description: a.description,
          url: absoluteUrl(`/attractions/${a.slug}`),
          ...(a.photo ? { image: absoluteUrl(a.photo.src1280) } : {}),
          ...(a.address ? { address: a.address } : {}),
          ...(a.coordinates
            ? {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: a.coordinates.latitude,
                  longitude: a.coordinates.longitude,
                },
              }
            : {}),
          containedInPlace: { "@type": "City", name: "Budapest" },
        }}
      />
      <SiteFooter />
    </>
  );
}
