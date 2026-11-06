import type { Metadata } from "next";
import { TopicHub } from "@/components/topic-pages";
import { pageMetadata } from "@/lib/seo";
import { loadContent } from "@/lib/content";
export const metadata: Metadata = pageMetadata({
  title: "Budapest Neighbourhoods: Discover Buda & Pest",
  description:
    "Discover Budapest neighbourhoods from the Castle District and Jewish Quarter to Óbuda, Újbuda, City Park and Margaret Island, with places and practical guides.",
  path: "/neighbourhoods",
});
export default async function NeighbourhoodsPage() {
  const content = await loadContent();
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
      topics={content.neighbourhoods}
    />
  );
}
