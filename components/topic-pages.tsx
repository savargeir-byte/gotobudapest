import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import GuideCard from "./guide-card";
import AttractionCard from "./attraction-card";
import Breadcrumbs from "./breadcrumbs";
import JsonLd from "./json-ld";
import PhotoCredit from "./photo-credit";
import PortableBody from "./portable-body";
import { pick } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { sectionId } from "@/lib/portable-text";
import { summarize, summarizeGuide } from "@/lib/summary";
import type { SiteContent, Topic } from "@/lib/types";

export function topicMetadata(base: string, t: Topic | undefined) {
  return t
    ? pageMetadata({
        title: t.seo?.title || t.title,
        description: t.seo?.description || t.description,
        path: `${base}/${t.slug}`,
        image: t.photo.src1280,
      })
    : {};
}

export function TopicHub({
  base,
  label,
  eyebrow,
  heading,
  intro,
  topics,
}: {
  base: string;
  label: string;
  eyebrow: string;
  heading: React.ReactNode;
  intro: string;
  topics: Topic[];
}) {
  return (
    <>
      <a className="skip" href="#topics">
        Skip to {label.toLowerCase()}
      </a>
      <SiteHeader />
      <main>
        <section className="section guide-hub-intro">
          <Breadcrumbs items={[{ name: label }]} />
          <div className="eyebrow">{eyebrow}</div>
          <h1>{heading}</h1>
          <p>{intro}</p>
        </section>
        <section className="section catalog-section" id="topics">
          <div className="cards topic-cards">
            {topics.map((t, i) => {
              const photo = t.photo;
              const href = `${base}/${t.slug}`;
              return (
                <article className="card guide-card" key={t.slug}>
                  <div className="card-img guide-card-image">
                    <Image
                      src={photo.src640}
                      alt={photo.alt}
                      fill
                      sizes="(max-width:760px) 88vw, 30vw"
                      priority={i === 0}
                    />
                  </div>
                  <div className="card-body">
                    <small>{t.eyebrow}</small>
                    <h2>
                      <Link href={href}>{t.title}</Link>
                    </h2>
                    <p>{t.summary}</p>
                    <Link className="textlink" href={href}>
                      Explore ↗
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export function TopicPage({
  base,
  label,
  topic,
  content,
}: {
  base: string;
  label: string;
  topic: Topic | undefined;
  content: SiteContent;
}) {
  if (!topic) notFound();
  const photo = topic.photo;
  const places = pick(content.attractions, topic.placeSlugs).map(summarize);
  const guides = pick(content.guides, topic.guides);
  return (
    <>
      <a className="skip" href="#topic">
        Skip to content
      </a>
      <SiteHeader />
      <main>
        <div className="section article-title">
          <Breadcrumbs
            items={[{ name: label, href: base }, { name: topic.title }]}
          />
          <div className="eyebrow">{topic.eyebrow}</div>
          <h1>{topic.title}</h1>
          <p>{topic.summary}</p>
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
          {photo.credit ? (
            <figcaption>
              <PhotoCredit photo={photo} />
            </figcaption>
          ) : null}
        </figure>
        <div className="section article-layout">
          <aside className="article-toc">
            <h2>On this page</h2>
            <ol>
              {topic.sections.map((s) => (
                <li key={s.title}>
                  <a href={`#${sectionId(s.title)}`}>{s.title}</a>
                </li>
              ))}
              <li>
                <a href="#questions">Common questions</a>
              </li>
              <li>
                <a href="#places">{topic.placesHeading}</a>
              </li>
            </ol>
            <Link className="textlink" href="/attractions">
              All 100 places ↗
            </Link>
          </aside>
          <article id="topic" className="article-body">
            <p className="article-lead">{topic.intro}</p>
            <div className="guide-highlights">
              <h2>At a glance</h2>
              <ul>
                {topic.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
            {topic.sections.map((s) => (
              <section key={s.title} id={sectionId(s.title)}>
                <h2>{s.title}</h2>
                <PortableBody value={s.body} />
              </section>
            ))}
            <section id="questions">
              <h2>Common questions</h2>
              {topic.faqs.map((f) => (
                <details key={f.question}>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </section>
            <section className="article-sources">
              <h2>Official sources & planning notes</h2>
              <p>
                Route and time suggestions are editorial. GoToBudapest does not
                show live opening hours, prices or availability; confirm current
                access with each venue before visiting.
              </p>
              <ul>
                {topic.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </article>
        </div>
        <section className="section" id="places">
          <div className="section-heading">
            <div>
              <div className="eyebrow">PLACES TO EXPLORE</div>
              <h2>{topic.placesHeading}</h2>
              <p>{topic.placesIntro}</p>
            </div>
            <Link className="textlink" href="/attractions">
              All 100 places ↗
            </Link>
          </div>
          <div className="cards">
            {places.map((a) => (
              <AttractionCard key={a.id} attraction={a} />
            ))}
          </div>
        </section>
        {guides.length ? (
          <section className="section">
            <div className="section-heading">
              <div>
                <div className="eyebrow">KEEP READING</div>
                <h2>Guides to go with it.</h2>
              </div>
              <Link className="textlink" href="/guides">
                All travel guides ↗
              </Link>
            </div>
            <div className="cards">
              {guides.map((g) => (
                <GuideCard key={g.slug} guide={summarizeGuide(g)} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: topic.title,
          description: topic.description,
          url: absoluteUrl(`${base}/${topic.slug}`),
          about: {
            "@type": "City",
            name: "Budapest",
            containedInPlace: { "@type": "Country", name: "Hungary" },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: topic.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <SiteFooter />
    </>
  );
}
