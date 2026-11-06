"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "../marketplace.css";
import ProductCard from "./ProductCard";
import { contextQuery, relevantProducts, seeAllHref, type AreaFallback, type TourContext } from "@/lib/marketplace/context";
import type { MarketplaceProduct, MarketplaceResult } from "@/lib/marketplace/types";
import { apiUrl } from "@/lib/marketplace/ui";

// A compact row of live Budapest products on an editorial page (attraction, experience,
// neighbourhood, guide). It asks the same marketplace API as /tours once the row scrolls
// near the viewport (so static pages never fan out to the providers at build time), keeps
// only products that genuinely match the page context, and renders no product row when there
// are none (just one plain catalogue link, so the visitor is never stranded): it never falls
// back to unrelated results. Cards link to our product pages only.
export default function ContextualTours({
  context,
  heading,
  description = "Live Budapest products from our booking partners. Open one for details and availability.",
  max = 6,
  fallback,
  compact = false,
}: {
  context: TourContext;
  heading: string;
  description?: string;
  max?: number;
  // Used only when no product matches `context`: a clearly labelled row for the wider category.
  fallback?: AreaFallback;
  // Narrow single-column variant for the reading-page side rail.
  compact?: boolean;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState<MarketplaceProduct[]>([]);
  // True once the lazy lookup has finished (or failed): an empty result then still leaves the visitor a way to the catalogue.
  const [settled, setSettled] = useState(false);
  // What the row currently shows: the page's own context, or the wider-category fallback.
  const [shown, setShown] = useState<{ context: TourContext; heading: string; description: string }>({ context, heading, description });

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
    const load = (ctx: TourContext, limit: number) =>
      fetch(apiUrl(contextQuery(ctx)), { signal: controller.signal, headers: { Accept: "application/json" } })
        .then((r) => (r.ok ? (r.json() as Promise<MarketplaceResult>) : Promise.reject(new Error(String(r.status)))))
        .then((body) => (Array.isArray(body?.items) ? relevantProducts(body.items, ctx, limit) : []));
    load(context, max)
      .then(async (found) => {
        if (controller.signal.aborted) return;
        if (found.length || !fallback) {
          setShown({ context, heading, description });
          setItems(found);
          setSettled(true);
          return;
        }
        const wider = await load(fallback.context, Math.min(max, 4));
        if (controller.signal.aborted) return;
        setShown({ context: fallback.context, heading: fallback.heading, description: fallback.description });
        setItems(wider);
        setSettled(true);
      })
      .catch(() => {
        // A failing catalogue shows no product row, but the plain catalogue link below stays available.
        if (!controller.signal.aborted) setSettled(true);
      });
    return () => controller.abort();
  }, [started, context, max, fallback, heading, description]);

  return (
    <div ref={sentinel} data-testid="contextual-tours" className={compact ? "mk-context-rail" : undefined}>
      {items.length ? (
        <section className="section mk-context" aria-label={shown.heading}>
          <div className="section-heading">
            <div>
              <div className="eyebrow">BOOKABLE BUDAPEST</div>
              <h2>{shown.heading}</h2>
              <p>{shown.description}</p>
            </div>
            <Link className="textlink" href={seeAllHref(shown.context)}>
              See all tours ↗
            </Link>
          </div>
          <ul className="mk-grid">
            {items.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} compact rail={compact} />
              </li>
            ))}
          </ul>
          <p className="mk-context-foot">
            Prices are supplier-provided indicators; availability and final prices depend on your date and
            group. Booking is completed with the provider.
          </p>
        </section>
      ) : settled ? (
        <p className="mk-context-empty">
          <Link className="textlink" href={seeAllHref(context)}>
            Browse Budapest tours and tickets ↗
          </Link>
        </p>
      ) : null}
    </div>
  );
}
