// Loads the existing local content (the pre-Sanity source of truth) in a
// normalised shape. Used by the backup export and the Sanity seed script.
import { readFileSync } from "node:fs";
import path from "node:path";
import { guides as localGuides } from "../../lib/guides";
import { experiences as localExperiences, neighbourhoods as localNeighbourhoods } from "../../lib/topics";

export const root = process.cwd(); // scripts are run from the repository root

export type PhotoCredit = {
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
};
export type LocalPhoto = {
  /** public URL path, e.g. /assets/photos/x-1280.webp */
  src: string;
  alt: string;
  credit?: PhotoCredit;
};

type RawPhoto = {
  src640: string;
  src1280: string;
  alt: string;
  credit?: PhotoCredit;
};

export type RawAttraction = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  sourceUrl: string;
  sourceLabel: string;
  checked: string;
  address?: string;
  coordinates?: { latitude: number; longitude: number };
  status?: string;
  notice?: string;
  additionalSource?: string;
  image?: string;
  imageAlt?: string;
};

const readJson = <T>(rel: string): T =>
  JSON.parse(readFileSync(path.join(root, rel), "utf8")) as T;

export const rawAttractions = readJson<RawAttraction[]>("lib/attractions.json");
export const rawPhotos = readJson<Record<string, RawPhoto>>("lib/photos.json");

// The first-design photographs are Unsplash images (see README "Images").
const unsplash: Record<string, string> = {
  "budapest.webp": "https://images.unsplash.com/photo-1549877452-9c387954fbc2",
  "danube.webp": "https://images.unsplash.com/photo-1565426873118-a17ed65d74b9",
  "city.webp": "https://images.unsplash.com/photo-1551867633-194f125bddfa",
};

export function legacyPhoto(file: string, alt: string): LocalPhoto {
  const source = unsplash[file];
  return {
    src: `/assets/${file}`,
    alt,
    ...(source
      ? {
          credit: {
            title: file,
            author: "",
            license: "Unsplash License",
            licenseUrl: "https://unsplash.com/license",
            sourceUrl: source,
          },
        }
      : {}),
  };
}

const fromRaw = (p: RawPhoto): LocalPhoto => ({
  src: p.src1280,
  alt: p.alt,
  ...(p.credit ? { credit: p.credit } : {}),
});

export function photoByKey(key: string): LocalPhoto | undefined {
  const p = rawPhotos[key];
  return p ? fromRaw(p) : undefined;
}

export function attractionPhoto(a: RawAttraction): LocalPhoto | undefined {
  if (a.image) return legacyPhoto(a.image, a.imageAlt || a.name);
  return photoByKey(a.slug);
}

// Mirrors guidePhoto() in lib/guides.ts.
const guidePhotoKeys: Record<string, string> = {
  "budapest-in-3-days": "guide-3-days",
  "budapest-thermal-baths": "guide-thermal-baths",
  "getting-around-budapest": "guide-getting-around",
  "buda-castle-district": "guide-castle",
  "danube-cruises": "guide-danube-cruises",
  "budapest-bars-nightlife": "guide-nightlife",
  "downtown-pest-walking-guide": "hood-pest",
  "budapest-food-and-markets": "exp-food",
};

export type LocalGuide = {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  intro: string;
  highlights: string[];
  sections: { id: string; title: string; paragraphs: string[]; bullets?: string[] }[];
  faqs: { question: string; answer: string }[];
  sources: { label: string; url: string }[];
  related: string[];
  updated: string;
  photo: LocalPhoto;
};

export const guides: LocalGuide[] = localGuides.map((g) => ({
  slug: g.slug,
  title: g.title,
  shortTitle: g.shortTitle,
  category: g.category,
  description: g.description,
  intro: g.intro,
  highlights: g.highlights,
  sections: g.sections.map((s) => ({
    id: s.id,
    title: s.title,
    paragraphs: s.paragraphs,
    ...(s.bullets ? { bullets: s.bullets } : {}),
  })),
  faqs: g.faqs,
  sources: g.sources,
  related: g.related,
  updated: g.updated,
  photo:
    photoByKey(guidePhotoKeys[g.slug] ?? "") ??
    legacyPhoto(g.image, g.imageAlt),
}));

export type LocalTopic = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  description: string;
  intro: string;
  highlights: string[];
  faqs: { question: string; answer: string }[];
  sections: { title: string; paragraphs: string[]; bullets?: string[] }[];
  placesHeading: string;
  placesIntro: string;
  placeSlugs: string[];
  guides: string[];
  sources: { label: string; url: string }[];
  photo: LocalPhoto;
};

type TopicInput = (typeof localExperiences)[number];

const mapTopic = (t: TopicInput): LocalTopic => ({
  slug: t.slug,
  title: t.title,
  eyebrow: t.eyebrow,
  summary: t.summary,
  description: t.description,
  intro: t.intro,
  highlights: t.highlights,
  faqs: t.faqs,
  sections: t.sections.map((s) => ({
    title: s.title,
    paragraphs: s.paragraphs,
    ...(s.bullets ? { bullets: s.bullets } : {}),
  })),
  placesHeading: t.placesHeading,
  placesIntro: t.placesIntro,
  placeSlugs: t.placeSlugs,
  guides: t.guides,
  sources: t.sources,
  photo:
    photoByKey(t.photoKey) ??
    legacyPhoto(
      t.fallbackPhoto.src1280.replace("/assets/", ""),
      t.fallbackPhoto.alt,
    ),
});

export const experiences: LocalTopic[] = localExperiences.map(mapTopic);
export const neighbourhoods: LocalTopic[] = localNeighbourhoods.map(mapTopic);

// Mirrors suggestedGuides() in lib/attractions.ts.
export function suggestedGuides(category: string): string[] {
  return category === "Baths & wellness"
    ? ["budapest-thermal-baths", "getting-around-budapest"]
    : category === "Landmarks"
      ? ["budapest-in-3-days", "buda-castle-district", "danube-cruises"]
      : ["budapest-in-3-days", "getting-around-budapest"];
}

export const featuredAttractionSlugs = [
  "hungarian-parliament",
  "fishermans-bastion",
  "szechenyi-thermal-bath",
  "matthias-church",
  "chain-bridge",
  "great-market-hall",
];
export const featuredGuideSlugs = [
  "budapest-in-3-days",
  "danube-cruises",
  "budapest-bars-nightlife",
];
