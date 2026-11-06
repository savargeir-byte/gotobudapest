// Google Analytics 4 runtime with Google Consent Mode v2, "basic" flavour: the Google tag is NOT loaded (no
// request to Google at all) until the visitor has granted analytics consent. Before that, and after withdrawal,
// nothing is sent and nothing is queued, so an event can never be delivered retroactively.
//
// The environment (window, document, script loader) is injected, so the logic is unit tested without a browser.

import {
  DENIED_SIGNALS,
  isGoogleOptionalCookie,
  type ConsentChoices,
  type GoogleConsentSignals,
} from "../consent/consent";
import { sanitizeParams, type EventMap, type EventName } from "./events";

// The measurement ID is configuration (NEXT_PUBLIC_GA_MEASUREMENT_ID), never hard-coded. Anything that does not
// look like a GA4 ID disables the tag.
export function validGaId(raw: string | undefined): string | undefined {
  const id = raw?.trim();
  return id && /^G-[A-Z0-9]{4,14}$/.test(id) ? id : undefined;
}

type GtagWindow = {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean | undefined;
};
type GaDoc = {
  cookie: string;
  referrer?: string;
  location: { hostname: string; protocol: string; host?: string; pathname?: string };
};

export type GaEnv = {
  win: GtagWindow;
  doc: GaDoc;
  loadScript: (src: string) => void;
};

export function createGa(id: string | undefined, env: GaEnv) {
  const measurementId = validGaId(id);
  let loaded = false;
  let enabled = false;
  let lastPage = "";

  // GA4 adds the full page URL and the referrer to every event on its own. Both can carry what a visitor typed into a
  // search box (/attractions?q=..., /tours?q=...), so the tag is told the address WITHOUT query string or fragment.
  function pageAddress(): { page_location: string; page_referrer: string } | undefined {
    const l = env.doc.location;
    if (!l.host || l.pathname === undefined) return undefined;
    let referrer = "";
    try {
      if (env.doc.referrer) {
        const r = new URL(env.doc.referrer);
        referrer = r.origin + r.pathname;
      }
    } catch {
      referrer = "";
    }
    return { page_location: `${l.protocol}//${l.host}${l.pathname}`, page_referrer: referrer };
  }
  function syncPage(gtag: (...args: unknown[]) => void) {
    const page = pageAddress();
    if (!page) return;
    const key = page.page_location + "|" + page.page_referrer;
    if (key === lastPage) return;
    lastPage = key;
    gtag("set", page);
  }

  function ensureGtag() {
    env.win.dataLayer = env.win.dataLayer ?? [];
    if (!env.win.gtag) {
      // Google's tag reads the `arguments` object itself from the data layer, so a rest-parameter array does not work.
      env.win.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        env.win.dataLayer!.push(arguments);
      };
    }
    return env.win.gtag;
  }

  function removeOptionalCookies() {
    const host = env.doc.location.hostname;
    const labels = host.split(".");
    const domains = ["", host, ...labels.slice(1, -1).map((_, i) => "." + labels.slice(i + 1).join("."))];
    for (const part of env.doc.cookie.split(";")) {
      const name = part.split("=")[0].trim();
      if (!name || !isGoogleOptionalCookie(name)) continue;
      for (const domain of domains)
        env.doc.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ""}`;
    }
  }

  return {
    configured: Boolean(measurementId),
    isEnabled: () => enabled,

    /** Apply the visitor's choices. Loads the tag only for analytics consent; withdraws and cleans up otherwise. */
    apply(choices: ConsentChoices, signals: GoogleConsentSignals) {
      if (!choices.analytics) {
        // Cleanup does not depend on a configured ID: Google cookies left by an earlier visit or ID go as well.
        if (measurementId && loaded) {
          env.win[`ga-disable-${measurementId}`] = true;
          ensureGtag()("consent", "update", { ...DENIED_SIGNALS, ...signals });
        }
        enabled = false;
        removeOptionalCookies();
        return;
      }
      if (!measurementId) return;
      const gtag = ensureGtag();
      env.win[`ga-disable-${measurementId}`] = false;
      if (!loaded) {
        gtag("consent", "default", DENIED_SIGNALS);
        gtag("consent", "update", signals);
        gtag("js", new Date());
        syncPage(gtag);
        gtag("config", measurementId, {
          send_page_view: false, // page views are sent by us, once per route
          // No advertising product is used: Google signals and ad personalisation stay off whatever the marketing choice.
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          cookie_flags: "SameSite=Lax;Secure",
        });
        env.loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`);
        loaded = true;
      } else {
        gtag("consent", "update", signals);
        gtag("set", { allow_google_signals: false, allow_ad_personalization_signals: false });
      }
      enabled = true;
    },

    /** Sends one event if, and only if, analytics consent is currently granted. Returns whether it was sent. */
    send<E extends EventName>(name: E, params: EventMap[E]): boolean {
      if (!measurementId || !enabled) return false;
      const clean = sanitizeParams(name, params);
      if (!clean) return false;
      const gtag = ensureGtag();
      syncPage(gtag);
      gtag("event", name, clean);
      return true;
    },
  };
}
