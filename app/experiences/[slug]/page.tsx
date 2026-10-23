import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { experiencePages, findExperience } from "../../../lib/editorial";
import EditorialDetail from "../../../components/editorial-pages";
export const dynamicParams = false;
export function generateStaticParams(){return experiencePages.map(page=>({slug:page.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params; const page=findExperience(slug);
 return page ? {title:`${page.title} | Budapest Experiences | GoToBudapest`,description:page.description,openGraph:{title:page.title,description:page.description,type:"article"}} : {};
}
export default async function ExperiencePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const page=findExperience(slug); if(!page)notFound();
 return <EditorialDetail page={page} collection="experiences" collectionTitle="Experiences" />;
}
