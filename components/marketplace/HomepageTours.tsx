"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { HOMEPAGE_CATEGORIES, selectHomepageProducts } from "@/lib/marketplace/homepage";
import { apiUrl } from "@/lib/marketplace/ui";
import type { MarketplaceProduct, MarketplaceResult } from "@/lib/marketplace/types";
import "../marketplace.css";

// Commercial discovery is deliberately immediately after the hero, not below
// the dozens of editorial neighbourhoods. One existing marketplace API call
// powers the real product cards; no mocked supplier offers, dates or prices.
export default function HomepageTours() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    fetch(apiUrl({ sort: "relevance" }), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((response) => response.ok ? response.json() as Promise<MarketplaceResult> : Promise.reject(new Error("Catalogue unavailable")))
      .then((result) => {
        if (mounted && !controller.signal.aborted && Array.isArray(result?.items)) {
          setProducts(selectHomepageProducts(result.items));
        }
      })
      .catch(() => {
        // The catalogue has its own server-side per-provider fallbacks.
        // Even if it is down, visitors can always reach the search and categories.
      })
      .finally(() => {
        clearTimeout(timeout);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <section className="section home-tours" id="book-tours" aria-label="Book Budapest tours and tickets" data-testid="homepage-tours">
      <div className="section-heading">
        <div>
          <div className="eyebrow">BOOK YOUR BUDAPEST EXPERIENCE</div>
          <h2>Featured tours <em>&amp; tickets.</em></h2>
          <p>Choose from real Danube cruises, thermal baths, guided tours and attraction tickets. Compare prices supplied by our booking partners.</p>
        </div>
        <Link href="/tours" className="textlink">See all Budapest tours ↗</Link>
      </div>

      {loading ? (
        <div className="home-tours-loading" role="status" aria-label="Loading Budapest tours">
          <p>Finding bookable Budapest experiences…</p>
          <div className="home-tours-skeletons" aria-hidden="true">
            {[0, 1, 2].map((i) => <div key={i} className="mk-skel"><i className="mk-skel-img" /><div className="mk-skel-body"><i className="mk-skel-line" /><i className="mk-skel-line short" /><i className="mk-skel-line" /></div></div>)}
          </div>
        </div>
      ) : products.length ? (
        <>
          <ul className="mk-grid home-tours-grid" aria-label="Featured Budapest experiences">
            {products.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} priority={index < 3} ctaLabel="Check availability" />
              </li>
            ))}
          </ul>
          <p className="home-tour-disclosure">Prices are supplied by booking partners. Dates, availability and final prices are confirmed by the provider.</p>
        </>
      ) : (
        <div className="home-tour-fallback" role="status">
          <p>The featured selection is temporarily unavailable. You can still browse the full tour catalogue or choose a category above.</p>
          <Link href="/tours" className="textlink">Browse Budapest tours and tickets ↗</Link>
        </div>
      )}
      <nav aria-label="Browse Budapest tour categories" className="home-tour-categories">
        {HOMEPAGE_CATEGORIES.map((category) => (
          <Link key={category.key} href={"/tours?category=" + category.key}>{category.label} ↗</Link>
        ))}
      </nav>
      <div className="home-tour-bottom">
        <Link href="/tours" className="primary">Explore all tours &amp; tickets ↗</Link>
        <p>Choose your experience here, then check dates and complete booking with the supplier.</p>
      </div>
    </section>
  );
}
