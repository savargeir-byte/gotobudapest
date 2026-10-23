"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { attractions } from "../lib/attractions";
import AttractionCard from "./attraction-card";
export default function AttractionBrowser() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState("All");
  const [limit, setLimit] = useState(24);
  const [sort, setSort] = useState("curated");
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
      <div className="cards">
        {filtered.slice(0, limit).map((a, i) => (
          <AttractionCard key={a.id} attraction={a} priority={i < 3} />
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
