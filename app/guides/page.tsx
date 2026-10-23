import type { Metadata } from "next";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import GuideBrowser from "../../components/guide-browser";
export const metadata: Metadata = {
  title: "Budapest Travel Guides | GoToBudapest",
  description:
    "Plan your Budapest visit with practical guides to itineraries, thermal baths, transport, Danube cruises, bars and neighbourhoods.",
};
export default function GuidesPage() {
  return (
    <>
      <a className="skip" href="#guides">
        Skip to guides
      </a>
      <SiteHeader />
      <main>
        <section className="section guide-hub-intro">
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
          <GuideBrowser />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
