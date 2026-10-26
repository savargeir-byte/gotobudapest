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
export async function providerFetch(
  url: string,
  key: string | undefined,
  init: RequestInit = {},
  cacheSeconds = 0,
): Promise<unknown> {
  if (!key?.trim()) throw new ProviderError(503);
  // Defence in depth: whatever was concatenated into the URL, only the exact
  // provider API origins over https are ever contacted (literal prefix check, so a
  // value like ".evil.example" appended to a host can never change the host).
  if (
    !(
      url.startsWith("https://api.tourdesk.io/") ||
      url.startsWith("https://api.viator.com/") ||
      url.startsWith("https://api.sandbox.viator.com/") ||
      url.startsWith("https://api.tiqets.com/")
    )
  )
    throw new ProviderError(502);
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
