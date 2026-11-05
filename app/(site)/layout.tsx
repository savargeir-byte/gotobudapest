import "../globals.css";
import ScrollToTop from "@/components/scroll-to-top";
import ConsentBanner from "@/components/analytics/consent-banner";
import "@/components/analytics/consent-banner.css";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ScrollToTop />
      <ConsentBanner />
      {children}
    </>
  );
}
