// The GA4 measurement ID of the GoToBuda.com web data stream. It is a public identifier (it is visible in every page that
// loads the tag), not a secret. NEXT_PUBLIC_GA_MEASUREMENT_ID overrides it, for example for a staging stream.
// Read at build time by next.config.ts (Content Security Policy), the privacy page and the browser client, so all three
// always agree. The tag itself still loads only after analytics consent (lib/analytics/ga.ts).
export const DEFAULT_GA_MEASUREMENT_ID = "G-GCVBYQPJ9W";

const GA4_ID = /^G-[A-Z0-9]{4,14}$/;

export const GA_MEASUREMENT_ID: string | undefined = (() => {
  const id = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || DEFAULT_GA_MEASUREMENT_ID).trim();
  return GA4_ID.test(id) ? id : undefined;
})();
