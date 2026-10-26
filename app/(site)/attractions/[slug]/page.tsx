import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  bySlug,
  loadContent,
  suggestedGuideSlugs,
  topicsForPlace,
} from "@/lib/content";
import PortableBody from "@/components/portable-body";
import AttractionGallery from "@/components/attraction-gallery";
import BookableOffers from "@/components/bookable-offers";
import { attractionGallery } from "@/lib/attraction-galleries";
import { getAttractionEditorial } from "@/lib/attraction-editorial";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import JsonLd from "@/components/json-ld";
import PhotoCredit from "@/components/photo-credit";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
export async function generateStaticParams() {
  const { attractions } = await loadContent();
  return attractions.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { attractions } = await loadContent();
  const a = bySlug(attractions, slug);
  if (!a) return {};
  return pageMetadata({
    title: a.seo?.title || `${a.name}, Budapest`,
    description: a.seo?.description || a.description,
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
  const content = await loadContent();
  const a = bySlug(content.attractions, slug);
  if (!a) notFound();
  const mapUrl = a.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${a.coordinates.latitude},${a.coordinates.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.name + " Budapest")}`;
  const gallery = attractionGallery(a.slug);
  const editorial = getAttractionEditorial(a.slug);
  const related = content.attractions
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
        <AttractionGallery images={gallery} attractionName={a.name} />
        {editorial ? (
          <article className="section detail-panel attraction-history" aria-labelledby="place-history">
            <div className="eyebrow">THE STORY BEHIND THE PLACE</div>
            <h2 id="place-history">History of {a.name}</h2>
            <p className="attraction-history-lead">{editorial.introduction}</p>
            {editorial.historySections.map((section) => (
              <section key={section.heading} className="attraction-history-section">
                <h3>{section.heading}</h3>
                {section.paragraphs.map((p) => <p key={p}>{p}</p>)}
              </section>
            ))}
            {editorial.stories && editorial.stories.length > 0 ? (
              <section className="attraction-stories" aria-labelledby="place-stories">
                <div className="eyebrow">STORIES & LOCAL TRADITIONS</div>
                <h2 id="place-stories">Stories people tell.</h2>
                {editorial.stories.map((story) => (
                  <article className="attraction-story-card" key={story.title}>
                    <span className="attraction-story-kind">{story.kind === "local-tradition" ? "LOCAL TRADITION" : story.kind === "religious-tradition" ? "RELIGIOUS TRADITION" : "DOCUMENTED HISTORICAL ACCOUNT"}</span>
                    <h3>{story.title}</h3>
                    {story.description.map((p) => <p key={p}>{p}</p>)}
                    <a className="textlink" href={story.sourceUrl} target="_blank" rel="noopener noreferrer">{story.sourceLabel} ↗</a>
                  </article>
                ))}
              </section>
            ) : null}
            <div className="attraction-history-sources">
              <strong>Historical sources</strong>
              {editorial.sources.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>
              ))}
            </div>
          </article>
        ) : null}
        <BookableOffers kind="attraction" slug={a.slug} heading="Tickets and tours near this attraction" description="Relevant Budapest experiences where available, supplied directly by authorised booking partners." />
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
          {a.body?.length ? (
            <section>
              <h2>About {a.name}</h2>
              <PortableBody value={a.body} />
            </section>
          ) : null}
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
              {suggestedGuideSlugs(a, content.guides).map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`}>
                  {g.shortTitle} ↗
                </Link>
              ))}
            </div>
          </section>
          {topicsForPlace(content, a.slug).length ? (
            <section>
              <h2>Explore it in context</h2>
              <div className="related-chips">
                {topicsForPlace(content, a.slug).map((t) => (
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
              ← Back to all {content.attractions.length} places
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
          ...(a.photo || gallery.length
            ? {
                image: [
                  ...(a.photo ? [absoluteUrl(a.photo.src1280)] : []),
                  ...gallery.map((photo) =>
                    photo.src.startsWith("https://") ? photo.src : absoluteUrl(photo.src),
                  ),
                ],
              }
            : {}),
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
