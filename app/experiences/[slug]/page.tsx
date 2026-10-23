import type { Metadata } from "next";
import { TopicPage, topicMetadata } from "../../../components/topic-pages";
import { experiences } from "../../../lib/topics";
export const dynamicParams = false;
export const generateStaticParams = () =>
  experiences.map((t) => ({ slug: t.slug }));
type Props = { params: Promise<{ slug: string }> };
const find = async ({ params }: Props) => {
  const { slug } = await params;
  return experiences.find((t) => t.slug === slug);
};
export async function generateMetadata(props: Props): Promise<Metadata> {
  return topicMetadata("/experiences", await find(props));
}
export default async function ExperiencePage(props: Props) {
  return (
    <TopicPage
      base="/experiences"
      label="Experiences"
      topic={await find(props)}
    />
  );
}
