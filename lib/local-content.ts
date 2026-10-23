// Local fallback content: the original hand-maintained data. The website uses it
// whenever Sanity is empty or unreachable, and it is the seed source for Sanity.
import { attractions as rawAttractions, suggestedGuides } from "./attractions";
import { guides as rawGuides, guidePhoto } from "./guides";
import { experiences, neighbourhoods, topicPhoto, type Topic as RawTopic } from "./topics";
import { textToBlocks } from "./portable-text";
import type { Attraction, Guide, SiteContent, Topic } from "./types";

const featuredSlugs = [
  "hungarian-parliament",
  "fishermans-bastion",
  "szechenyi-thermal-bath",
  "matthias-church",
  "chain-bridge",
  "great-market-hall",
];
const featuredGuideSlugs = [
  "budapest-in-3-days",
  "danube-cruises",
  "budapest-bars-nightlife",
];

function toTopic(t: RawTopic): Topic {
  return {
    slug: t.slug,
    title: t.title,
    eyebrow: t.eyebrow,
    summary: t.summary,
    description: t.description,
    photo: topicPhoto(t),
    intro: t.intro,
    highlights: t.highlights,
    faqs: t.faqs,
    sections: t.sections.map((s, i) => ({
      title: s.title,
      body: textToBlocks(s.paragraphs, s.bullets, `${t.slug}-s${i}`),
    })),
    placesHeading: t.placesHeading,
    placesIntro: t.placesIntro,
    placeSlugs: t.placeSlugs,
    guides: t.guides,
    sources: t.sources,
  };
}

export function localContent(): SiteContent {
  const attractions: Attraction[] = rawAttractions.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    category: a.category,
    description: a.description,
    sourceUrl: a.sourceUrl,
    sourceLabel: a.sourceLabel,
    checked: a.checked,
    address: a.address,
    coordinates: a.coordinates,
    status: a.status,
    notice: a.notice,
    additionalSource: a.additionalSource,
    photo: a.photo,
    relatedGuides: suggestedGuides(a.category),
    featured: featuredSlugs.includes(a.slug),
  }));
  const guides: Guide[] = rawGuides.map((g) => ({
    slug: g.slug,
    title: g.title,
    shortTitle: g.shortTitle,
    category: g.category,
    description: g.description,
    photo: guidePhoto(g),
    imageCaption: g.imageCaption,
    intro: g.intro,
    highlights: g.highlights,
    sections: g.sections.map((s) => ({
      id: s.id,
      title: s.title,
      body: textToBlocks(s.paragraphs, s.bullets, `${g.slug}-${s.id}`),
    })),
    faqs: g.faqs,
    sources: g.sources,
    related: g.related,
    updated: g.updated,
  }));
  return {
    attractions,
    guides,
    experiences: experiences.map(toTopic),
    neighbourhoods: neighbourhoods.map(toTopic),
    settings: {
      featuredAttractions: featuredSlugs,
      featuredGuides: featuredGuideSlugs,
    },
  };
}
