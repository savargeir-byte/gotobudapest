// Typed, privacy-safe analytics events. Pure (no DOM): parameters are allow-listed and sanitised here, so
// nothing a visitor typed and nothing that identifies them can reach an analytics tool.
//
// Rules this module enforces:
//  * only the parameters listed per event are sent, with the types listed;
//  * strings are short and limited to slug-like characters (no free text, no addresses, no e-mail);
//  * page paths are sent without query string or fragment (search words live in the query string);
//  * a view fires once per page view, a click at most once per short interval (no double firing);
//  * an affiliate hand-off is a CLICK on a link to the provider. It is never a booking. Confirmed bookings
//    and commission are not tracked here: they need verified provider conversion data (docs/ANALYTICS.md).

export type Provider = "viator" | "tiqets";
export type Placement =
  | "marketplace_grid"
  | "contextual_row"
  | "home_row"
  | "attraction_page"
  | "experience_page"
  | "product_page"
  | "other";

export type EventMap = {
  page_view: { page_path: string; content_category: string };
  attraction_view: { attraction_slug: string; page_path: string };
  guide_view: { guide_slug: string; page_path: string };
  experience_view: { experience_slug: string; page_path: string };
  site_search: { search_scope: "home" | "attractions"; has_query: boolean };
  marketplace_search: { provider: Provider | "all"; search_category: string; sort: string; has_query: boolean };
  tour_card_click: { provider: Provider; product_id: string; placement: Placement };
  tour_detail_view: { provider: Provider; product_id: string; page_path: string };
  availability_check: { provider: Provider; product_id: string };
  provider_handoff: { provider: Provider; product_id: string; placement: Placement };
  affiliate_link_click: { provider: Provider; product_id: string; placement: Placement };
  cookie_consent_update: {
    consent_action: "accept_all" | "reject_all" | "custom" | "withdraw";
    analytics: "granted" | "denied";
    functional: "granted" | "denied";
    marketing: "granted" | "denied";
  };
};
export type EventName = keyof EventMap;

export const EVENT_NAMES = [
  "page_view",
  "attraction_view",
  "guide_view",
  "experience_view",
  "site_search",
  "marketplace_search",
  "tour_card_click",
  "tour_detail_view",
  "availability_check",
  "provider_handoff",
  "affiliate_link_click",
  "cookie_consent_update",
] as const satisfies readonly EventName[];

const SAFE_TOKEN = /^[A-Za-z0-9_\-:.]{1,80}$/;
const SAFE_PATH = /^\/[A-Za-z0-9_\-./]{0,120}$/;

/** A path without query string or fragment, or undefined if it does not look like one of ours. */
export function cleanPath(input: string | undefined): string | undefined {
  if (!input) return undefined;
  const path = input.split("#")[0].split("?")[0];
  const trimmed = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return SAFE_PATH.test(trimmed) ? trimmed : undefined;
}

type Kind = "token" | "path" | "boolean" | "enum";
const ENUM_PROVIDER = ["viator", "tiqets"];
const SCHEMA: { [E in EventName]: Record<keyof EventMap[E], { kind: Kind; values?: string[]; optional?: boolean }> } = {
  page_view: { page_path: { kind: "path" }, content_category: { kind: "token" } },
  attraction_view: { attraction_slug: { kind: "token" }, page_path: { kind: "path" } },
  guide_view: { guide_slug: { kind: "token" }, page_path: { kind: "path" } },
  experience_view: { experience_slug: { kind: "token" }, page_path: { kind: "path" } },
  site_search: { search_scope: { kind: "enum", values: ["home", "attractions"] }, has_query: { kind: "boolean" } },
  marketplace_search: {
    provider: { kind: "enum", values: [...ENUM_PROVIDER, "all"] },
    search_category: { kind: "token" },
    sort: { kind: "token" },
    has_query: { kind: "boolean" },
  },
  tour_card_click: { provider: { kind: "enum", values: ENUM_PROVIDER }, product_id: { kind: "token" }, placement: { kind: "token" } },
  tour_detail_view: { provider: { kind: "enum", values: ENUM_PROVIDER }, product_id: { kind: "token" }, page_path: { kind: "path" } },
  availability_check: { provider: { kind: "enum", values: ENUM_PROVIDER }, product_id: { kind: "token" } },
  provider_handoff: { provider: { kind: "enum", values: ENUM_PROVIDER }, product_id: { kind: "token" }, placement: { kind: "token" } },
  affiliate_link_click: { provider: { kind: "enum", values: ENUM_PROVIDER }, product_id: { kind: "token" }, placement: { kind: "token" } },
  cookie_consent_update: {
    consent_action: { kind: "enum", values: ["accept_all", "reject_all", "custom", "withdraw"] },
    analytics: { kind: "enum", values: ["granted", "denied"] },
    functional: { kind: "enum", values: ["granted", "denied"] },
    marketing: { kind: "enum", values: ["granted", "denied"] },
  },
};

export type Sanitized = Record<string, string | boolean>;

/**
 * Returns the allow-listed, validated parameters, or null when any required parameter is missing or invalid.
 * An event that cannot be sent cleanly is dropped rather than sent with a guess.
 */
export function sanitizeParams<E extends EventName>(name: E, params: EventMap[E]): Sanitized | null {
  const schema = SCHEMA[name] as Record<string, { kind: Kind; values?: string[] }>;
  const input = params as Record<string, unknown>;
  const out: Sanitized = {};
  for (const [key, rule] of Object.entries(schema)) {
    const value = input[key];
    if (rule.kind === "boolean") {
      if (typeof value !== "boolean") return null;
      out[key] = value;
    } else if (rule.kind === "path") {
      const p = typeof value === "string" ? cleanPath(value) : undefined;
      if (!p) return null;
      out[key] = p;
    } else {
      if (typeof value !== "string" || !SAFE_TOKEN.test(value)) return null;
      if (rule.kind === "enum" && !rule.values?.includes(value)) return null;
      out[key] = value;
    }
  }
  return out;
}

/** Deduplication: a key fires once; a click key fires at most once per interval. */
export function createDeduper(now: () => number = () => Date.now()) {
  const seen = new Map<string, number>();
  return {
    once(key: string): boolean {
      if (seen.has(key)) return false;
      seen.set(key, now());
      return true;
    },
    within(key: string, ms: number): boolean {
      const t = now();
      const last = seen.get(key);
      if (last !== undefined && t - last < ms) return false;
      seen.set(key, t);
      return true;
    },
    reset() {
      seen.clear();
    },
  };
}

/** What the current path is, for page_view and the per-type view events. */
export type PageKind =
  | { type: "attraction" | "guide" | "experience"; slug: string }
  | { type: "tour"; provider: Provider; id: string }
  | { type: "other"; category: string };

export function classifyPath(rawPath: string): PageKind {
  const path = cleanPath(rawPath) ?? "/";
  const seg = path.split("/").filter(Boolean);
  const [a, b, c] = seg;
  if (a === "attractions" && b && seg.length === 2) return { type: "attraction", slug: b };
  if (a === "guides" && b && seg.length === 2) return { type: "guide", slug: b };
  if (a === "experiences" && b && seg.length === 2) return { type: "experience", slug: b };
  if (a === "tours" && (b === "viator" || b === "tiqets") && c && seg.length === 3) return { type: "tour", provider: b, id: c };
  return { type: "other", category: a ?? "home" };
}
