import type { Metadata } from "next";
import { TopicPage, topicMetadata } from "@/components/topic-pages";
import { bySlug, loadContent } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const content = await loadContent();
  return content.experiences.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await loadContent();
  return topicMetadata("/experiences", bySlug(content.experiences, slug));
}

export default async function ExperiencePage({ params }: Props) {
  const { slug } = await params;
  const content = await loadContent();
  return (
    <TopicPage
      base="/experiences"
      label="Experiences"
      topic={bySlug(content.experiences, slug)}
      content={content}
    />
  );
}
