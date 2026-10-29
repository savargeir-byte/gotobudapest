// Local fallback content: the original hand-maintained data. The website uses it
// whenever Sanity is empty or unreachable, and it is the seed source for Sanity.
import { attractions as rawAttractions, suggestedGuides } from "./attractions";
import { getAttractionEditorial } from "./attraction-editorial";
import { attractionGallery } from "./attraction-galleries";
import { attractionLongForm, longFormBody } from "./attraction-long-form";
import { guides as rawGuides, guidePhoto } from "./guides";
import { experiences, neighbourhoods, topicPhoto, type Topic as RawTopic } from "./topics";
import { textToBlocks } from "./portable-text";
import type {
  Attraction,
  AttractionHistory,
  Guide,
  Photo,
  SiteContent,
  Topic,
} from "./types";

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

function localHistory(slug: string): AttractionHistory | undefined {
  const e = getAttractionEditorial(slug);
  if (!e) return undefined;
  return {
    intro: e.introduction,
    sections: e.historySections.map((s, i) => ({
      heading: s.heading,
      body: textToBlocks(s.paragraphs, undefined, `${slug}-h${i}`),
    })),
    stories: (e.stories ?? []).map((st, i) => ({
      kind: st.kind,
      title: st.title,
      body: textToBlocks(st.description, undefined, `${slug}-st${i}`),
      sourceUrl: st.sourceUrl,
      sourceLabel: st.sourceLabel,
    })),
    sources: e.sources,
  };
}

function localGallery(slug: string): Photo[] | undefined {
  const images = attractionGallery(slug);
  if (!images.length) return undefined;
  return images.map((g) => ({
    src640: g.thumb,
    src1280: g.src,
    alt: g.alt,
    caption: g.caption,
    credit: {
      title: g.key,
      author: g.author,
      license: g.license,
      licenseUrl: g.licenseUrl,
      sourceUrl: g.sourceUrl,
    },
  }));
}

export function localContent(): SiteContent {
  const attractions: Attraction[] = rawAttractions.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    category: a.category,
    // Long-form visitor writing (lib/attraction-long-form.ts) replaces the one-line description for the
    // most important attractions and adds the main text.
    description: attractionLongForm[a.slug]?.description ?? a.description,
    body: longFormBody(a.slug),
    sourceUrl: a.sourceUrl,
    sourceLabel: a.sourceLabel,
    checked: a.checked,
    address: a.address,
    coordinates: a.coordinates,
    status: a.status,
    notice: a.notice,
    additionalSource: a.additionalSource,
    photo: a.photo,
    gallery: localGallery(a.slug),
    history: localHistory(a.slug),
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
