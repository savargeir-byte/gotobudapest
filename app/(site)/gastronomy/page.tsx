import type { Metadata } from "next";
import { VisitorGuideHub } from "@/components/visitor-info";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({
 title: "Budapest Food & Drink: Hungarian Cuisine, Cafés & Markets",
 description: "Discover Hungarian food, cafés, markets and Budapest nightlife with illustrated guides, official sources, attraction links and relevant food experiences.",
 path:"/gastronomy"
});
export default function Page() { return <VisitorGuideHub group="gastronomy"/>; }
