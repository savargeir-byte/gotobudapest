// Cookie consent: the pure part (no DOM, no React), so it can be unit tested.
//
// Four categories. Strictly necessary storage needs no consent and is always on. Analytics, functional
// personalisation and marketing are OFF until the visitor opts in, and every visitor, wherever they are,
// gets the same opt-in rules (EEA, UK, Switzerland and everyone else), which is the strictest common case.
//
// The visitor's choice is kept in one first-party cookie. It is the consent evidence: policy version,
// the four choices and the time of the choice. It holds no identifier and nothing that could single a
// visitor out, and it expires after CONSENT_MAX_AGE_DAYS so the question is asked again.

export const CONSENT_COOKIE = "gtb_consent";
export const CONSENT_MAX_AGE_DAYS = 180;
// Bump when the categories, the tools behind them or the privacy text change in a way that needs a new decision.
export const POLICY_VERSION = "2026-11-05";

export type ConsentCategory = "necessary" | "analytics" | "functional" | "marketing";
export const OPTIONAL_CATEGORIES = ["analytics", "functional", "marketing"] as const;
export type OptionalCategory = (typeof OPTIONAL_CATEGORIES)[number];

export type ConsentChoices = { necessary: true; analytics: boolean; functional: boolean; marketing: boolean };
export type ConsentRecord = { policy: string; choices: ConsentChoices; decidedAt: string };

export const ALL_DENIED: ConsentChoices = { necessary: true, analytics: false, functional: false, marketing: false };
export const ALL_GRANTED: ConsentChoices = { necessary: true, analytics: true, functional: true, marketing: true };

export function makeRecord(choices: Partial<Omit<ConsentChoices, "necessary">>, now: Date = new Date()): ConsentRecord {
  return {
    policy: POLICY_VERSION,
    choices: {
      necessary: true,
      analytics: choices.analytics === true,
      functional: choices.functional === true,
      marketing: choices.marketing === true,
    },
    decidedAt: now.toISOString(),
  };
}

// Compact and human readable: p=<policy>&a=0|1&f=0|1&m=0|1&t=<ISO time>
export function serializeRecord(r: ConsentRecord): string {
  const bit = (b: boolean) => (b ? "1" : "0");
  const c = r.choices;
  return `p=${r.policy}&a=${bit(c.analytics)}&f=${bit(c.functional)}&m=${bit(c.marketing)}&t=${r.decidedAt}`;
}

// Anything unreadable, from another policy version, from the future or older than the retention period is
// treated as "no choice yet", so a stale or tampered cookie can never grant consent.
export function parseRecord(raw: string | null | undefined, now: Date = new Date()): ConsentRecord | null {
  if (!raw) return null;
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(raw);
  } catch {
    return null;
  }
  const flag = (k: string) => {
    const v = params.get(k);
    return v === "1" ? true : v === "0" ? false : null;
  };
  const a = flag("a");
  const f = flag("f");
  const m = flag("m");
  const policy = params.get("p");
  const decidedAt = params.get("t") ?? "";
  if (a === null || f === null || m === null || policy !== POLICY_VERSION) return null;
  const when = Date.parse(decidedAt);
  if (!Number.isFinite(when) || when > now.getTime() + 60_000) return null;
  if (now.getTime() - when > CONSENT_MAX_AGE_DAYS * 86_400_000) return null;
  return { policy, choices: { necessary: true, analytics: a, functional: f, marketing: m }, decidedAt: new Date(when).toISOString() };
}

export function cookieHeaderValue(r: ConsentRecord, secure: boolean): string {
  const maxAge = CONSENT_MAX_AGE_DAYS * 86_400;
  return `${CONSENT_COOKIE}=${encodeURIComponent(serializeRecord(r))}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function readFromCookieString(cookies: string, now: Date = new Date()): ConsentRecord | null {
  for (const part of cookies.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() !== CONSENT_COOKIE) continue;
    try {
      return parseRecord(decodeURIComponent(part.slice(i + 1).trim()), now);
    } catch {
      return null;
    }
  }
  return null;
}

// Google Consent Mode v2 signals for a set of choices. Everything stays "denied" until the visitor opts in;
// security_storage is strictly necessary. Advertising signals follow ONLY the marketing choice, analytics
// storage ONLY the analytics choice, and functionality/personalisation ONLY the functional choice.
export type GoogleConsentSignals = Record<
  | "ad_storage"
  | "ad_user_data"
  | "ad_personalization"
  | "analytics_storage"
  | "functionality_storage"
  | "personalization_storage"
  | "security_storage",
  "granted" | "denied"
>;

export function googleSignals(c: ConsentChoices): GoogleConsentSignals {
  const g = (b: boolean) => (b ? "granted" : "denied");
  return {
    // No advertising tag or product exists, so these stay denied whatever the marketing choice: nothing sets
    // advertising cookies and nothing is shared for advertising.
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: g(c.analytics),
    functionality_storage: g(c.functional),
    personalization_storage: g(c.functional),
    security_storage: "granted",
  };
}

export const DENIED_SIGNALS: GoogleConsentSignals = googleSignals(ALL_DENIED);

// Cookies that Google tags may leave on our domain. Withdrawal removes them. (Names, not values: nothing is read.)
export function isGoogleOptionalCookie(name: string): boolean {
  return /^(_ga|_gid|_gat|_gcl_|_gac_|_gads|_gpi|FPAU|FPLC)/.test(name) || /^_ga_[A-Z0-9]+$/.test(name);
}
