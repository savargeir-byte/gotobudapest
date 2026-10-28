import type { Metadata } from "next";
import { TopicHub } from "@/components/topic-pages";
import { pageMetadata } from "@/lib/seo";
import { loadContent } from "@/lib/content";
export const metadata: Metadata = pageMetadata({
  title: "Budapest Experiences: Danube, Thermal Baths & Food",
  description:
    "Riverside walks, thermal baths and Hungarian flavours: three ways to experience Budapest beyond ticking boxes, with the places and guides to go with them.",
  path: "/experiences",
});
export default async function ExperiencesPage() {
  const content = await loadContent();
  return (
    <TopicHub
      base="/experiences"
      label="Experiences"
      eyebrow="LESS TICKING BOXES. MORE FEELING IT."
      heading={
        <>
          Make time for
          <br />
          <em>the good stuff.</em>
        </>
      }
      intro="Take the scenic route along the river. Leave an afternoon for the baths. Stay out for one more view of the city lights."
      topics={content.experiences}
    />
  );
}
