export const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
export const array = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
export const text = (v: unknown): string => (typeof v === "string" ? v : "");
export const plain = (v: unknown): string =>
  text(v)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
export function https(v: unknown, hosts?: string[]): string | undefined {
  if (typeof v !== "string" || v.length > 4096) return;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" || u.username || u.password || u.port) return;
    if (
      hosts &&
      !hosts.some((h) => u.hostname === h || u.hostname.endsWith("." + h))
    )
      return;
    return v;
  } catch {
    return;
  }
}
export const tourdeskId = (s: string) => /^\d{1,12}-\d{1,8}$/.test(s);
export const viatorId = (s: string) => /^[A-Za-z0-9]{3,50}$/.test(s);
export function validDate(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const n = Date.parse(s + "T12:00:00Z");
  return (
    Number.isFinite(n) &&
    new Date(n).toISOString().slice(0, 10) === s &&
    s >= new Date().toISOString().slice(0, 10) &&
    n < Date.now() + 2 * 366 * 86400000
  );
}
export class ProviderError extends Error {
  constructor(
    public status: number,
    message = "The booking provider is temporarily unavailable. Please try again.",
  ) {
    super(message);
  }
}
export type ProviderName = "tourdesk" | "viator";
// The provider API host is chosen here from a closed set and the caller's path can
// only extend the path of that fixed https origin (the literal prefix ends in "/").
export async function providerFetch(
  provider: ProviderName,
  path: string,
  key: string | undefined,
  init: RequestInit = {},
  cacheSeconds = 0,
  viatorSandbox = false,
): Promise<unknown> {
  if (!key?.trim()) throw new ProviderError(503);
  // Provider paths are plain relative paths: letters, digits and a few URL-safe
  // symbols only. A colon, at-sign, backslash, hash, dot-dot or double slash can
  // never reach the request URL.
  if (
    !/^[A-Za-z0-9._~\-\/%?=&,+]{1,300}$/.test(path) ||
    path.includes("..") ||
    path.includes("//")
  )
    throw new ProviderError(502);
  const rest = path.replace(/^\/+/, "");
  const url =
    provider === "tourdesk"
      ? "https://api.tourdesk.io/api/v1.0/" + rest
      : viatorSandbox
        ? "https://api.sandbox.viator.com/partner/" + rest
        : "https://api.viator.com/partner/" + rest;
  let r: Response;
  try {
    r = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(12000),
      ...(cacheSeconds
        ? { next: { revalidate: cacheSeconds } }
        : { cache: "no-store" }),
    });
  } catch {
    throw new ProviderError(502);
  }
  if (!r.ok) {
    console.warn("[booking-provider]", new URL(url).hostname, r.status);
    throw new ProviderError(
      r.status === 404 ? 404 : r.status === 429 ? 429 : 502,
    );
  }
  try {
    return await r.json();
  } catch {
    throw new ProviderError(502);
  }
}
