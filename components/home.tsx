import Image from "next/image";
import Link from "next/link";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import HeroSearch from "./hero-search";
import AttractionCard from "./attraction-card";
import GuideCard from "./guide-card";
import { attractionsBySlug } from "../lib/attractions";
import { getGuide } from "../lib/guides";

const featured = attractionsBySlug([
  "hungarian-parliament",
  "fishermans-bastion",
  "szechenyi-thermal-bath",
  "matthias-church",
  "chain-bridge",
  "great-market-hall",
]);
const featuredGuides = [
  "budapest-in-3-days",
  "danube-cruises",
  "budapest-bars-nightlife",
]
  .map(getGuide)
  .filter((g) => g !== undefined);

export default function Home() {
  return (
    <>
      <a className="skip" href="#explore">
        Skip to content
      </a>
      <SiteHeader />
      <main>
        <section className="hero">
          <Image
            src="/assets/danube.webp"
            alt="Hungarian Parliament and the Danube seen from the Buda riverbank"
            fill
            sizes="100vw"
            priority
          />
          <div className="hero-shade"></div>
          <div className="hero-content">
            <div className="eyebrow">
              <span></span>
              {" TWO SIDES. A THOUSAND DISCOVERIES."}
            </div>
            <h1>
              A city worth
              <br />
              getting <em>lost in.</em>
            </h1>
            <p>
              Grand boulevards. Steaming baths. Golden evenings on the Danube.{" "}
              <br />
              Find your own Budapest, one discovery at a time.
            </p>
            <HeroSearch />
            <div className="popular">
              START WITH{" "}
              <Link href="/neighbourhoods/castle-district">Castle District</Link>
              <Link href="/experiences/thermal-baths">Thermal baths</Link>
              <Link href="/experiences/danube">The Danube</Link>
            </div>
          </div>
          <div className="hero-bottom">
            <span>YOUR BUDAPEST STORY STARTS HERE</span>
            <span>{"↓   Scroll to discover"}</span>
            <span className="photo-label">
              {"⌖   The Danube · Budapest, Hungary"}
            </span>
          </div>
        </section>
        <div className="quicknav">
          <Link href="/attractions">
            <b>{"⌖"}</b>
            <span>
              Iconic sights
              <small>The places you came for</small>
            </span>
            {"↗"}
          </Link>
          <Link href="/experiences/thermal-baths">
            <b>{"≋"}</b>
            <span>
              Thermal & wellness
              <small>Slow down, Budapest style</small>
            </span>
            {"↗"}
          </Link>
          <Link href="/neighbourhoods">
            <b>{"◇"}</b>
            <span>
              Explore the districts
              <small>Find your side of the city</small>
            </span>
            {"↗"}
          </Link>
          <Link href="/guides">
            <b>{"▤"}</b>
            <span>
              Read the guides
              <small>Local know-how, step by step</small>
            </span>
            {"↗"}
          </Link>
        </div>
        <section className="section" id="explore">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE CITY&apos;S GREATEST HITS</div>
              <h2>First time? Start here.</h2>
              <p>Meet the landmarks that make Budapest, Budapest.</p>
            </div>
            <Link href="/attractions" className="textlink">
              Explore all 100 places {"↗"}
            </Link>
          </div>
          <div className="cards">
            {featured.map((a) => (
              <AttractionCard key={a.id} attraction={a} />
            ))}
          </div>
        </section>
        <section className="experience section" id="experiences">
          <div className="experience-art">
            <Image
              src="/assets/city.webp"
              fill
              sizes="(max-width:760px) 92vw, 45vw"
              alt="Budapest's bridges crossing the Danube, with Buda on the left and Pest on the right"
            />
            <span className="image-note">A DIFFERENT PERSPECTIVE</span>
          </div>
          <div className="experience-copy">
            <div className="eyebrow">LESS TICKING BOXES. MORE FEELING IT.</div>
            <h2>
              Make time for
              <br />
              the <em>good stuff.</em>
            </h2>
            <p>
              Take the scenic route along the river. Leave an afternoon for the
              baths. Stay out for one more view of the city lights.
            </p>
            <Link className="experience-row" href="/experiences/danube">
              <span>01</span>
              <div>
                <h3>The Danube, at your pace</h3>
                <p>Riverside walks & a city seen from the water</p>
              </div>
              {"↗"}
            </Link>
            <Link className="experience-row" href="/experiences/thermal-baths">
              <span>02</span>
              <div>
                <h3>Soak up the city</h3>
                <p>Find your thermal-bath ritual</p>
              </div>
              {"↗"}
            </Link>
            <Link
              className="experience-row"
              href="/experiences/food-and-markets"
            >
              <span>03</span>
              <div>
                <h3>A taste of Budapest</h3>
                <p>Market mornings, caf{"é"}s & Hungarian flavours</p>
              </div>
              {"↗"}
            </Link>
          </div>
        </section>
        <section className="section" id="neighbourhoods">
          <div className="section-heading">
            <div>
              <div className="eyebrow">ONE CITY. MANY PERSONALITIES.</div>
              <h2>Find your neighbourhood.</h2>
            </div>
            <p>Cross the river. Change the scenery.</p>
          </div>
          <div className="districts">
            <Link href="/neighbourhoods/castle-district" className="district">
              <Image
                src="/assets/budapest.webp"
                fill
                sizes="(max-width:760px) 92vw, 45vw"
                alt="Matthias Church and Fisherman's Bastion"
              />
              <div>
                <small>HISTORIC {"·"} HILLY {"·"} SCENIC</small>
                <h3>The Castle District</h3>
                <p>Storybook streets above the Danube.</p>
              </div>
              <span>{"↗"}</span>
            </Link>
            <Link href="/neighbourhoods/downtown-pest" className="district">
              <Image
                src="/assets/danube.webp"
                fill
                sizes="(max-width:760px) 92vw, 45vw"
                alt="The Parliament building on the Pest riverbank"
              />
              <div>
                <small>GRAND {"·"} WALKABLE {"·"} RIVERSIDE</small>
                <h3>Downtown Pest</h3>
                <p>Boulevards, architecture & caf{"é"} stops.</p>
              </div>
              <span>{"↗"}</span>
            </Link>
          </div>
        </section>
        <section className="section" id="travel-guides">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE BUDAPEST EDIT</div>
              <h2>Your next chapter starts here.</h2>
              <p>From a first city break to an evening on the Danube.</p>
            </div>
            <Link href="/guides" className="textlink">
              All travel guides {"↗"}
            </Link>
          </div>
          <div className="cards">
            {featuredGuides.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </section>
        <section className="section essentials" id="guide">
          <div className="eyebrow">A LITTLE KNOW-HOW GOES A LONG WAY</div>
          <h2>Before you go.</h2>
          <div className="essentials-grid">
            <article>
              <span>01 / TRANSPORT</span>
              <h3>Getting around</h3>
              <p>
                Explore on foot and connect neighbourhoods by metro, tram and
                bus. Check current tickets and routes with BKK.
              </p>
              <Link href="/guides/getting-around-budapest">
                Read the transport guide {"↗"}
              </Link>
            </article>
            <article>
              <span>02 / CITY BASICS</span>
              <h3>Keep it practical</h3>
              <p>
                Hungary uses the Hungarian forint (HUF). Save your accommodation
                address and carry comfortable shoes for Buda&apos;s hills.
              </p>
              <Link href="/essentials">Read the essentials {"↗"}</Link>
            </article>
            <article>
              <span>03 / CHECK AHEAD</span>
              <h3>Leave room to wander</h3>
              <p>
                Check each venue&apos;s current opening hours, admission rules
                and availability before you visit.
              </p>
              <a
                href="https://www.budapestinfo.hu/en"
                target="_blank"
                rel="noopener noreferrer"
              >
                Budapest&apos;s official visitor guide {"↗"}
              </a>
            </article>
          </div>
        </section>
        <section className="closing">
          <Image
            src="/assets/city.webp"
            fill
            sizes="100vw"
            alt="Panoramic view across Budapest"
          />
          <div>
            <div className="eyebrow">SOME CITIES STAY WITH YOU.</div>
            <h2>Budapest is one of them.</h2>
            <Link href="/attractions" className="primary">
              Find your first discovery {"↗"}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
