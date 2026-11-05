import type { Metadata } from "next";
import { VisitorGuideHub } from "@/components/visitor-info";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({title:"Plan Your Budapest Visit: Families, Baths, Parks & City Passes",description:"Plan your Budapest visit with families, baths, outdoor walks, city passes, shopping, seasons and practical advice, with real attraction links.",path:"/visit"});
export default function Page() { return <VisitorGuideHub group="visit"/>; }
