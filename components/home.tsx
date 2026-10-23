"use client";
import { useSavedTrip } from "../hooks/use-saved-trip";
import Brand from "./brand";
import { useEffect, useRef, useState } from "react";
import { places, days } from "../lib/content";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GuideCard from "./guide-card";
import { guides } from "../lib/guides";
import PlaceCard from "./place-card";
import TripDialog, { type Modal } from "./trip-dialog";

export default function Home() {
  const router = useRouter();
  const { saved, toggleSave: toggleSaved } = useSavedTrip();

  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [searchText, setSearchText] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [day, setDay] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  function toggleSave(id: string) {
    const had = saved.includes(id);
    toggleSaved(id);
    setToast(had ? "Removed from your trip" : "Saved to your Budapest trip");
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2300);
  }
  function runSearch(text: string) {
    router.push("/attractions?q=" + encodeURIComponent(text.trim()));
  }
  function chooseFilter(value: string) {
    setFilter(value);
    setQuery("");
    setSearchText("");
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
  }
  function openTrip() {
    setModal({ kind: "trip" });
  }
  const matching = places.filter(
    (p) =>
      (filter === "All" || p.category === filter) &&
      (!query ||
        `${p.name} ${p.area} ${p.category} ${p.desc}`
          .toLowerCase()
          .includes(query)),
  );
  const visiblePlaces =
    filter === "All" && !query ? matching.slice(0, 3) : matching;
  return (
    <>
      <a className="skip" href="#explore">
        {"Skip to content"}
      </a>
      <header>
        <Brand />
        <nav
          aria-label="Main navigation"
          className={menuOpen ? "open" : ""}
          onClick={() => setMenuOpen(false)}
        >
          <Link href="/attractions">Attractions</Link>
          <a href="#experiences">{"Experiences"}</a>
          <a href="#neighbourhoods">{"Neighbourhoods"}</a>
          <Link href="/guides">Travel guides</Link>
        </nav>
        <button className="outline mytrip" onClick={openTrip}>
          {"\u2661 \u00a0 My trip "}
          <span id="count">{saved.length}</span>
        </button>
        <button
          className="menu"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {"\u2630"}
        </button>
      </header>
      <main>
        <section className="hero">
          <img
            src="/assets/danube.webp"
            alt="Hungarian Parliament and the Danube seen from the Buda riverbank"
            fetchPriority="high"
          />
          <div className="hero-shade"></div>
          <div className="hero-content">
            <div className="eyebrow">
              <span></span>
              {" TWO SIDES. A THOUSAND DISCOVERIES."}
            </div>
            <h1>
              {"A city worth"}
              <br />
              {"getting "}
              <em>{"lost in."}</em>
            </h1>
            <p>
              {
                "Grand boulevards. Steaming baths. Golden evenings on the Danube."
              }
              <br />
              {"Find your own Budapest, one discovery at a time."}
            </p>
            <form
              id="searchform"
              className="search"
              onSubmit={(e) => {
                e.preventDefault();
                runSearch(searchText);
              }}
            >
              <span aria-hidden="true">{"\u2315"}</span>
              <label className="sr" htmlFor="search">
                {"Search Budapest"}
              </label>
              <input
                id="search"
                placeholder="What would you love to discover?"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <button type="submit">
                {"Explore Budapest "}
                <span>{"\u2197"}</span>
              </button>
            </form>
            <div className="popular">
              {"START WITH "}
              <button onClick={() => runSearch("Castle")} data-search="Castle">
                {"Castle District"}
              </button>
              <button
                onClick={() => chooseFilter("Baths")}
                data-filter-link="Baths"
              >
                {"Thermal baths"}
              </button>
              <button onClick={() => runSearch("Danube")} data-search="Danube">
                {"The Danube"}
              </button>
            </div>
          </div>
          <div className="hero-bottom">
            <span>{"YOUR BUDAPEST STORY STARTS HERE"}</span>
            <span>{"\u2193 \u00a0 Scroll to discover"}</span>
            <span className="photo-label">
              {"\u2316 \u00a0 The Danube \u00b7 Budapest, Hungary"}
            </span>
          </div>
        </section>
        <div className="quicknav">
          <a href="#explore">
            <b>{"\u2316"}</b>
            <span>
              {"Iconic sights"}
              <small>{"The places you came for"}</small>
            </span>
            {"\u2197"}
          </a>
          <a href="#experiences">
            <b>{"\u224b"}</b>
            <span>
              {"Thermal & wellness"}
              <small>{"Slow down, Budapest style"}</small>
            </span>
            {"\u2197"}
          </a>
          <a href="#neighbourhoods">
            <b>{"\u25c7"}</b>
            <span>
              {"Explore the districts"}
              <small>{"Find your side of the city"}</small>
            </span>
            {"\u2197"}
          </a>
          <a href="#planner">
            <b>{"\u25a4"}</b>
            <span>
              {"Build your city break"}
              <small>{"A little planning. More discovery."}</small>
            </span>
            {"\u2197"}
          </a>
        </div>
        <section className="section" id="explore">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{"THE CITY'S GREATEST HITS"}</div>
              <h2>{"First time? Start here."}</h2>
              <p>{"Meet the landmarks that make Budapest, Budapest."}</p>
            </div>
            <a href="#experiences" className="textlink">
              {"Find your experience \u2197"}
            </a>
          </div>
          <div className="filters" aria-label="Filter places">
            <button
              onClick={() => chooseFilter("All")}
              className={filter === "All" ? "active" : ""}
              data-filter="All"
            >
              {"All discoveries"}
            </button>
            <button
              onClick={() => chooseFilter("Landmarks")}
              className={filter === "Landmarks" ? "active" : ""}
              data-filter="Landmarks"
            >
              {"Landmarks"}
            </button>
            <button
              onClick={() => chooseFilter("Views")}
              className={filter === "Views" ? "active" : ""}
              data-filter="Views"
            >
              {"City views"}
            </button>
            <button
              onClick={() => chooseFilter("Baths")}
              className={filter === "Baths" ? "active" : ""}
              data-filter="Baths"
            >
              {"Thermal baths"}
            </button>
            <button
              onClick={() => chooseFilter("Culture")}
              className={filter === "Culture" ? "active" : ""}
              data-filter="Culture"
            >
              {"Culture"}
            </button>
            <span id="resultcount">
              {visiblePlaces.length}{" "}
              {visiblePlaces.length === 1 ? "discovery" : "discoveries"}
            </span>
          </div>
          <div id="places" className="cards">
            {visiblePlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                saved={saved.includes(place.id)}
                onSave={() => toggleSave(place.id)}
                onOpen={() => setModal({ kind: "place", id: place.id })}
              />
            ))}
          </div>
          <p id="empty" hidden={visiblePlaces.length > 0}>
            No discoveries found. Try “Danube”, “Castle” or choose another
            category.
          </p>
        </section>
        <section className="experience section" id="experiences">
          <div className="experience-art">
            <img
              src="/assets/city.webp"
              loading="lazy"
              alt="Budapest's bridges crossing the Danube, with Buda on the left and Pest on the right"
            />
            <span className="image-note">{"A DIFFERENT PERSPECTIVE"}</span>
          </div>
          <div className="experience-copy">
            <div className="eyebrow">
              {"LESS TICKING BOXES. MORE FEELING IT."}
            </div>
            <h2>
              {"Make time for"}
              <br />
              {"the "}
              <em>{"good stuff."}</em>
            </h2>
            <p>
              {
                "Take the scenic route along the river. Leave an afternoon for the baths. Stay out for one more view of the city lights."
              }
            </p>
            <button
              className="experience-row"
              onClick={() => setModal({ kind: "experience", id: "river" })}
            >
              <span>{"01"}</span>
              <div>
                <h3>{"The Danube, at your pace"}</h3>
                <p>{"Riverside walks & a city seen from the water"}</p>
              </div>
              {"\u2197"}
            </button>
            <button
              className="experience-row"
              onClick={() => setModal({ kind: "experience", id: "bath" })}
            >
              <span>{"02"}</span>
              <div>
                <h3>{"Soak up the city"}</h3>
                <p>{"Find your thermal-bath ritual"}</p>
              </div>
              {"\u2197"}
            </button>
            <button
              className="experience-row"
              onClick={() => setModal({ kind: "experience", id: "food" })}
            >
              <span>{"03"}</span>
              <div>
                <h3>{"A taste of Budapest"}</h3>
                <p>{"Market mornings, caf\u00e9s & Hungarian flavours"}</p>
              </div>
              {"\u2197"}
            </button>
          </div>
        </section>
        <section className="section" id="neighbourhoods">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{"ONE CITY. MANY PERSONALITIES."}</div>
              <h2>{"Find your neighbourhood."}</h2>
            </div>
            <p>{"Cross the river. Change the scenery."}</p>
          </div>
          <div className="districts">
            <button
              onClick={() => setModal({ kind: "district", id: "buda" })}
              className="district"
            >
              <img
                src="/assets/budapest.webp"
                loading="lazy"
                alt="Matthias Church and Fisherman's Bastion"
              />
              <div>
                <small>{"HISTORIC \u00b7 HILLY \u00b7 SCENIC"}</small>
                <h3>{"The Castle District"}</h3>
                <p>{"Storybook streets above the Danube."}</p>
              </div>
              <span>{"\u2197"}</span>
            </button>
            <button
              onClick={() => setModal({ kind: "district", id: "pest" })}
              className="district"
            >
              <img
                src="/assets/danube.webp"
                loading="lazy"
                alt="The Parliament building on the Pest riverbank"
              />
              <div>
                <small>{"GRAND \u00b7 WALKABLE \u00b7 RIVERSIDE"}</small>
                <h3>{"Downtown Pest"}</h3>
                <p>{"Boulevards, architecture & caf\u00e9 stops."}</p>
              </div>
              <span>{"\u2197"}</span>
            </button>
          </div>
        </section>
        <section className="planner section" id="planner">
          <div>
            <div className="eyebrow">{"YOUR TIME. YOUR BUDAPEST."}</div>
            <h2>
              {"A city break,"}
              <br />
              <em>{"made yours."}</em>
            </h2>
            <p>
              {
                "A starting point for three memorable days. Save the places that catch your eye and keep your own list in My trip."
              }
            </p>
            <button className="primary" onClick={openTrip}>
              {"Build my Budapest trip \u00a0 \u2197"}
            </button>
            <small className="muted">
              {"Your saved places stay in this browser."}
            </small>
          </div>
          <div className="itinerary">
            <div className="daytabs" role="tablist" aria-label="Itinerary days">
              <button
                role="tab"
                onClick={() => setDay(0)}
                id="day-0"
                aria-selected={day === 0}
                aria-controls="daycontent"
                data-day="0"
              >
                {"Day 01"}
              </button>
              <button
                role="tab"
                onClick={() => setDay(1)}
                id="day-1"
                aria-selected={day === 1}
                aria-controls="daycontent"
                data-day="1"
              >
                {"Day 02"}
              </button>
              <button
                role="tab"
                onClick={() => setDay(2)}
                id="day-2"
                aria-selected={day === 2}
                aria-controls="daycontent"
                data-day="2"
              >
                {"Day 03"}
              </button>
            </div>
            <div id="daycontent" role="tabpanel" aria-labelledby={`day-${day}`}>
              <h3>{days[day][0]}</h3>
              {days[day][1].map((stop, i) => (
                <div className="stop" key={stop[0]}>
                  <span>0{i + 1}</span>
                  <div>
                    <div className="eyebrow text-[8px] mb-1">{stop[0]}</div>
                    <b>{stop[1]}</b>
                    <p>{stop[2]}</p>
                  </div>
                </div>
              ))}
            </div>
            <small>{"A suggested route \u2014 adjust it to your pace."}</small>
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
              All travel guides ↗
            </Link>
          </div>
          <div className="cards">
            {[
              guides[0],
              guides.find((g) => g.slug === "danube-cruises")!,
              guides.find((g) => g.slug === "budapest-bars-nightlife")!,
            ].map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </section>
        <section className="section essentials" id="guide">
          <div className="eyebrow">{"A LITTLE KNOW-HOW GOES A LONG WAY"}</div>
          <h2>{"Before you go."}</h2>
          <div className="essentials-grid">
            <article>
              <span>{"01 / TRANSPORT"}</span>
              <h3>{"Getting around"}</h3>
              <p>
                {
                  "Explore on foot and connect neighbourhoods by metro, tram and bus. Check current tickets and routes with BKK."
                }
              </p>
              <a href="https://bkk.hu/en/" target="_blank" rel="noopener">
                {"Official transport information \u2197"}
              </a>
            </article>
            <article>
              <span>{"02 / CITY BASICS"}</span>
              <h3>{"Keep it practical"}</h3>
              <p>
                {
                  "Hungary uses the Hungarian forint (HUF). Save your accommodation address and carry comfortable shoes for Buda's hills."
                }
              </p>
              <button
                onClick={() => setModal({ kind: "experience", id: "basics" })}
              >
                {"Read the essentials \u2197"}
              </button>
            </article>
            <article>
              <span>{"03 / PLAN AHEAD"}</span>
              <h3>{"Leave room to wander"}</h3>
              <p>
                {
                  "Check each venue's current opening hours, admission rules and availability before you visit."
                }
              </p>
              <a
                href="https://www.budapestinfo.hu/en"
                target="_blank"
                rel="noopener"
              >
                {"Budapest's official visitor guide \u2197"}
              </a>
            </article>
          </div>
        </section>
        <section className="closing">
          <img
            src="/assets/city.webp"
            loading="lazy"
            alt="Panoramic view across Budapest"
          />
          <div>
            <div className="eyebrow">{"SOME CITIES STAY WITH YOU."}</div>
            <h2>{"Budapest is one of them."}</h2>
            <a href="#explore" className="primary">
              {"Find your first discovery \u2197"}
            </a>
          </div>
        </section>
      </main>
      <footer>
        <Brand footer />
        <p>
          {"Your next city story."}
          <br />
          {"A sister site of "}
          <a href="https://www.goicetravel.is" target="_blank" rel="noopener">
            {"GoIceTravel \u2197"}
          </a>
        </p>
        <div>
          <Link href="/attractions">Attractions</Link>
          <Link href="/guides">Travel guides</Link>
          <a href="#planner">{"Plan your trip"}</a>
          <button onClick={() => setModal({ kind: "privacy" })}>
            {"Privacy"}
          </button>
        </div>
        <small>
          {"\u00a9 2026 GoToBudapest \u00b7 Made for curious travellers."}
        </small>
      </footer>
      <TripDialog
        modal={modal}
        setModal={setModal}
        saved={saved}
        toggleSave={toggleSave}
      />
      <div
        id="toast"
        role="status"
        style={{ display: toast ? "block" : "none" }}
      >
        {toast}
      </div>
    </>
  );
}
