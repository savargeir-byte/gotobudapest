"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ga, track, trackOnce } from "@/lib/analytics/client";
import { classifyPath, cleanPath, type Placement, type Provider } from "@/lib/analytics/events";
import { ALL_DENIED, googleSignals } from "@/lib/consent/consent";
import { currentChoices, useConsent } from "@/lib/consent/store";

// Connects consent to the analytics tools. Without analytics consent this component renders nothing, loads
// nothing and sends nothing; after withdrawal the Google tag is disabled and its cookies are removed.

const asProvider = (v: string | null | undefined): Provider | undefined => (v === "viator" || v === "tiqets" ? v : undefined);

function placementFor(path: string, el: Element): Placement {
  if (el.closest('[data-testid="contextual-tours"]')) {
    if (path === "/") return "home_row";
    if (path.startsWith("/attractions/")) return "attraction_page";
    if (path.startsWith("/experiences/")) return "experience_page";
    return "contextual_row";
  }
  return path === "/tours" ? "marketplace_grid" : "other";
}

// The card click that led to the product page being viewed, kept in memory only (a client-side navigation keeps it; a
// reload or a direct landing does not, and nothing is written to the browser). It lets a hand-off be tied to the page and
// placement the card was clicked on. It is never a booking.
let lastCardClick: { productId: string; placement: Placement; path: string } | undefined;
const origin = (productId: string) =>
  lastCardClick && lastCardClick.productId === productId ? { from_placement: lastCardClick.placement, from_path: lastCardClick.path } : {};

// At most this many card impressions per page view, so a long result list cannot flood the analytics property.
const MAX_IMPRESSIONS_PER_PAGE = 24;

// Vercel reports the full address; a typed search (?q=) must not leave the browser, so query string and fragment go.
function stripQueryAndHash(url: string): string {
  const cut = url.search(/[?#]/);
  return cut === -1 ? url : url.slice(0, cut);
}

export default function AnalyticsRuntime() {
  const { ready, record, lastAction } = useConsent();
  const pathname = usePathname();
  const visit = useRef(0);
  const choices = record?.choices ?? ALL_DENIED;
  const { analytics, functional, marketing } = choices;

  // 1. Consent -> tools. Declared first so it runs before the page-view effect in the same commit.
  useEffect(() => {
    if (!ready) return;
    ga.apply({ necessary: true, analytics, functional, marketing }, googleSignals({ necessary: true, analytics, functional, marketing }));
    // Recorded only when analytics is allowed at that moment: a refusal or withdrawal is never reported.
    if (analytics && lastAction && record) {
      const grant = (b: boolean) => (b ? "granted" : "denied");
      trackOnce(record.decidedAt, "cookie_consent_update", {
        consent_action: lastAction,
        analytics: "granted",
        functional: grant(functional),
        marketing: grant(marketing),
      });
    }
  }, [ready, analytics, functional, marketing, lastAction, record]);

  // 2. One page view per route (plus the typed view event), only with analytics consent.
  useEffect(() => {
    visit.current += 1;
  }, [pathname]);
  useEffect(() => {
    if (!ready || !analytics) return;
    const path = cleanPath(pathname);
    if (!path) return;
    const key = `${path}#${visit.current}`;
    const kind = classifyPath(path);
    trackOnce(key, "page_view", { page_path: path, content_category: kind.type === "other" ? kind.category : kind.type });
    if (kind.type === "attraction") trackOnce(key, "attraction_view", { attraction_slug: kind.slug, page_path: path });
    else if (kind.type === "guide") trackOnce(key, "guide_view", { guide_slug: kind.slug, page_path: path });
    else if (kind.type === "experience") trackOnce(key, "experience_view", { experience_slug: kind.slug, page_path: path });
    else if (kind.type === "tour") {
      const product_id = `${kind.provider}:${kind.id}`;
      trackOnce(key, "tour_detail_view", { provider: kind.provider, product_id, page_path: path, ...origin(product_id) });
    }
  }, [ready, analytics, pathname]);

  // 2b. Card impressions: a product card counts once per page view when at least half of it has been on screen.
  useEffect(() => {
    if (!ready || !analytics || typeof IntersectionObserver === "undefined") return;
    const path = cleanPath(pathname);
    if (!path) return;
    const pageKey = `${path}#${visit.current}`;
    let sent = 0;
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const card = entry.target as HTMLElement;
          if (!entry.isIntersecting || sent >= MAX_IMPRESSIONS_PER_PAGE) continue;
          const provider = asProvider(card.dataset.provider);
          const product = card.dataset.product;
          if (!provider || !product) continue;
          const placement = placementFor(path, card);
          if (trackOnce(`${pageKey}:${placement}:${product}`, "tour_card_impression", { provider, product_id: product, placement, page_path: path })) sent += 1;
          io.unobserve(card);
        }
      },
      { threshold: 0.5 },
    );
    const watch = () => {
      for (const card of document.querySelectorAll<HTMLElement>(".mk-card[data-product]")) {
        if (!seen.has(card)) {
          seen.add(card);
          io.observe(card);
        }
      }
    };
    watch();
    // Cards are loaded client-side (and more are added by "Load more"): pick up the new ones as they appear.
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [ready, analytics, pathname]);

  // 3. Clicks, observed once at the document: tour cards, availability checks and links that leave for a provider.
  useEffect(() => {
    if (!ready || !analytics) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const path = cleanPath(window.location.pathname) ?? "/";
      const card = target?.closest("a.mk-cta")?.closest<HTMLElement>(".mk-card");
      if (card) {
        const provider = asProvider(card.dataset.provider);
        const product = card.dataset.product;
        if (provider && product) {
          const placement = placementFor(path, card);
          lastCardClick = { productId: product, placement, path };
          track("tour_card_click", { provider, product_id: product, placement, page_path: path });
        }
        return;
      }
      const page = classifyPath(path);
      if (page.type !== "tour") return;
      const product_id = `${page.provider}:${page.id}`;
      if (target?.closest('[data-analytics="availability_check"]')) {
        track("availability_check", { provider: page.provider, product_id, ...origin(product_id) });
        return;
      }
      // A click on a link to the provider. It is a hand-off, never a booking.
      if (target?.closest('a[rel~="sponsored"]')) {
        track("affiliate_link_click", { provider: page.provider, product_id, placement: "product_page", ...origin(product_id) });
        track("provider_handoff", { provider: page.provider, product_id, placement: "product_page", ...origin(product_id) });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [ready, analytics]);

  // Vercel Web Analytics: mounted only with analytics consent; beforeSend re-checks live, so a withdrawal
  // stops events immediately without a reload.
  return analytics ? <VercelAnalytics beforeSend={(e) => (currentChoices().analytics ? { ...e, url: stripQueryAndHash(e.url) } : null)} /> : null;
}
