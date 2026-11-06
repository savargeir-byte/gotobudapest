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
        router.push("/attractions?q=" + encodeURIComponent(text.trim()));
      }}
    >
      <span aria-hidden="true">{"⌕"}</span>
      <label className="sr" htmlFor="search">
        Search Budapest
      </label>
      <input
        id="search"
        placeholder="What would you love to discover?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">
        Explore Budapest <span>{"↗"}</span>
      </button>
    </form>
  );
}
