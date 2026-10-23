import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "GoToBudapest — A city worth getting lost in",
  description:
    "Discover Budapest’s riverside landmarks, thermal baths and neighbourhoods. Save your favourite places and build a personal city itinerary.",
  icons: { icon: "/assets/favicon.svg" },
  openGraph: {
    title: "GoToBudapest — Your next city story",
    description: "Discover Budapest and plan your own city break.",
    type: "website",
  },
};
export const viewport: Viewport = { themeColor: "#081b26" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
