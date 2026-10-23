import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  guides,
  getGuide,
  guidePhoto,
  readingMinutes,
} from "../../../lib/guides";
import { pageMetadata } from "../../../lib/seo";
import { absoluteUrl } from "../../../lib/site";
import Breadcrumbs from "../../../components/breadcrumbs";
import JsonLd from "../../../components/json-ld";
import PhotoCredit from "../../../components/photo-credit";
import SiteHeader from "../../../components/site-header";
import SiteFooter from "../../../components/site-footer";
import GuideCard from "../../../components/guide-card";
export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return pageMetadata({
    title: g.title,
    description: g.description,
    path: `/guides/${g.slug}`,
    image: guidePhoto(g).src1280,
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
  const guide = getGuide(slug);
  if (!guide) notFound();
  const photo = guidePhoto(guide);
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
              <section key={s.id} id={s.id}>
                <h2>{s.title}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {s.bullets ? (
                  <ul>
                    {s.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
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
              <p>Find places to add to your own shortlist.</p>
              <Link className="primary" href="/attractions">
                Explore attractions ↗
              </Link>
            </div>
          </article>
        </div>
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
            {guide.related
              .map((slug) => getGuide(slug))
              .filter((g) => g !== undefined)
              .map((g) => (
                <GuideCard key={g.slug} guide={g} />
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
