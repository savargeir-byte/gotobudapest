import type { Metadata, Viewport } from "next";
import { siteConfigured, siteName, siteUrl } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Budapest Travel Guide, Attractions & Tours | GoToBudapest",
    template: `%s | ${siteName}`,
  },
  description:
    "Plan your Budapest trip: sourced guides to attractions and neighbourhoods, visitor information and bookable cruises, thermal baths and tours from partners.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Budapest Travel Guide, Attractions & Tours | GoToBudapest",
    description: "Sourced guides to Budapest's attractions and neighbourhoods, visitor information and bookable tours from partners.",
    url: "/",
    siteName,
    locale: "en_GB",
    type: "website",
    images: [{ url: "/assets/danube.webp" }],
  },
  twitter: { card: "summary_large_image" },
  // Search Console and Bing Webmaster verification tokens come from the environment (never hard-coded); a token
  // that is not set renders no tag. The tokens are public by design: they only prove who controls the site.
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }
      : {}),
  },
  ...(siteConfigured ? {} : { robots: { index: false, follow: false } }),
};
export const viewport: Viewport = { themeColor: "#081b26" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
      </head>
      <body>{children}</body>
    </html>
  );
}
