"use client";
import Brand from "./brand";
import Link from "next/link";
import { useState } from "react";
export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header>
      <Brand />
      <nav
        aria-label="Main navigation"
        className={open ? "open" : ""}
        onClick={() => setOpen(false)}
      >
        <Link href="/attractions">Attractions</Link>
        <Link href="/guides">Travel guides</Link>
        <Link href="/guides/danube-cruises">Danube cruises</Link>
        <Link href="/guides/budapest-bars-nightlife">Bars & nightlife</Link>
      </nav>
      <Link className="outline mytrip" href="/#planner">
        Plan my trip ↗
      </Link>
      <button
        className="menu"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>
    </header>
  );
}
