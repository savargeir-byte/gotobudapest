import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import GuideCard from "@/components/guide-card";
import Breadcrumbs from "@/components/breadcrumbs";
import { loadContent, pick } from "@/lib/content";
import { summarizeGuide } from "@/lib/summary";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Budapest Travel Essentials: Currency, Transport & Planning Basics",
  description:
    "Practical basics for a first visit to Budapest: the forint, public transport, hills and accessibility, opening hours, seasonal venues and respectful visiting.",
  path: "/essentials",
  image: "/assets/city.webp",
});

const sections = [
  {
    id: "money",
    title: "Money",
    body: [
      "Hungary uses the Hungarian forint (HUF), not the euro. Check current exchange rates and how you plan to pay before you travel, and keep an eye on any fees your bank or card issuer charges abroad.",
    ],
  },
  {
    id: "transport",
    title: "Getting around",
    body: [
      "Central Budapest is very walkable, and the metro, trams and buses fill the gaps between neighbourhoods. Public transport is run by BKK; use the official BKK website or the BudapestGO app for current routes, tickets and fares rather than relying on a printed price.",
      "Group your stops by area before choosing transport: it usually saves more time than picking the fastest line.",
    ],
    link: { href: "/guides/getting-around-budapest", label: "Read the transport guide" },
  },
  {
    id: "terrain",
    title: "Hills, cobbles and accessibility",
    body: [
      "Pest is flat. Buda is hilly, and Castle Hill and Gellért Hill have slopes, steps and cobbled or uneven stretches. Wear comfortable shoes with good grip, and plan your route if you travel with a pushchair or have mobility needs.",
      "GoToBudapest cannot confirm accessibility at individual venues. Ask the venue directly before you go.",
    ],
    link: { href: "/neighbourhoods/castle-district", label: "See the Castle District" },
  },
  {
    id: "hours",
    title: "Opening hours, tickets and seasons",
    body: [
      "Opening hours, admission rules and ticket conditions change by season and by day. Some venues close on certain weekdays, some outdoor places, such as open-air baths and beaches, run only in season, and some venues close for renovation.",
      "Every place page in our directory links to an official source. Check it for the date you plan to visit, particularly for baths, museums and parliament or church interiors.",
    ],
    link: { href: "/attractions", label: "Browse all 100 places" },
  },
  {
    id: "respect",
    title: "Visiting memorials and places of worship",
    body: [
      "Several of the city's most important sites are memorials or active places of worship, including the Shoes on the Danube Bank, the Dohány Street Synagogue and the House of Terror Museum. Dress and behave respectfully, follow the venue's rules about photography and security, and allow the time and space the visit deserves.",
    ],
  },
  {
    id: "stay-safe",
    title: "Before you leave your accommodation",
    body: [
      "Keep your accommodation address saved offline, carry a way to contact someone you trust, and note the European emergency number, 112.",
    ],
  },
];

export default async function EssentialsPage() {
  const content = await loadContent();
  const guides = pick(content.guides, [
    "getting-around-budapest",
    "budapest-in-3-days",
    "budapest-thermal-baths",
  ]);
  return (
    <>
      <a className="skip" href="#essentials">
        Skip to content
      </a>
      <SiteHeader />
      <main>
        <div className="section article-title">
          <Breadcrumbs items={[{ name: "Essentials" }]} />
          <div className="eyebrow">A LITTLE KNOW-HOW GOES A LONG WAY</div>
          <h1>Budapest essentials</h1>
          <p>
            The practical basics for a first visit: money, transport, terrain,
            opening hours and respectful visiting.
          </p>
        </div>
        <figure className="section article-hero">
          <div>
            <Image
              src="/assets/city.webp"
              alt="Budapest's bridges crossing the Danube, with Buda on the left and Pest on the right"
              fill
              sizes="88vw"
              priority
            />
          </div>
        </figure>
        <div className="section article-layout">
          <aside className="article-toc">
            <h2>On this page</h2>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.title}</a>
                </li>
              ))}
              <li>
                <a href="#sources">Official sources</a>
              </li>
            </ol>
          </aside>
          <article id="essentials" className="article-body">
            {sections.map((s) => (
              <section key={s.id} id={s.id}>
                <h2>{s.title}</h2>
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {s.link ? (
                  <Link className="textlink" href={s.link.href}>
                    {s.link.label} ↗
                  </Link>
                ) : null}
              </section>
            ))}
            <section id="sources" className="article-sources">
              <h2>Official sources</h2>
              <ul>
                <li>
                  <a href="https://bkk.hu/en/" target="_blank" rel="noopener noreferrer">
                    BKK — official transport information ↗
                  </a>
                </li>
                <li>
                  <a href="https://www.budapestinfo.hu/en" target="_blank" rel="noopener noreferrer">
                    Budapest Info — official visitor guide ↗
                  </a>
                </li>
              </ul>
            </section>
          </article>
        </div>
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
      <SiteFooter />
    </>
  );
}
