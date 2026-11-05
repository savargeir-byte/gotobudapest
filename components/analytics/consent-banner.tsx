"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  classifyAffiliateLink, readConsent, revokeAnalytics, saveConsent,
  startAnalytics, trackEvent, trackPageView,
} from "@/lib/analytics/tracking";

export default function ConsentBanner() {
  // undefined = not hydrated yet; null = no saved choice.
  const [choice, setChoice] = useState<boolean | null | undefined>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analyticsSelected, setAnalyticsSelected] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const current = readConsent();
    setChoice(current?.analytics ?? null);
    setAnalyticsSelected(current?.analytics ?? false);
    const show = () => {
      setCustomizing(false);
      setAnalyticsSelected(readConsent()?.analytics ?? false);
      setSettingsOpen(true);
    };
    const sync = (e: StorageEvent) => {
      if (e.key !== "gtb-cookie-consent-v1") return;
      const next = readConsent();
      if (window.__gtbAnalyticsStarted && !next?.analytics) {
        revokeAnalytics(); // another tab withdrew consent
        return;
      }
      setChoice(next?.analytics ?? null);
    };
    window.addEventListener("gtb:open-cookie-settings", show);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gtb:open-cookie-settings", show);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (choice !== true) return;
    startAnalytics();
    trackPageView();
  }, [choice, pathname]);

  useEffect(() => {
    if (choice !== true) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const provider = classifyAffiliateLink(anchor.href);
      if (provider) {
        trackEvent("provider_handoff", {
          provider,
          page_path: window.location.pathname,
        });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [choice]);

  const decide = (allow: boolean) => {
    saveConsent(allow);
    setChoice(allow);
    setAnalyticsSelected(allow);
    setSettingsOpen(false);
    setCustomizing(false);
    if (!allow) revokeAnalytics();
  };

  if (choice === undefined || (choice !== null && !settingsOpen)) return null;

  return (
    <section className="gtb-cookie" aria-label="Cookie preferences" data-testid="cookie-consent">
      <div className="gtb-cookie__intro">
        <strong>{settingsOpen ? "Your cookie preferences" : "Your privacy matters"}</strong>
        <p>
          Essential site functions work without tracking. With your permission,
          we use Google Analytics to understand which Budapest places and guides
          people find useful. You can reject optional analytics or change your
          choice any time. See our <Link href="/privacy#cookies">cookie information</Link>.
        </p>
      </div>
      {customizing ? (
        <div className="gtb-cookie__settings">
          <label><input type="checkbox" checked disabled /> Strictly necessary (always on)</label>
          <label>
            <input type="checkbox" checked={analyticsSelected}
              onChange={(e) => setAnalyticsSelected(e.target.checked)} />
            Optional analytics (Google Analytics 4)
          </label>
          <p>No advertising or remarketing cookies are currently enabled.</p>
        </div>
      ) : null}
      <div className="gtb-cookie__actions">
        <button className="gtb-cookie__decision" type="button" onClick={() => decide(false)}>
          Reject optional
        </button>
        <button className="gtb-cookie__decision" type="button" onClick={() => decide(true)}>
          Allow analytics
        </button>
        {customizing ? (
          <button type="button" className="gtb-cookie__secondary" onClick={() => decide(analyticsSelected)}>
            Save choices
          </button>
        ) : (
          <button type="button" className="gtb-cookie__secondary" onClick={() => setCustomizing(true)}>
            Manage preferences
          </button>
        )}
        {settingsOpen && choice !== null ? (
          <button type="button" className="gtb-cookie__secondary" onClick={() => setSettingsOpen(false)}>
            Close
          </button>
        ) : null}
      </div>
    </section>
  );
}
