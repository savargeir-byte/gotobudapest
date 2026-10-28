import { PROVIDERS, type MarketplaceQuery, type Provider } from "./types";
import { toSearchParams } from "./query";
import { shortHash } from "./util";

// Opaque pagination cursor: per-provider positions, exhausted providers and a bounded
// set of canonical-title hashes already shown (cross-page dedupe). It is NOT a secret
// and not signed: it only carries paging state, every value is validated against a
// strict schema and clamped, and it is bound to the query it was issued for, so a
// cursor replayed against another query (or edited into another shape) is rejected.
export type CursorState = {
  p: Partial<Record<Provider, number>>;
  d: Provider[];
  s: string[]; // canonical hashes, newest last (max SEEN_MAX)
};

export const SEEN_MAX = 150;
const MAX_POSITION: Record<Provider, number> = { viator: 100000, tiqets: 5000, tourdesk: 5000 };

export class InvalidCursorError extends Error {
  constructor() {
    super("invalid cursor");
  }
}

export const queryHash = (q: MarketplaceQuery) =>
  shortHash(toSearchParams({ ...q, cursor: undefined }).toString());

export function encodeCursor(state: CursorState, query: MarketplaceQuery): string {
  const seen = state.s.slice(-SEEN_MAX);
  const json = JSON.stringify({ q: queryHash(query), p: state.p, d: state.d, s: seen.join("") });
  return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeCursor(cursor: string, query: MarketplaceQuery): CursorState {
  if (cursor.length > 1600 || !/^[A-Za-z0-9_-]+$/.test(cursor)) throw new InvalidCursorError();
  let raw: unknown;
  try {
    raw = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    throw new InvalidCursorError();
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new InvalidCursorError();
  const o = raw as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length !== 4 || !["q", "p", "d", "s"].every((k) => keys.includes(k))) throw new InvalidCursorError();
  if (o.q !== queryHash(query)) throw new InvalidCursorError();

  const p: CursorState["p"] = {};
  if (!o.p || typeof o.p !== "object" || Array.isArray(o.p)) throw new InvalidCursorError();
  for (const [k, v] of Object.entries(o.p as Record<string, unknown>)) {
    if (!(PROVIDERS as readonly string[]).includes(k)) throw new InvalidCursorError();
    const prov = k as Provider;
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > MAX_POSITION[prov]) throw new InvalidCursorError();
    p[prov] = v;
  }
  if (!Array.isArray(o.d) || o.d.length > PROVIDERS.length) throw new InvalidCursorError();
  const d = o.d.map((x) => {
    if (typeof x !== "string" || !(PROVIDERS as readonly string[]).includes(x)) throw new InvalidCursorError();
    return x as Provider;
  });
  if (typeof o.s !== "string" || o.s.length % 6 !== 0 || o.s.length > SEEN_MAX * 6 || !/^[A-Za-z0-9_-]*$/.test(o.s))
    throw new InvalidCursorError();
  const s = o.s.match(/.{6}/g) ?? [];
  return { p, d, s };
}
