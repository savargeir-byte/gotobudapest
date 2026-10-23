import type { Metadata } from "next";
import { experiencePages } from "../../lib/editorial";
import { EditorialCollection } from "../../components/editorial-pages";
export const metadata: Metadata = {
  title: "Budapest Experiences: Danube, Thermal Baths & Food | GoToBudapest",
  description: "Find inspiration for Danube views and cruises, Budapest thermal baths, food markets and historic cafés, with carefully curated attraction links."
};
export default function ExperiencesPage(){
  return <EditorialCollection title="Budapest experiences" description="The river. The baths. The market mornings. Discover the moments that make Budapest feel like Budapest." eyebrow="DO MORE THAN SEE THE CITY" pages={experiencePages} collection="experiences" />;
}
