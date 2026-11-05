// Google Analytics is strictly opt-in. Do not import this from server components.
export const GA4_MEASUREMENT_ID = "G-GCVBYQPJ9W";
export const CONSENT_STORAGE_KEY = "gtb-cookie-consent-v1";
const CONSENT_VERSION = 1;
const CONSENT_DAYS = 180;

export type ConsentChoice = { version: number; analytics: boolean; decidedAt: string; expiresAt: number };

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    __gtbAnalyticsStarted?: boolean;
  }
}

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as ConsentChoice;
    if (c.version !== CONSENT_VERSION || typeof c.analytics !== "boolean" ||
        typeof c.expiresAt !== "number" || Date.now() >= c.expiresAt) {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }
    return c;
  } catch {
    return null; // storage may be unavailable; ask for consent on this visit
  }
}

export function saveConsent(analytics: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      version: CONSENT_VERSION,
      analytics,
      decidedAt: new Date().toISOString(),
      expiresAt: Date.now() + CONSENT_DAYS * 86400_000,
    } satisfies ConsentChoice));
  } catch {
    // Consent still applies for this page view even when localStorage is blocked.
  }
}

export function startAnalytics(): void {
  if (typeof window === "undefined" || window.__gtbAnalyticsStarted) return;
  window.__gtbAnalyticsStarted = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => { window.dataLayer?.push(args); };

  // Basic Consent Mode: this is called ONLY after opt-in. No Google tag or ping
  // is downloaded or sent before consent.
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    personalization_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  });
  window.gtag("consent", "update", { analytics_storage: "granted" });
  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: 15552000, // six months, not Google's longer default
    cookie_flags: "SameSite=Lax;Secure",
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  script.dataset.gtbAnalytics = "true";
  document.head.appendChild(script);
}

export function trackEvent(eventName: string, params: Record<string, string | number | boolean> = {}): void {
  if (typeof window === "undefined" || !window.__gtbAnalyticsStarted) return;
  window.gtag?.("event", eventName, { ...params, transport_type: "beacon" });
}

export function trackPageView(): void {
  if (typeof window === "undefined" || !window.__gtbAnalyticsStarted) return;
  // Deliberately omit query strings: users may put private text into searches.
  const pagePath = window.location.pathname;
  trackEvent("page_view", {
    page_location: window.location.origin + pagePath,
    page_path: pagePath,
    page_title: document.title,
  });
  if (/^\/tours\/[^/]+\//.test(pagePath)) trackEvent("tour_detail_view", { page_path: pagePath });
}

function expireCookie(name: string, domain?: string): void {
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax; Secure${domain ? `; Domain=${domain}` : ""}`;
}

export function revokeAnalytics(): void {
  if (typeof window === "undefined") return;
  const hadTag = !!window.__gtbAnalyticsStarted;
  if (hadTag) window.gtag?.("consent", "update", { analytics_storage: "denied" });
  const names = document.cookie.split(";").map((part) => part.trim().split("=")[0]);
  for (const name of names) {
    if (!/^_ga(?:_|$)/.test(name)) continue;
    expireCookie(name);
    if (window.location.hostname === "gotobuda.com" || window.location.hostname.endsWith(".gotobuda.com")) {
      expireCookie(name, "gotobuda.com");
    }
  }
  // Remove the already-loaded tag and any queued events by starting a clean
  // no-analytics page. A denied visitor never loads the tag on that page.
  if (hadTag) window.location.reload();
}

export function classifyAffiliateLink(href: string): "viator" | "tiqets" | null {
  try {
    const host = new URL(href).hostname.toLowerCase();
    if (host === "viator.com" || host.endsWith(".viator.com")) return "viator";
    if (host === "tiqets.com" || host.endsWith(".tiqets.com")) return "tiqets";
  } catch {
    return null;
  }
  return null;
}
