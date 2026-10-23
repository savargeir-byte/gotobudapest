"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Brand from "./brand";
import GuideCard from "./guide-card";
import { guides } from "../lib/guides";

const featured = [
 { title:"Fisherman's Bastion",area:"CASTLE DISTRICT · BUDA",description:"Fairytale towers, panoramic terraces and a timeless view of the Pest skyline.",image:"budapest.webp",href:"/attractions/fishermans-bastion",tag:"THE CLASSIC VIEW"},
 { title:"Hungarian Parliament",area:"DANUBE RIVERSIDE · PEST",description:"One of the city's defining landmarks, best appreciated from both banks of the river.",image:"danube.webp",href:"/attractions/hungarian-parliament",tag:"A BUDAPEST ICON"},
 { title:"The Danube",area:"BUDA & PEST",description:"A city of two banks, connected by bridges and the changing light on the water.",image:"city.webp",href:"/experiences/danube",tag:"FIND YOUR PERSPECTIVE"}
];
export default function Home(){
 const router=useRouter();
 const [search,setSearch]=useState("");
 const [menuOpen,setMenuOpen]=useState(false);
 function runSearch(value:string){router.push("/attractions?q="+encodeURIComponent(value.trim()));}
 const featuredGuides=["buda-castle-district","downtown-pest-walking-guide","danube-cruises"].map(slug=>guides.find(guide=>guide.slug===slug)).filter(guide=>guide!==undefined);
 return <>
 <a className="skip" href="#explore">Skip to content</a>
 <header>
  <Brand/>
  <nav aria-label="Main navigation" className={menuOpen?"open":""} onClick={()=>setMenuOpen(false)}>
   <Link href="/attractions">Attractions</Link><Link href="/experiences">Experiences</Link><Link href="/neighbourhoods">Neighbourhoods</Link><Link href="/guides">Travel guides</Link>
  </nav>
  <Link className="outline mytrip" href="/essentials">Travel essentials ↗</Link>
  <button className="menu" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}>☰</button>
 </header>
 <main>
  <section className="hero">
   <Image src="/assets/danube.webp" alt="Hungarian Parliament beside the Danube in Budapest" fill priority sizes="100vw" style={{objectFit:"cover",objectPosition:"center 61%"}} />
   <div className="hero-shade" />
   <div className="hero-content">
    <div className="eyebrow"><span/>TWO SIDES. A THOUSAND DISCOVERIES.</div>
    <h1>A city worth<br/>getting <em>lost in.</em></h1>
    <p>Grand boulevards. Steaming baths. Golden evenings on the Danube.<br/>Find your own Budapest, one discovery at a time.</p>
    <form className="search" onSubmit={event=>{event.preventDefault();runSearch(search);}}>
     <span aria-hidden="true">⌕</span><label className="sr" htmlFor="home-search">Search Budapest</label>
     <input id="home-search" placeholder="What would you love to discover?" value={search} onChange={event=>setSearch(event.target.value)}/>
     <button type="submit">Explore Budapest ↗</button>
    </form>
    <div className="popular">START WITH
     <Link className="popular-link" href="/neighbourhoods/castle-district">Castle District</Link>
     <Link className="popular-link" href="/experiences/thermal-baths">Thermal baths</Link>
     <Link className="popular-link" href="/experiences/danube">The Danube</Link>
    </div>
   </div>
   <div className="hero-bottom"><span>YOUR BUDAPEST STORY STARTS HERE</span><span>↓ Scroll to discover</span><span className="photo-label">⌖ The Danube · Budapest, Hungary</span></div>
  </section>
  <div className="quicknav">
   <Link href="/attractions"><b>⌖</b><span>Iconic sights<small>100 places to discover</small></span>↗</Link>
   <Link href="/experiences"><b>≋</b><span>Budapest experiences<small>River, baths & local flavours</small></span>↗</Link>
   <Link href="/neighbourhoods"><b>◇</b><span>Explore the districts<small>Both sides of Budapest</small></span>↗</Link>
   <Link href="/guides"><b>▤</b><span>Travel guides<small>Know a little, see a lot</small></span>↗</Link>
  </div>
  <section className="section" id="explore">
   <div className="section-heading"><div><div className="eyebrow">THE CITY'S GREATEST HITS</div><h2>First time? Start here.</h2><p>Meet the landmarks that make Budapest, Budapest.</p></div><Link href="/attractions" className="textlink">See all 100 attractions ↗</Link></div>
   <div className="cards">
    {featured.map(place=><article key={place.href} className="card">
     <Link href={place.href} className="card-img home-photo-link">
      <Image src={`/assets/${place.image}`} alt={place.title} fill sizes="(max-width:760px) 90vw, 30vw"/>
      <span className="tag">{place.tag}</span>
     </Link>
     <div className="card-body"><small>{place.area}</small><h3><Link href={place.href}>{place.title}</Link></h3><p>{place.description}</p><Link className="textlink" href={place.href}>Discover ↗</Link></div>
    </article>)}
   </div>
  </section>
  <section className="experience section" id="experiences">
   <div className="experience-art"><Image src="/assets/city.webp" alt="Budapest's bridges across the Danube" fill sizes="(max-width:760px) 100vw, 44vw" style={{objectFit:"cover"}}/><span className="image-note">A DIFFERENT PERSPECTIVE</span></div>
   <div className="experience-copy">
    <div className="eyebrow">LESS TICKING BOXES. MORE FEELING IT.</div>
    <h2>Make time for<br/>the <em>good stuff.</em></h2>
    <p>Take the scenic route along the river. Leave an afternoon for the baths. Stay out for one more view of the city lights.</p>
    <Link className="experience-row" href="/experiences/danube"><span>01</span><div><h3>The Danube, at your pace</h3><p>Riverside walks and a city seen from the water</p></div>↗</Link>
    <Link className="experience-row" href="/experiences/thermal-baths"><span>02</span><div><h3>Soak up the city</h3><p>Find your thermal-bath ritual</p></div>↗</Link>
    <Link className="experience-row" href="/experiences/food-and-markets"><span>03</span><div><h3>A taste of Budapest</h3><p>Market mornings, cafés and Hungarian flavours</p></div>↗</Link>
    <Link className="textlink" href="/experiences">Explore all experiences ↗</Link>
   </div>
  </section>
  <section className="section" id="neighbourhoods">
   <div className="section-heading"><div><div className="eyebrow">ONE CITY. MANY PERSONALITIES.</div><h2>Find your neighbourhood.</h2></div><Link href="/neighbourhoods" className="textlink">Explore both sides ↗</Link></div>
   <div className="districts">
    <Link href="/neighbourhoods/castle-district" className="district"><Image src="/assets/budapest.webp" alt="Matthias Church and Fisherman's Bastion on Buda Castle Hill" fill sizes="(max-width:760px) 100vw, 44vw" style={{objectFit:"cover"}}/><div><small>HISTORIC · HILLY · SCENIC</small><h3>The Castle District</h3><p>Storybook streets above the Danube.</p></div><span>↗</span></Link>
    <Link href="/neighbourhoods/downtown-pest" className="district"><Image src="/assets/danube.webp" alt="Hungarian Parliament on the Pest riverbank" fill sizes="(max-width:760px) 100vw, 44vw" style={{objectFit:"cover"}}/><div><small>GRAND · WALKABLE · RIVERSIDE</small><h3>Downtown Pest</h3><p>Architecture, riverside walks and café stops.</p></div><span>↗</span></Link>
   </div>
  </section>
  <section className="section" id="travel-guides">
   <div className="section-heading"><div><div className="eyebrow">THE BUDAPEST EDIT</div><h2>Your next chapter starts here.</h2><p>Explore the Castle District, walk through Downtown Pest and discover the Danube.</p></div><Link href="/guides" className="textlink">All travel guides ↗</Link></div>
   <div className="cards">{featuredGuides.map(guide=><GuideCard key={guide.slug} guide={guide}/>)}</div>
  </section>
  <section className="section essentials" id="guide">
   <div className="eyebrow">A LITTLE KNOW-HOW GOES A LONG WAY</div><h2>Before you go.</h2>
   <div className="essentials-grid">
    <article><span>01 / TRANSPORT</span><h3>Getting around</h3><p>Explore on foot and connect neighbourhoods with Budapest's metro, tram and bus network.</p><Link href="/guides/getting-around-budapest">Get around with confidence ↗</Link></article>
    <article><span>02 / CITY BASICS</span><h3>Keep it practical</h3><p>Hungary uses the forint (HUF). Keep a little time for the hills and check current venue access.</p><Link href="/essentials">Read the essentials ↗</Link></article>
    <article><span>03 / EXPLORE MORE</span><h3>Pick a neighbourhood</h3><p>From quiet lanes on Castle Hill to the big-city rhythm of Downtown Pest, there is another story around the corner.</p><Link href="/neighbourhoods">Explore neighbourhoods ↗</Link></article>
   </div>
  </section>
  <section className="closing"><Image src="/assets/city.webp" alt="Budapest skyline and Danube" fill sizes="100vw" style={{objectFit:"cover",filter:"brightness(0.32)"}}/><div><div className="eyebrow">SOME CITIES STAY WITH YOU.</div><h2>Budapest is one of them.</h2><Link href="/attractions" className="primary">Find your first discovery ↗</Link></div></section>
 </main>
 <footer>
  <Brand footer/>
  <p>Your next city story.<br/>A sister site of{" "}<a href="https://goicetravel.is" target="_blank" rel="noopener noreferrer">GoIceTravel ↗</a></p>
  <div><Link href="/attractions">Attractions</Link><Link href="/experiences">Experiences</Link><Link href="/neighbourhoods">Neighbourhoods</Link><Link href="/guides">Guides</Link><Link href="/essentials">Essentials</Link><Link href="/privacy">Privacy</Link></div>
  <small>© 2026 GoToBudapest · Made for curious travellers.</small>
 </footer>
 </>;
}
