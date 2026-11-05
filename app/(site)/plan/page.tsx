import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import { VisitorGuideCard } from "@/components/visitor-info";
import { visitorGuides } from "@/lib/visitor-guides";
import { pageMetadata } from "@/lib/seo";
const groups=[
 {group:"transportation",title:"Getting around",description:"Airport transfers, metro, trams, tickets and accessibility.",href:"/transportation"},
 {group:"gastronomy",title:"Food & drink",description:"Hungarian dishes, markets, historic cafés and nightlife.",href:"/gastronomy"},
 {group:"culture",title:"Culture",description:"Museums, music, history, religious heritage and festivals.",href:"/culture"},
 {group:"visit",title:"Visitor tips",description:"Baths, families, parks, shopping, city passes and seasons.",href:"/visit"},
] as const;
export const metadata:Metadata=pageMetadata({title:"Plan a trip to Budapest: Guides, Money & Tickets",description:"Plan your Budapest trip with illustrated transport, gastronomy, cultural and practical guides, live HUF conversions, linked attractions and relevant tours.",path:"/plan"});
export default function PlanPage(){
 return <><a className="skip" href="#plan-content">Skip to trip planning</a><SiteHeader/>
 <main><section className="section guide-hub-intro" id="plan-content">
  <Breadcrumbs items={[{name:"Plan your visit"}]}/>
  <div className="eyebrow">ALL THE PRACTICAL DETAILS</div>
  <h1>Plan a better <em>Budapest.</em></h1>
  <p>Clear advice for moving around, what to eat, culture, family days, spending in forints and what to book in advance. Every guide links to the places behind the story.</p>
  <div className="visitor-hub-shortcuts"><Link href="/currency">Live HUF converter ↗</Link><Link href="/essentials">City essentials ↗</Link><Link href="/guides">Original travel guides ↗</Link><Link href="/tours">Tours & tickets ↗</Link></div>
 </section>
 {groups.map(g=><section className="section" key={g.href}>
  <div className="section-heading"><div><div className="eyebrow">EXPLORE BUDAPEST</div><h2>{g.title}</h2><p>{g.description}</p></div><Link className="textlink" href={g.href}>See all guides ↗</Link></div>
  <div className="cards visitor-guide-grid">{visitorGuides.filter(x=>x.group===g.group).slice(0,3).map(x=><VisitorGuideCard key={x.slug} guide={x}/>)}</div>
 </section>)}
 <section className="section essentials"><div className="eyebrow">READY TO EXPLORE</div><h2>From planning to real places.</h2><div className="essentials-grid">
  <article><span>01 / PLACES</span><h3>Explore 100+ attractions</h3><p>Independent descriptions and photographs of Budapest landmarks, museums and neighbourhoods.</p><Link href="/attractions">All attractions ↗</Link></article>
  <article><span>02 / CURRENCY</span><h3>Forint, EUR, USD & ISK</h3><p>Use the reference-rate converter and learn to pay safely with cards or cash.</p><Link href="/currency">Money guide ↗</Link></article>
  <article><span>03 / BOOKABLE</span><h3>See real availability</h3><p>Compare actual Budapest products and check the supplier&apos;s final conditions.</p><Link href="/tours">Browse tours ↗</Link></article>
 </div></section>
 </main><SiteFooter/></>;
}
