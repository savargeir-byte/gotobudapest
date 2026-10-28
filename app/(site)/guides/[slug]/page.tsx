import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bySlug, loadContent, pick } from "@/lib/content";
import { readingMinutes } from "@/lib/portable-text";
import { summarizeGuide } from "@/lib/summary";
import PortableBody from "@/components/portable-body";
import ContextualTours from "@/components/marketplace/ContextualTours";
import { guideContext } from "@/lib/marketplace/context";
import EditorialInlinePhoto from "@/components/editorial-inline-photo";
import { guideInlinePhotos, photoAfter } from "@/lib/inline-photos";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/breadcrumbs";
import JsonLd from "@/components/json-ld";
import PhotoCredit from "@/components/photo-credit";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import GuideCard from "@/components/guide-card";
export async function generateStaticParams() {
  const { guides } = await loadContent();
  return guides.map((g) => ({ slug: g.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { guides } = await loadContent();
  const g = bySlug(guides, slug);
  if (!g) return {};
  return pageMetadata({
    title: g.seo?.title || g.title,
    description: g.seo?.description || g.description,
    path: `/guides/${g.slug}`,
    image: g.photo.src1280,
    type: "article",
    modifiedTime: g.updated,
  });
}
export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await loadContent();
  const guide = bySlug(content.guides, slug);
  if (!guide) notFound();
  const photo = guide.photo;
  return (
    <>
      <a className="skip" href="#article">
        Skip to article
      </a>
      <SiteHeader />
      <main>
        <div className="section article-title">
          <Breadcrumbs
            items={[
              { name: "Guides", href: "/guides" },
              { name: guide.shortTitle },
            ]}
          />
          <div className="eyebrow">
            {guide.category.toUpperCase()} · {readingMinutes(guide)} MIN READ
          </div>
          <h1>{guide.title}</h1>
          <p>{guide.description}</p>
          <div className="article-date">
            Updated{" "}
            <time dateTime={guide.updated}>
              {new Date(guide.updated + "T12:00:00Z").toLocaleDateString(
                "en-GB",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                },
              )}
            </time>{" "}
            · GoToBudapest editorial
          </div>
        </div>
        <figure className="section article-hero">
          <div>
            <Image
              src={photo.src1280}
              alt={photo.alt}
              fill
              sizes="88vw"
              priority
            />
          </div>
          {guide.imageCaption || photo.credit ? (
            <figcaption>
              {photo.credit ? (
                <PhotoCredit photo={photo} />
              ) : (
                guide.imageCaption
              )}
            </figcaption>
          ) : null}
        </figure>
        <div className="section article-layout">
          <aside className="article-toc">
            <h2>In this guide</h2>
            <ol>
              {guide.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.title}</a>
                </li>
              ))}
              <li>
                <a href="#questions">Common questions</a>
              </li>
            </ol>
            <Link className="textlink" href="/attractions">
              Explore the places ↗
            </Link>
          </aside>
          <article id="article" className="article-body">
            <p className="article-lead">{guide.intro}</p>
            <div className="guide-highlights">
              <h2>At a glance</h2>
              <ul>
                {guide.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
            {guide.sections.map((s) => (
              <div className="guide-section-group" key={s.id}>
                <section id={s.id}>
                  <h2>{s.title}</h2>
                  <PortableBody value={s.body} />
                </section>
                {photoAfter(guideInlinePhotos, guide.slug, s.id).map((item) => (
                  <EditorialInlinePhoto
                    key={item.photoKey}
                    photoKey={item.photoKey}
                    caption={item.caption}
                  />
                ))}
              </div>
            ))}
            <section id="questions">
              <h2>Common questions</h2>
              {guide.faqs.map((f) => (
                <details key={f.question}>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </section>
            <section className="article-sources">
              <h2>Official sources & planning notes</h2>
              <p>
                Venue details were checked against the sources below on{" "}
                {guide.updated}. Route choices and time allowances are editorial
                suggestions. Confirm current access, schedules and tickets
                before visiting.
              </p>
              <ul>
                {guide.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
            <div className="article-cta">
              <h2>Make it your Budapest.</h2>
              <p>Find places worth a visit in our directory of 100.</p>
              <Link className="primary" href="/attractions">
                Explore attractions ↗
              </Link>
            </div>
          </article>
        </div>
        {guideContext(guide.slug) ? (
          <ContextualTours context={guideContext(guide.slug)!} heading="Book a Budapest experience" />
        ) : null}
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">KEEP EXPLORING</div>
              <h2>A little more inspiration.</h2>
            </div>
            <Link className="textlink" href="/guides">
              All travel guides ↗
            </Link>
          </div>
          <div className="cards">
            {pick(content.guides, guide.related).map((g) => (
              <GuideCard key={g.slug} guide={summarizeGuide(g)} />
            ))}
          </div>
        </section>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: guide.title,
              description: guide.description,
              image: absoluteUrl(photo.src1280),
              dateModified: guide.updated,
              mainEntityOfPage: absoluteUrl(`/guides/${guide.slug}`),
              author: { "@type": "Organization", name: "GoToBudapest editorial" },
              publisher: { "@type": "Organization", name: "GoToBudapest" },
            },
            {
              "@type": "FAQPage",
              mainEntity: guide.faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            },
          ],
        }}
      />
      <SiteFooter />
    </>
  );
}
