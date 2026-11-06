import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import GuideBrowser from "@/components/guide-browser";
import Breadcrumbs from "@/components/breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { loadContent } from "@/lib/content";
import { summarizeGuide } from "@/lib/summary";
import Link from "next/link";
import { visitorGuides } from "@/lib/visitor-guides";
import { VisitorGuideCard } from "@/components/visitor-info";
export const metadata: Metadata = pageMetadata({
  title: "Budapest Travel Guides",
  description:
    "Illustrated Budapest travel guides: itineraries, HUF currency, transport, baths, food, museums, family days, nightlife, parks, neighbourhoods and more.",
  path: "/guides",
});
export default async function GuidesPage() {
  const content = await loadContent();
  return (
    <>
      <a className="skip" href="#guides">
        Skip to guides
      </a>
      <SiteHeader />
      <main>
        <section className="section guide-hub-intro">
          <Breadcrumbs items={[{ name: "Guides" }]} />
          <div className="eyebrow">THE BUDAPEST EDIT</div>
          <h1>
            A little know-how.
            <br />
            <em>A better city break.</em>
          </h1>
          <p>
            Thoughtful routes, useful details and room to make Budapest your
            own.
          </p>
        </section>
        <section id="guides" className="section catalog-section">
          <GuideBrowser guides={content.guides.map(summarizeGuide)} />
        </section>
        <section className="section">
          <div className="section-heading"><div><div className="eyebrow">EVERYTHING YOU NEED TO KNOW</div><h2>Plan the details, enjoy the city.</h2><p>Original photo-illustrated practical guides, linked places and relevant tickets.</p></div><Link href="/currency" className="textlink">HUF converter ↗</Link></div>
          <div className="visitor-hub-shortcuts"><Link href="/transportation">Transportation ↗</Link><Link href="/gastronomy">Food & drink ↗</Link><Link href="/culture">Culture ↗</Link><Link href="/visit">Visitor tips ↗</Link></div>
        </section>
        {(["transportation","gastronomy","culture","visit"] as const).map((group) => (
          <section className="section" key={group}>
            <div className="section-heading"><div><div className="eyebrow">BUDAPEST VISITOR GUIDES</div><h2>{group === "transportation" ? "Getting around" : group === "gastronomy" ? "Food & drink" : group === "culture" ? "Culture & heritage" : "Plan your visit"}</h2></div><Link className="textlink" href={`/${group}`}>See all ↗</Link></div>
            <div className="cards visitor-guide-grid">{visitorGuides.filter((g) => g.group === group).map((g) => <VisitorGuideCard guide={g} key={g.group + g.slug} />)}</div>
          </section>
        ))}
        <section className="section essentials"><div className="eyebrow">MONEY MATTERS</div><h2>Understand Hungarian forints.</h2><p>Check a published reference rate for HUF, EUR, USD and ISK, and learn when to use a bank card or carry cash.</p><Link href="/currency">Currency calculator and payment guide ↗</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
