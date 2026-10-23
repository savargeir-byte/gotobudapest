import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
export const metadata: Metadata = {
 title:"Budapest Travel Essentials: Transport, Money & Tips | GoToBudapest",
 description:"What to know before visiting Budapest: Hungarian forint, public transport tickets, the airport connection, booking precautions and practical local travel tips."
};
export default function EssentialsPage(){
 const items=[
  {title:"Money and payment",body:"Hungary uses the Hungarian forint (HUF). Many places accept payment cards, but keep a way to pay in local currency. Check the conversion currency shown by a terminal before accepting a charge.",link:"https://www.mnb.hu/en",label:"Hungarian National Bank"},
  {title:"Public transport",body:"Budapest’s BKK network connects the centre by metro, tram and bus. Check which tickets need validation and whether a pass covers your route. The BudapestGO app provides official journey planning and ticket options.",link:"https://bkk.hu/en/tickets-and-passes/",label:"BKK tickets and passes"},
  {title:"Airport transfers",body:"The 100E Airport Express serves the airport and the city centre under special ticket rules. Do not assume an ordinary single ticket is valid for it. Verify your departure point and the latest fare with BKK.",link:"https://bkk.hu/en/travel-information/airport-express/",label:"BKK airport travel information"},
  {title:"Thermal-bath visits",body:"Pack swimwear, a towel and suitable poolside footwear. Entry rules, locker types and age restrictions vary by bath. Check each bath's current conditions before paying.",link:"https://www.szechenyibath.hu/",label:"Official Széchenyi visitor information"},
  {title:"Castle Hill",body:"Castle Hill has steep approaches and uneven surfaces. Allow time for the walk or check buses serving the upper district. The funicular has separate operating notices and tickets.",link:"https://bkk.hu/en/travel-information/special-and-heritage-transport-services/funicular/",label:"BKK funicular details"},
  {title:"Tickets and opening hours",body:"Book major interiors, including Parliament, only through an operator or seller you trust. Check the visit date, cancellation conditions and the actual meeting point. Opening hours can change.",link:"https://www.parlament.hu/web/visitors",label:"Official Parliament visitor service"},
 ];
 return <><a className="skip" href="#essentials">Skip to essentials</a><SiteHeader/><main id="essentials">
 <section className="section editorial-intro"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Essentials</span></nav><div className="eyebrow">BEFORE YOU ARRIVE</div><h1>Budapest essentials.</h1><p className="editorial-subtitle">Practical answers for a smoother city break. Always check current details with the official provider before travel.</p></section>
 <section className="section"><div className="editorial-essentials">{items.map((item,i)=><article key={item.title}><span>{String(i+1).padStart(2,"0")}</span><h2>{item.title}</h2><p>{item.body}</p><a className="textlink" href={item.link} target="_blank" rel="noopener noreferrer">{item.label} ↗</a></article>)}</div>
 <p className="catalog-tip">For destination inspiration, discover <Link href="/neighbourhoods/castle-district">Castle Hill</Link>, <Link href="/neighbourhoods/downtown-pest">Downtown Pest</Link> and our <Link href="/guides">travel guides</Link>.</p></section></main><SiteFooter/></>;
}
