"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics/client";

export default function HeroSearch() {
  const router = useRouter();
  const [text, setText] = useState("");
  return (
    <form
      id="searchform"
      className="search"
      onSubmit={(e) => {
        e.preventDefault();
        // Only whether something was typed, never the words themselves.
        track("site_search", { search_scope: "home", has_query: text.trim().length > 0 });
        router.push(text.trim() ? "/tours?q=" + encodeURIComponent(text.trim()) : "/tours");
      }}
    >
      <span aria-hidden="true">{"⌕"}</span>
      <label className="sr" htmlFor="search">
        Search Budapest tours
      </label>
      <input
        id="search"
        placeholder="Search cruises, baths, sightseeing tours…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">
        Find tours <span>{"↗"}</span>
      </button>
    </form>
  );
}
