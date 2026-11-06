import type { Metadata } from "next";
import { VisitorGuideHub } from "@/components/visitor-info";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({
 title: "Budapest Transportation: Airport, Metro, Trams & Tickets",
 description: "Plan travel in Budapest with airport connections, transport tickets, cycling, accessible routes and taxis. Official sources, related places and bookable experiences.",
 path:"/transportation"
});
export default function Page() { return <VisitorGuideHub group="transportation"/>; }
