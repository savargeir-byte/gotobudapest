import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VisitorGuideArticle } from "@/components/visitor-info";
import { visitorGuides, findVisitorGuide } from "@/lib/visitor-guides";
import { photos } from "@/lib/attractions";
import { pageMetadata } from "@/lib/seo";
export function generateStaticParams() {
 return visitorGuides.filter((g) => g.group === "gastronomy").map((g) => ({ slug:g.slug }));
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
 const {slug}=await params;
 const g=findVisitorGuide("gastronomy",slug);
 if(!g)return {};
 return pageMetadata({title:g.title,description:g.description,path:`/gastronomy/${g.slug}`,image:photos[g.photoKey]?.src1280 ?? "/assets/city.webp",type:"article"});
}
export default async function Page({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;
 const guide=findVisitorGuide("gastronomy",slug);
 if(!guide)notFound();
 return <VisitorGuideArticle guide={guide}/>;
}
