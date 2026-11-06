import Image from "next/image";
import Link from "next/link";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import Breadcrumbs from "./breadcrumbs";
import ContextualTours from "./marketplace/ContextualTours";
import PhotoCredit from "./photo-credit";
import AttractionCard from "./attraction-card";
import JsonLd from "./json-ld";
import { loadContent, pick } from "@/lib/content";
import { summarize } from "@/lib/summary";
import { photos } from "@/lib/attractions";
import { visitorGuides, type VisitorGuide } from "@/lib/visitor-guides";
import { absoluteUrl } from "@/lib/site";
import { seeAllHref } from "@/lib/marketplace/context";

const labels = { transportation: "Transportation", gastronomy: "Food & drink", culture: "Culture", visit: "Visitor tips" } as const;

export function VisitorGuideCard({ guide }: { guide: VisitorGuide }) {
  const photo = photos[guide.photoKey];
  const href = `/${guide.group}/${guide.slug}`;
  return (
    <article className="card guide-card visitor-guide-card">
      {photo ? (
        <figure className="visitor-guide-image">
          <Link href={href} aria-label={`Read ${guide.title}`}>
            <Image src={photo.src640} alt={photo.alt} fill sizes="(max-width:760px) 88vw, 30vw" />
          </Link>
          {photo.credit ? <figcaption><PhotoCredit photo={photo} /></figcaption> : null}
        </figure>
      ) : null}
      <div className="card-body">
        <small>{labels[guide.group].toUpperCase()} · VISITOR GUIDE</small>
        <h3><Link href={href}>{guide.shortTitle}</Link></h3>
        <p>{guide.description}</p>
        <Link className="textlink" href={href}>Read the guide ↗</Link>
      </div>
    </article>
  );
}

