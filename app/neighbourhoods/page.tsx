import type { Metadata } from "next";
import { neighbourhoods } from "../../lib/editorial";
import { EditorialCollection } from "../../components/editorial-pages";
export const metadata: Metadata = {
  title: "Budapest Neighbourhoods: Castle District & Downtown Pest | GoToBudapest",
  description: "Explore Budapest’s neighbourhoods with practical guides to Buda’s Castle District and the architecture, cafés and Danube embankment of Downtown Pest."
};
export default function NeighbourhoodsPage(){
  return <EditorialCollection title="Budapest neighbourhoods" description="Cross the river and meet two sides of the city: the winding streets of Castle Hill and the grand avenues of Downtown Pest." eyebrow="ONE CITY · MANY PERSONALITIES" pages={neighbourhoods} collection="neighbourhoods" />;
}
