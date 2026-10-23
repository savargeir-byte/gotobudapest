"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { attractions } from "../lib/attractions";
import { useSavedTrip } from "../hooks/use-saved-trip";
export default function AttractionBrowser() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState("All");
  const [limit, setLimit] = useState(24);
  const [sort, setSort] = useState("curated");
  const { saved, toggleSave } = useSavedTrip();
  let filtered = attractions.filter(
    (a) =>
      (category === "All" || a.category === category) &&
      `${a.name} ${a.category} ${a.description} ${a.address || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (sort === "az")
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  const categories = ["All", ...new Set(attractions.map((a) => a.category))];
  return (
    <>
      <label htmlFor="attraction-search" className="search-label">
        Search 100 places
      </label>
      <div className="catalog-tools">
        <input
          id="attraction-search"
          type="search"
          className="catalog-search"
          placeholder="Search landmarks, museums, parks…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(24);
          }}
        />
        <label className="sr" htmlFor="attraction-sort">
          Sort places
        </label>
        <select
          id="attraction-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="curated">Editorial order</option>
          <option value="az">Name: A–Z</option>
        </select>
      </div>
      <div className="filters" aria-label="Filter attractions">
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? "active" : ""}
            aria-pressed={category === c}
            onClick={() => {
              setCategory(c);
              setLimit(24);
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="catalog-count" role="status">
        {filtered.length} {filtered.length === 1 ? "place" : "places"} · Showing{" "}
        {Math.min(limit, filtered.length)}
      </p>
      <div className="attraction-grid">
        {filtered.slice(0, limit).map((a) => (
          <article className="attraction-card" key={a.id}>
            <div className="flex justify-between items-center">
              <span className="number">{a.category.toUpperCase()}</span>
              <button
                className="catalog-save"
                aria-label={`${saved.includes(a.id) ? "Remove" : "Save"} ${a.name}`}
                aria-pressed={saved.includes(a.id)}
                onClick={() => toggleSave(a.id)}
              >
                {saved.includes(a.id) ? "♥" : "♡"}
              </button>
            </div>
            <h2>
              <Link href={`/attractions/${a.slug}`}>{a.name}</Link>
            </h2>
            {a.status ? <div className="tagline">{a.status}</div> : null}
            <p>{a.description}</p>
            <Link className="textlink" href={`/attractions/${a.slug}`}>
              Explore this place ↗
            </Link>
          </article>
        ))}
      </div>
      {!filtered.length ? (
        <p>No places match your search. Try another name or category.</p>
      ) : null}
      {filtered.length > limit ? (
        <button
          className="primary loadmore"
          onClick={() => setLimit((current) => current + 24)}
        >
          Show more places ({filtered.length - limit} remaining) ↓
        </button>
      ) : null}
    </>
  );
}
