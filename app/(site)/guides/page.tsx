import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import GuideBrowser from "@/components/guide-browser";
import Breadcrumbs from "@/components/breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { loadContent } from "@/lib/content";
import { summarizeGuide } from "@/lib/summary";
export const metadata: Metadata = pageMetadata({
  title: "Budapest Travel Guides",
  description:
    "Practical Budapest guides to itineraries, thermal baths, transport, Danube cruises, bars and neighbourhoods.",
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
      </main>
      <SiteFooter />
    </>
  );
}
