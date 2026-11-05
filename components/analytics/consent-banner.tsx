"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  classifyAffiliateLink, CONSENT_STORAGE_KEY, readConsent, revokeAnalytics, saveConsent,
  startAnalytics, trackEvent, trackPageView,
} from "@/lib/analytics/tracking";

const getChoice = (): boolean | null => readConsent()?.analytics ?? null;
const getServerChoice = (): undefined => undefined;
const subscribeChoice = (callback: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("gtb:consent-updated", callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("gtb:consent-updated", callback);
  };
};

export default function ConsentBanner() {
  // SSR renders no banner. The client takes its first stable snapshot after hydration.
  const choice = useSyncExternalStore(subscribeChoice, getChoice, getServerChoice);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analyticsSelected, setAnalyticsSelected] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
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
    window.dispatchEvent(new Event("gtb:consent-updated"));
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
