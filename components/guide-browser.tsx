"use client";
import { useState } from "react";
import type { GuideSummary } from "@/lib/summary";
import GuideCard from "./guide-card";
export default function GuideBrowser({ guides }: { guides: GuideSummary[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(guides.map((g) => g.category))];
  const filtered = guides.filter(
    (g) =>
      (category === "All" || g.category === category) &&
      `${g.title} ${g.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <label htmlFor="guide-search" className="search-label">
        Find your next read
      </label>
      <input
        className="catalog-search"
        id="guide-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search guides, baths, cruises…"
      />
      <div className="filters">
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? "active" : ""}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <p role="status" className="catalog-count">
        {filtered.length} {filtered.length === 1 ? "guide" : "guides"}
      </p>
      <div className="cards">
        {filtered.map((g) => (
          <GuideCard key={g.slug} guide={g} />
        ))}
      </div>
      {!filtered.length ? (
        <p>No guides match your search. Try a different topic.</p>
      ) : null}
    </>
  );
}
