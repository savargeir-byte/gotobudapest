import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Breadcrumbs from "@/components/breadcrumbs";
import PhotoCredit from "@/components/photo-credit";
import CurrencyConverter,{type CurrencyRates} from "@/components/currency-converter";
import ContextualTours from "@/components/marketplace/ContextualTours";
import { photos } from "@/lib/attractions";
import { pageMetadata } from "@/lib/seo";

export const metadata:Metadata=pageMetadata({
 title:"Hungarian forint (HUF): EUR, USD and ISK exchange, cards and cash",
 description:"Use a reference-rate converter to compare 10 euros, 10 dollars and Icelandic króna with Hungarian forints. Learn when to pay by card and avoid costly conversion.",
 path:"/currency",
});
export const revalidate=86400;
type RatesResponse={date:string;rates:{HUF:number;USD:number;ISK:number}};
async function getRates():Promise<{rates:CurrencyRates;date:string}|null>{
 try{
  const response=await fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=HUF,USD,ISK",{next:{revalidate:86400},signal:AbortSignal.timeout(7000)});
  if(!response.ok)return null;
  const data=await response.json() as RatesResponse;
  if(!data.date||!Number.isFinite(Date.parse(data.date))||!data.rates)return null;
  const {HUF,USD,ISK}=data.rates;
  if(![HUF,USD,ISK].every(x=>typeof x==="number"&&Number.isFinite(x)&&x>0))return null;
  return {rates:{EUR:1,HUF,USD,ISK},date:data.date};
 }catch{return null;}
}
export default async function CurrencyPage(){
 const latest=await getRates();
 const photo=photos["great-market-hall"];
 return <>
  <a className="skip" href="#money-guide">Skip to currency guide</a><SiteHeader/>
  <main><section className="section article-title">
   <Breadcrumbs items={[{name:"Visitor guides",href:"/visitor-guides"},{name:"Hungarian forint and money"}]}/>
   <div className="eyebrow">BUDAPEST ESSENTIALS · MONEY</div>
   <h1>Hungarian forint: cash, cards and exchange</h1>
   <p>Hungary uses the Hungarian forint (HUF or Ft), not the euro. Compare reference conversions for EUR, USD and ISK and plan what to pay with in Budapest.</p>
  </section>
  <figure className="section article-hero"><div><Image src={photo.src1280} alt={photo.alt} fill priority sizes="88vw"/></div><figcaption><PhotoCredit photo={photo}/></figcaption></figure>
  <div className="section article-layout"><aside className="article-toc"><h2>In this guide</h2>
   <ol><li><a href="#converter">Daily reference rates</a></li><li><a href="#cards">Using cards</a></li><li><a href="#cash">ATMs and cash</a></li><li><a href="#fees">Exchange and tips</a></li><li><a href="#related">Plan your trip</a></li></ol>
   <Link className="textlink" href="/visitor-guides">All visitor tips ↗</Link>
  </aside><article className="article-body" id="money-guide">
   <p className="article-lead">The exchange rate shown by a converter is a reference, not a promise of the amount your bank will charge. Most travel decisions are easier if you think in HUF and compare the actual card or currency-exchange terms.</p>
   <section id="converter"><CurrencyConverter rates={latest?.rates??null} rateDate={latest?.date??null}/>
    <p>Rates source: <a href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">Frankfurter</a>, drawing on official published data. For Hungary-specific reference rates, see the <a href="https://www.mnb.hu/en/arfolyamok" target="_blank" rel="noopener noreferrer">Hungarian National Bank</a>.</p>
   </section>
   <section id="cards"><h2>Can you pay with a credit or debit card?</h2><p>Card payments are common in Budapest hotels, restaurants, museums and larger shops. Small market stalls, public facilities and independent businesses may have different arrangements, so ask before buying. Carry some HUF for places that do not accept cards.</p><p>Contactless cards and phone wallets often work at ordinary terminals, but the shop and your bank determine what is supported. Transport tickets have their own payment and validation rules: see our <Link href="/transportation/tickets-and-passes">Budapest ticket guide</Link>.</p></section>
   <section id="cash"><h2>Where should you get Hungarian forints?</h2><p>For cash withdrawals, check the ATM operator&apos;s and your bank&apos;s displayed fees before confirming. For currency exchanges, compare the amount of HUF you will receive after commission and spread, and use legitimate licensed services. Avoid exchanging money informally with strangers.</p><p>At the <Link href="/attractions/great-market-hall">Great Market Hall</Link> and small shops it is useful to have a little local currency as a backup. A receipt will help if you need to resolve a charge later.</p></section>
   <section id="fees"><h2>Pay in HUF or your home currency?</h2><p>If a terminal or ATM offers to charge you in euros, dollars or Icelandic króna instead of HUF, compare the displayed conversion and fees. Dynamic currency conversion can involve an unfavourable rate. Paying in HUF usually leaves the conversion to your card issuer, but check your card&apos;s foreign transaction fees.</p><p>Restaurant bills may include a service charge; check the itemised bill before choosing an additional tip. A 27% standard Hungarian VAT rate does not mean every item uses the same tax rate. Published prices generally include applicable VAT for consumers.</p></section>
   <section id="related"><h2>Related Budapest guides</h2><div className="related-chips">
     <Link href="/gastronomy/markets-and-street-food">Markets & street food ↗</Link>
     <Link href="/visit/shopping-and-souvenirs">Shopping & souvenirs ↗</Link>
     <Link href="/visit/budapest-card-guide">Is the Budapest Card worth it? ↗</Link>
     <Link href="/transportation/airport-to-city">Airport to city centre ↗</Link>
     <Link href="/visit/visitor-safety-and-essentials">Essential visitor tips ↗</Link>
     <Link href="/guides/budapest-in-3-days">Budapest in 3 days ↗</Link>
     <Link href="/attractions">Explore attractions ↗</Link>
   </div></section>
   <section><h2>Official information</h2><p><a href="https://www.budapestinfo.hu/en/useful-information-3" target="_blank" rel="noopener noreferrer">Budapest Info — visitor essentials</a>, <a href="https://www.mnb.hu/en/arfolyamok" target="_blank" rel="noopener noreferrer">Hungarian National Bank</a> and <a href="https://bkk.hu/en/" target="_blank" rel="noopener noreferrer">BKK transport and ticketing</a>.</p></section>
  </article></div>
  <ContextualTours context={{category:"sightseeing"}} heading="Explore Budapest tours and tickets"/>
  </main><SiteFooter/>
 </>;
}
