"use client";
import Brand from "./brand";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  // Escape closes the open phone menu and puts focus back on the button that opened it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <header>
      <Brand />
      <nav
        aria-label="Main navigation"
        className={open ? "open" : ""}
        onClick={() => setOpen(false)}
      >
        <Link href="/attractions">Attractions</Link>
        <Link href="/experiences">Experiences</Link>
        <Link href="/tours">Tours & Tickets</Link>
        <Link href="/neighbourhoods">Neighbourhoods</Link>
        <Link href="/guides">Travel guides</Link>
      </nav>
      <Link className="outline header-cta" href="/plan">
        Plan your visit ↗
      </Link>
      <button
        ref={toggle}
        className="menu"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true">☰</span>
      </button>
    </header>
  );
}