export async function VisitorGuideHub({ group }: { group: VisitorGuide["group"] }) {
  const guides = visitorGuides.filter((g) => g.group === group);
  const transport = group === "transportation";
  const culture = group === "culture";
  const practical = group === "visit";
  return (
    <>
      <a className="skip" href="#visitor-guides">Skip to guides</a>
      <SiteHeader />
      <main>
        <section className="section guide-hub-intro">
          <Breadcrumbs items={[{name:labels[group]}]} />
          <div className="eyebrow">{transport ? "MOVE THROUGH THE CITY" : culture ? "CULTURE & HERITAGE" : practical ? "PLAN SMARTER" : "TASTE THE CITY"}</div>
          <h1>{transport ? "Getting around" : culture ? "Experience culture in" : practical ? "Plan your trip to" : "Food & drink"} <em>Budapest.</em></h1>
          <p>{transport
            ? "From airport arrivals and scenic trams to tickets, accessible journeys and taxis: plan your time in Budapest with practical transport advice linked to official sources."
            : culture
              ? "Museums, live music, historic architecture and religious heritage: plan cultural visits with independent stories, photographs and ticket links to official sources."
              : practical
                ? "Plan family days, thermal-bath visits, parks, shopping, city passes and seasonal trips with official sources and linked places."
                : "From Hungarian specialities and food markets to cafés and evening discoveries: explore Budapest one neighbourhood and flavour at a time."}</p>
          <div className="visitor-hub-shortcuts">
            <Link href="/essentials">Travel essentials ↗</Link>
            <Link href="/currency">Forints, cards & exchange ↗</Link>
            <Link href="/transportation">Transport guides ↗</Link>
            <Link href="/gastronomy">Food & drink guides ↗</Link>
            <Link href="/culture">Culture guides ↗</Link>
            <Link href="/visit">Visitor tips ↗</Link>
            <Link href="/guides">All travel guides ↗</Link>
          </div>
        </section>
        <section className="section" id="visitor-guides">
          <div className="section-heading">
            <div><div className="eyebrow">PRACTICAL, WELL-SOURCED GUIDES</div><h2>{transport ? "Plan the journey." : culture ? "Explore the city’s creative side." : practical ? "Make every day count." : "Discover the flavours."}</h2></div>
          </div>
          <div className="cards visitor-guide-grid">{guides.map((g) => <VisitorGuideCard key={g.slug} guide={g}/>)}</div>
        </section>
        <section className="section essentials">
          <div className="eyebrow">KEEP EXPLORING</div>
          <h2>Make the most of your visit.</h2>
          <div className="essentials-grid">
            <article><span>01 / PLACES</span><h3>Discover attractions</h3><p>Read the stories behind Budapest&apos;s museums, historic places and landmarks.</p><Link href="/attractions">Explore attractions ↗</Link></article>
            <article><span>02 / KNOW-HOW</span><h3>Money made simple</h3><p>See reference conversions in HUF, EUR, USD and Icelandic króna.</p><Link href="/currency">Currency and card guide ↗</Link></article>
            <article><span>03 / BOOKABLE</span><h3>Find Budapest experiences</h3><p>Check relevant tours and tickets from the live marketplace.</p><Link href="/tours">Tours & tickets ↗</Link></article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export async function VisitorGuideArticle({ guide }: { guide: VisitorGuide }) {
  const content = await loadContent();
  const photo = photos[guide.photoKey];
  const base = `/${guide.group}`;
  const related = pick(content.attractions, guide.places).slice(0,6);
  const relatedPages = guide.other.filter((href) => {
    if (href.startsWith("/neighbourhoods/"))
      return content.neighbourhoods.some((n) => href === `/neighbourhoods/${n.slug}`);
    if (href.startsWith("/guides/"))
      return content.guides.some((g) => href === `/guides/${g.slug}`);
    return true;
  });
  const titleFor = (href: string) => {
    const found = visitorGuides.find((g) => href === `/${g.group}/${g.slug}`);
    if (found) return found.shortTitle;
    if (href === "/currency") return "Money, cards & exchange";
    if (href === "/essentials") return "Budapest essentials";
    if (href === "/guides/getting-around-budapest") return "Getting around Budapest";
    if (href === "/guides/budapest-in-3-days") return "Budapest in 3 days";
    if (href === "/guides/budapest-food-and-markets") return "Budapest food & markets";
    if (href === "/guides/budapest-bars-nightlife") return "Budapest bars & nightlife";
    if (href === "/guides/budapest-thermal-baths") return "Budapest thermal baths";
    if (href === "/guides/danube-cruises") return "Danube cruises";
    if (href.startsWith("/neighbourhoods/")) return content.neighbourhoods.find((n) => href.endsWith("/"+n.slug))?.title ?? "Explore neighbourhood";
    return href.replaceAll("-", " ").split("/").filter(Boolean).at(-1) ?? "More tips";
  };
  return (
    <>
      <a className="skip" href="#visitor-article">Skip to guide</a>
      <SiteHeader />
      <main>
        <section className="section article-title">
          <Breadcrumbs items={[{name:labels[guide.group], href:base},{name:guide.shortTitle}]} />
          <div className="eyebrow">{labels[guide.group].toUpperCase()} · BUDAPEST VISITOR GUIDE</div>
          <h1>{guide.title}</h1>
          <p>{guide.description}</p>
        </section>
        {photo ? <figure className="section article-hero">
          <div><Image src={photo.src1280} alt={photo.alt} fill sizes="88vw" priority /></div>
          <figcaption>{guide.caption || photo.alt} {photo.credit ? <PhotoCredit photo={photo} /> : null}</figcaption>
        </figure> : null}
        <div className="section article-layout">
          <aside className="article-toc">
            <h2>In this guide</h2>
            <ol>
              {guide.sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}
              <li><a href="#related-places">Places to explore</a></li>
              <li><a href="#sources">Official sources</a></li>
            </ol>
            <Link className="textlink" href={base}>More {labels[guide.group].toLowerCase()} ↗</Link>
          </aside>
          <article className="article-body" id="visitor-article">
            <p className="article-lead">{guide.intro}</p>
            <div className="guide-highlights"><h2>At a glance</h2><ul>{guide.highlights.map((h) => <li key={h}>{h}</li>)}</ul></div>
            {guide.sections.map((s,i) => (
              <section key={s.id} id={s.id}>
                <h2>{s.title}</h2>
                {s.paragraphs.map((p) => <p key={p}>{p}</p>)}
                {relatedPages[i] ? <p className="visitor-inline-related">
                  Continue reading: <Link href={relatedPages[i]}>{titleFor(relatedPages[i])} ↗</Link>
                </p> : null}
              </section>
            ))}
            <section id="related-places">
              <h2>Places in and around this guide</h2>
              <p>Read our local attraction pages for more history, photos and independent visitor information.</p>
              <div className="related-chips">
                {related.map((p) => <Link key={p.slug} href={`/attractions/${p.slug}`}>{p.name} ↗</Link>)}
              </div>
            </section>
            <section id="questions"><h2>Common questions</h2>
              {guide.faqs.map((f) => <details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}
            </section>
            <section className="article-sources" id="sources">
              <h2>Official sources and planning notes</h2>
              <p>Timetables, admissions, prices and venue rules can change. Check the provider&apos;s or operator&apos;s official information for your travel date.</p>
              <ul>{guide.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label} ↗</a></li>)}</ul>
            </section>
            <section className="visitor-related-list">
              <h2>Continue exploring Budapest</h2>
              <div className="related-chips">
                {relatedPages.map((href) => <Link key={href} href={href}>{titleFor(href)} ↗</Link>)}
                <Link href="/currency">Forints, cards & exchange ↗</Link>
                <Link href="/tours">All tours & tickets ↗</Link>
              </div>
            </section>
          </article>
        </div>
        {related.length > 0 ? <section className="section">
          <div className="section-heading"><div><div className="eyebrow">SEE THE CITY</div><h2>Places worth exploring.</h2></div><Link className="textlink" href="/attractions">All attractions ↗</Link></div>
          <div className="cards">{related.slice(0,3).map((a) => <AttractionCard key={a.slug} attraction={summarize(a)} />)}</div>
        </section> : null}
        <ContextualTours
          context={guide.tourContext}
          heading={guide.group === "gastronomy" ? "Discover Budapest food experiences" : guide.group === "culture" ? "Discover cultural tours, museums & tickets" : guide.group === "visit" ? "Find relevant Budapest experiences" : "Check Budapest tours & transport experiences"}
        />
        <section className="section visitor-tour-link">
          <Link className="primary" href={seeAllHref(guide.tourContext)}>Browse relevant tours and check availability ↗</Link>
          <p>Products and final booking terms are supplied by Viator or Tiqets; no booking is completed on this page.</p>
        </section>
      </main>
      <JsonLd data={{
        "@context":"https://schema.org","@type":"Article",headline:guide.title,description:guide.description,
        mainEntityOfPage:absoluteUrl(`${base}/${guide.slug}`),
        image:photo ? absoluteUrl(photo.src1280) : undefined,
        author:{"@type":"Organization",name:"GoToBudapest editorial"},
        publisher:{"@type":"Organization",name:"GoToBudapest"},
      }}/>
      <SiteFooter/>
    </>
  );
}
