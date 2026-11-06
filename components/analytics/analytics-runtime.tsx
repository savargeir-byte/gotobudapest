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
    else if (kind.type === "tour")
      trackOnce(key, "tour_detail_view", { provider: kind.provider, product_id: `${kind.provider}:${kind.id}`, page_path: path });
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
        if (provider && product) track("tour_card_click", { provider, product_id: product, placement: placementFor(path, card) });
        return;
      }
      const page = classifyPath(path);
      if (page.type !== "tour") return;
      const product_id = `${page.provider}:${page.id}`;
      if (target?.closest('[data-analytics="availability_check"]')) {
        track("availability_check", { provider: page.provider, product_id });
        return;
      }
      // A click on a link to the provider. It is a hand-off, never a booking.
      if (target?.closest('a[rel~="sponsored"]')) {
        track("affiliate_link_click", { provider: page.provider, product_id, placement: "product_page" });
        track("provider_handoff", { provider: page.provider, product_id, placement: "product_page" });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [ready, analytics]);

  // Vercel Web Analytics: mounted only with analytics consent; beforeSend re-checks live, so a withdrawal
  // stops events immediately without a reload.
  return analytics ? <VercelAnalytics beforeSend={(e) => (currentChoices().analytics ? { ...e, url: stripQueryAndHash(e.url) } : null)} /> : null;
}
