import type { Metadata } from "next";
import { VisitorGuideHub } from "@/components/visitor-info";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({title:"Budapest Culture: Museums, Opera, Heritage & Events",description:"Original illustrated Budapest guides to museums, music, architecture, religious heritage and events, with linked attractions and relevant tickets.",path:"/culture"});
export default function Page() { return <VisitorGuideHub group="culture"/>; }
