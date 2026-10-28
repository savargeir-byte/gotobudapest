"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// One shared rule for the whole site: opening a DIFFERENT page starts at the top.
//
// Next.js already scrolls new pages into view, but with html { scroll-behavior: smooth }
// it animated from the old position (a visible slide), and it can leave the previous
// offset in some dynamic/streamed pages. This component makes the outcome explicit:
//   - only a pathname change resets scroll (filters, sorting, Load More and other
//     search-param updates on the same page never jump),
//   - links with a #hash keep their anchor target,
//   - Back/Forward (popstate) keep the browser/Next scroll restoration,
//   - the reset is instant, never animated.
export default function ScrollToTop() {
  const pathname = usePathname();
  const previous = useRef(pathname);
  const fromHistory = useRef(false);

  useEffect(() => {
    const mark = () => {
      fromHistory.current = true;
    };
    window.addEventListener("popstate", mark);
    return () => window.removeEventListener("popstate", mark);
  }, []);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    const popped = fromHistory.current;
    fromHistory.current = false;
    if (popped || window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
