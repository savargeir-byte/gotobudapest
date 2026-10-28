// Public site origin used for canonical URLs, Open Graph and the sitemap.
//
// Set NEXT_PUBLIC_SITE_URL (e.g. https://www.example.com) once the production
// domain is confirmed. Until then the site is served as non-indexable so that
// no wrong canonical domain is ever published.
function parseOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL is not a valid URL: "${value}". Use a full origin such as https://www.example.com`,
    );
  }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !local)
    throw new Error("NEXT_PUBLIC_SITE_URL must start with https://");
  if (url.pathname !== "/" || url.search || url.hash)
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an origin only, without a path or query",
    );
  return url.origin;
}

// The confirmed primary domain (the apex gotobuda.com redirects to www). It is the default
// origin for canonical URLs, the sitemap and the TourDesk return URL when
// NEXT_PUBLIC_SITE_URL is not set. Indexing stays OFF until NEXT_PUBLIC_SITE_URL is set
// explicitly (see siteConfigured), so this default never publishes anything by itself.
export const PRODUCTION_ORIGIN = "https://www.gotobuda.com";

const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteConfigured = Boolean(configured);
export const siteUrl = configured
  ? parseOrigin(configured)
  : process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : PRODUCTION_ORIGIN;
export const siteName = "GoToBudapest";
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();

// Origin for server-generated return URLs. Read lazily so tests and previews can set the
// environment at runtime. Never browser input.
export function returnOrigin(
  env: Record<string, string | undefined> = process.env,
): string {
  const value = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (value) {
    try {
      return parseOrigin(value);
    } catch {
      /* invalid value: fall back to the production origin */
    }
  }
  return PRODUCTION_ORIGIN;
}
