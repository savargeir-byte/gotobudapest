import "../globals.css";
import AnalyticsRuntime from "@/components/analytics/analytics-runtime";
import ConsentManager from "@/components/consent/consent-manager";
import ScrollToTop from "@/components/scroll-to-top";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ScrollToTop />
      {children}
      <ConsentManager />
      <AnalyticsRuntime />
    </>
  );
}
