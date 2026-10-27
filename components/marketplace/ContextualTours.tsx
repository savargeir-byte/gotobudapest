"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "../marketplace.css";
import ProductCard from "./ProductCard";
import { contextQuery, relevantProducts, seeAllHref, type TourContext } from "@/lib/marketplace/context";
import type { MarketplaceProduct, MarketplaceResult } from "@/lib/marketplace/types";
import { apiUrl } from "@/lib/marketplace/ui";

// A compact row of live Budapest products on an editorial page (attraction, experience,
// neighbourhood, guide). It asks the same marketplace API as /tours once the row scrolls
// near the viewport (so static pages never fan out to the providers at build time), keeps
// only products that genuinely match the page context, and renders NOTHING when there are
// none: it never falls back to unrelated results. Cards link to our product pages only.
export default function ContextualTours({
  context,
  heading,
  description = "Live Budapest products from our booking partners. Open one for details and availability.",
  max = 6,
}: {
  context: TourContext;
  heading: string;
  description?: string;
  max?: number;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState<MarketplaceProduct[]>([]);

  useEffect(() => {
    if (started) return;
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // No observer support: load immediately.
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const controller = new AbortController();
    fetch(apiUrl(contextQuery(context)), { signal: controller.signal, headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? (r.json() as Promise<MarketplaceResult>) : Promise.reject(new Error(String(r.status)))))
      .then((body) => {
        if (controller.signal.aborted || !Array.isArray(body?.items)) return;
        setItems(relevantProducts(body.items, context, max));
      })
      .catch(() => {
        /* a failing catalogue simply shows no row */
      });
    return () => controller.abort();
  }, [started, context, max]);

  return (
    <div ref={sentinel} data-testid="contextual-tours">
      {items.length ? (
        <section className="section mk-context" aria-label={heading}>
          <div className="section-heading">
            <div>
              <div className="eyebrow">BOOKABLE BUDAPEST</div>
              <h2>{heading}</h2>
              <p>{description}</p>
            </div>
            <Link className="textlink" href={seeAllHref(context)}>
              See all tours ↗
            </Link>
          </div>
          <ul className="mk-grid">
            {items.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} compact />
              </li>
            ))}
          </ul>
          <p className="mk-context-foot">
            Prices are supplier-provided indicators; availability and final prices depend on your date and
            group. Booking is completed with the provider.
          </p>
        </section>
      ) : null}
    </div>
  );
}
