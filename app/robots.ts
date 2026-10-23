import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfigured } from "../lib/site";

export default function robots(): MetadataRoute.Robots {
  // Until NEXT_PUBLIC_SITE_URL names the confirmed production domain, ask
  // crawlers to stay away so no wrong canonical host gets indexed.
  if (!siteConfigured) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
