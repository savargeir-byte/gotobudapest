import type { Metadata } from "next";
import { TopicPage, topicMetadata } from "../../../components/topic-pages";
import { neighbourhoods } from "../../../lib/topics";
export const dynamicParams = false;
export const generateStaticParams = () =>
  neighbourhoods.map((t) => ({ slug: t.slug }));
type Props = { params: Promise<{ slug: string }> };
const find = async ({ params }: Props) => {
  const { slug } = await params;
  return neighbourhoods.find((t) => t.slug === slug);
};
export async function generateMetadata(props: Props): Promise<Metadata> {
  return topicMetadata("/neighbourhoods", await find(props));
}
export default async function NeighbourhoodPage(props: Props) {
  return (
    <TopicPage
      base="/neighbourhoods"
      label="Neighbourhoods"
      topic={await find(props)}
    />
  );
}
