// Which attribution links a photograph can honestly carry. A credit may be a licensed third-party photo (licence
// and source URLs) or one of the owner's own photographs ("Used with permission", no URLs). A link is only
// produced when its URL exists, so a page never renders an empty anchor (which would point at the page itself),
// and the source link is named after where it really goes instead of always claiming Wikimedia Commons.
export type CreditUrls = { license?: string; licenseUrl?: string; sourceUrl?: string };

const httpsUrl = (u?: string): string | undefined => {
  const v = u?.trim();
  return v && /^https:\/\/[^/\s]+/i.test(v) ? v : undefined;
};

export function sourceLabelFor(sourceUrl: string, fallback = "Source"): string {
  try {
    const host = new URL(sourceUrl).hostname.replace(/^www\./, "");
    if (host === "commons.wikimedia.org") return "Wikimedia Commons";
  } catch {
    /* an unparsable URL never reaches here: httpsUrl() filters it out first */
  }
  return fallback;
}

export function creditLinks(c: CreditUrls): { licenseHref?: string; sourceHref?: string; sourceLabel: string } {
  const sourceHref = httpsUrl(c.sourceUrl);
  const licenseHref = httpsUrl(c.licenseUrl) ?? sourceHref;
  return { licenseHref, sourceHref, sourceLabel: sourceHref ? sourceLabelFor(sourceHref) : "Source" };
}
