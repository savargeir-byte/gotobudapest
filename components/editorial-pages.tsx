import Image from "next/image";
import Link from "next/link";
import type { EditorialPage } from "../lib/editorial";
import { attractions } from "../lib/attractions";
import { getGuide } from "../lib/guides";
import GuideCard from "./guide-card";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";

export default function EditorialDetail({ page, collection, collectionTitle }: {
  page: EditorialPage;
  collection: "neighbourhoods" | "experiences";
  collectionTitle: string;
}) {
  const selected = page.attractionSlugs
    .map(slug => attractions.find(attraction => attraction.slug === slug))
    .filter((attraction) => attraction !== undefined);
  const related = page.guideSlugs.map(getGuide).filter(guide => guide !== undefined);
  return (
    <>
      <a className="skip" href="#content">Skip to content</a>
      <SiteHeader />
      <main id="content">
        <section className="section editorial-intro">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span>/</span>
            <Link href={`/${collection}`}>{collectionTitle}</Link><span>/</span>
            <span aria-current="page">{page.title}</span>
          </nav>
          <div className="eyebrow">{page.eyebrow}</div>
          <h1>{page.title}</h1>
          <p className="editorial-subtitle">{page.subtitle}</p>
          <p className="editorial-intro-copy">{page.intro}</p>
          <div className="editorial-actions">
            <a className="primary" href="#highlights">Explore this area ↓</a>
            <Link className="outline" href="/attractions">All Budapest attractions ↗</Link>
          </div>
        </section>
        <figure className="section editorial-feature">
          <div className="editorial-feature-image">
            <Image src={`/assets/${page.image}`} alt={page.imageAlt} fill priority sizes="(max-width: 760px) 100vw, 88vw" />
          </div>
          <figcaption>{page.imageCaption}</figcaption>
        </figure>
        <div className="section editorial-reading">
          <aside className="editorial-toc" aria-label="On this page">
            <strong>Explore the story</strong>
            <a href="#highlights">At a glance</a>
            {page.sections.map(section => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}
            <a href="#places">Places to discover</a>
            <a href="#questions">Common questions</a>
          </aside>
          <div className="editorial-copy">
            <section id="highlights" className="editorial-keypoints">
              <div className="eyebrow">GOOD TO KNOW</div>
              <h2>At a glance</h2>
              <ul>{page.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>
            </section>
            {page.sections.map(section => (
              <section id={section.id} className="editorial-story-section" key={section.id}>
                <h2>{section.title}</h2>
                {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
            <section className="editorial-story-section" id="questions">
              <h2>Common questions</h2>
              {page.questions.map(item => (
                <details className="editorial-faq" key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </section>
            <section className="editorial-story-section editorial-sources">
              <h2>Useful official sources</h2>
              <p>Visitor access, timetables and ticket conditions can change. Verify current details with the operator before visiting.</p>
              <ul>{page.sources.map(source => (
                <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>
              ))}</ul>
            </section>
          </div>
        </div>
        <section className="section" id="places">
          <div className="section-heading">
            <div><div className="eyebrow">EXPLORE THE NEARBY SIGHTS</div><h2>Places worth getting to know.</h2><p>Hand-picked from our existing Budapest attraction directory.</p></div>
            <Link href="/attractions" className="textlink">All 100 attractions ↗</Link>
          </div>
          <div className="editorial-place-grid">
            {selected.map(attraction => (
              <article key={attraction.slug} className="editorial-place">
                {attraction.image ? (
                  <div className="editorial-place-photo"><Image src={`/assets/${attraction.image}`} alt={attraction.imageAlt || attraction.name} fill sizes="(max-width:760px) 100vw, 30vw" /></div>
                ) : null}
                <div className="editorial-place-body">
                  <span>{attraction.category}</span>
                  <h3><Link href={`/attractions/${attraction.slug}`}>{attraction.name}</Link></h3>
                  <p>{attraction.description}</p>
                  {attraction.notice ? <p className="editorial-notice">{attraction.notice}</p> : null}
                  <Link href={`/attractions/${attraction.slug}`} className="textlink">Discover the place ↗</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
        {related.length > 0 ? (
          <section className="section">
            <div className="section-heading"><div><div className="eyebrow">THE BUDAPEST EDIT</div><h2>Explore the story further.</h2></div><Link className="textlink" href="/guides">All guides ↗</Link></div>
            <div className="cards">{related.map(guide => <GuideCard key={guide.slug} guide={guide} />)}</div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

export function EditorialCollection({ title, description, eyebrow, pages, collection }: {
  title:string;
  description:string;
  eyebrow:string;
  pages: EditorialPage[];
  collection: "neighbourhoods" | "experiences";
}) {
  return (
    <>
      <a className="skip" href="#browse">Skip to collection</a>
      <SiteHeader />
      <main id="browse">
        <section className="section editorial-intro">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">{title}</span></nav>
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p className="editorial-subtitle">{description}</p>
        </section>
        <section className="section editorial-collection">
          <div className="editorial-tiles">
            {pages.map((page, index) => (
              <article className="editorial-tile" key={page.slug}>
                <Link href={`/${collection}/${page.slug}`} className="editorial-tile-image" aria-label={`Read about ${page.title}`}>
                  <Image src={`/assets/${page.image}`} alt={page.imageAlt} fill sizes="(max-width:760px) 90vw, 46vw" priority={index === 0} />
                </Link>
                <div className="editorial-tile-body">
                  <span>{page.eyebrow}</span>
                  <h2><Link href={`/${collection}/${page.slug}`}>{page.title}</Link></h2>
                  <p>{page.subtitle}</p>
                  <Link className="textlink" href={`/${collection}/${page.slug}`}>Explore {page.title} ↗</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
