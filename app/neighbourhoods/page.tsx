import type { Metadata } from "next";
import { TopicHub } from "../../components/topic-pages";
import { pageMetadata } from "../../lib/seo";
import { neighbourhoods } from "../../lib/topics";
export const metadata: Metadata = pageMetadata({
  title: "Budapest Neighbourhoods: Castle District & Downtown Pest",
  description:
    "Cross the river, change the scenery: explore the Castle District in Buda and downtown Pest, with places to visit and guides for each side of the city.",
  path: "/neighbourhoods",
});
export default function NeighbourhoodsPage() {
  return (
    <TopicHub
      base="/neighbourhoods"
      label="Neighbourhoods"
      eyebrow="ONE CITY. MANY PERSONALITIES."
      heading={
        <>
          Find your
          <br />
          <em>neighbourhood.</em>
        </>
      }
      intro="Cross the river. Change the scenery."
      topics={neighbourhoods}
    />
  );
}
