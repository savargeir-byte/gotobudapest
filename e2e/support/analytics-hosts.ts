// Host checks for the analytics tests. They compare the parsed hostname of a request URL instead of matching a pattern
// against the whole URL string, so an unrelated host that merely contains one of these names is never mistaken for it.
const GOOGLE_TAG_HOST = "www.googletagmanager.com";
const GOOGLE_COLLECT_HOSTS = ["google-analytics.com", "analytics.google.com"];

const parse = (url: string | URL): URL | undefined => {
  try {
    return typeof url === "string" ? new URL(url) : url;
  } catch {
    return undefined;
  }
};
const onDomain = (hostname: string, domain: string) => hostname === domain || hostname.endsWith(`.${domain}`);

/** The Google tag loader (googletagmanager.com). */
export const isGoogleTagUrl = (url: string | URL) => {
  const u = parse(url);
  return !!u && u.hostname === GOOGLE_TAG_HOST && u.pathname.startsWith("/gtag/js");
};
/** Any Google Analytics host: the tag loader or a collection endpoint. */
export const isGoogleAnalyticsUrl = (url: string | URL) => {
  const u = parse(url);
  return !!u && (u.hostname === GOOGLE_TAG_HOST || GOOGLE_COLLECT_HOSTS.some((d) => onDomain(u.hostname, d)));
};
/** Only the collection endpoints (not the tag loader). */
export const isGoogleCollectUrl = (url: string | URL) => {
  const u = parse(url);
  return !!u && GOOGLE_COLLECT_HOSTS.some((d) => onDomain(u.hostname, d));
};
/** Vercel Web Analytics: the first-party script path, or the Vercel script host. */
export const isVercelAnalyticsUrl = (url: string | URL) => {
  const u = parse(url);
  return !!u && (u.pathname.startsWith("/_vercel/insights/") || u.hostname === "va.vercel-scripts.com");
};
export const isVercelInsightsScript = (url: string | URL) => parse(url)?.pathname === "/_vercel/insights/script.js";
/** Every host the analytics tests intercept. */
export const isAnalyticsUrl = (url: string | URL) => isGoogleAnalyticsUrl(url) || isVercelAnalyticsUrl(url);
