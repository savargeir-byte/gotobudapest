import "../globals.css";
import ScrollToTop from "@/components/scroll-to-top";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ScrollToTop />
      {children}
    </>
  );
}
