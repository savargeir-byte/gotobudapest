import type { Metadata } from "next";
import { TopicPage, topicMetadata } from "@/components/topic-pages";
import { bySlug, loadContent } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const content = await loadContent();
  return content.neighbourhoods.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await loadContent();
  return topicMetadata("/neighbourhoods", bySlug(content.neighbourhoods, slug));
}

export default async function NeighbourhoodPage({ params }: Props) {
  const { slug } = await params;
  const content = await loadContent();
  return (
    <TopicPage
      base="/neighbourhoods"
      label="Neighbourhoods"
      topic={bySlug(content.neighbourhoods, slug)}
      content={content}
    />
  );
}
