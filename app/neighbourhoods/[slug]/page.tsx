import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { neighbourhoods, findNeighbourhood } from "../../../lib/editorial";
import EditorialDetail from "../../../components/editorial-pages";
export const dynamicParams = false;
export function generateStaticParams(){ return neighbourhoods.map(page => ({slug:page.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const page=findNeighbourhood(slug);
  return page ? {title:`${page.title}, Budapest | GoToBudapest`,description:page.description,openGraph:{title:page.title,description:page.description,type:"article"}} : {};
}
export default async function NeighbourhoodPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const page=findNeighbourhood(slug);
  if(!page) notFound();
  return <EditorialDetail page={page} collection="neighbourhoods" collectionTitle="Neighbourhoods" />;
}
