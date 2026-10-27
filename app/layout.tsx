import type { Metadata, Viewport } from "next";
import { siteConfigured, siteName, siteUrl } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GoToBudapest — A city worth getting lost in",
    template: `%s | ${siteName}`,
  },
  description:
    "Discover Budapest’s riverside landmarks, thermal baths and neighbourhoods. Explore 100 places, experiences and travel guides for your own city break.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "GoToBudapest — Your next city story",
    description: "Discover Budapest: attractions, experiences, neighbourhoods and guides.",
    url: "/",
    siteName,
    locale: "en_GB",
    type: "website",
    images: [{ url: "/assets/danube.webp" }],
  },
  twitter: { card: "summary_large_image" },
  ...(siteConfigured ? {} : { robots: { index: false, follow: false } }),
};
export const viewport: Viewport = { themeColor: "#081b26" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
