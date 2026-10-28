// Shapes the website renders. They are produced either from Sanity documents
// (lib/sanity/mappers.ts) or from the local fallback content (lib/content.ts).

export type PtSpan = {
  _type: "span";
  _key: string;
  text: string;
  marks?: string[];
};
export type PtBlock = {
  _type: "block";
  _key: string;
  style?: string;
  listItem?: "bullet" | "number";
  level?: number;
  children: PtSpan[];
  markDefs?: { _key: string; _type: string; href?: string }[];
};

export type PhotoCredit = {
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
};
export type Photo = {
  src640: string;
  src1280: string;
  alt: string;
  caption?: string;
  credit?: PhotoCredit;
};

export type Seo = { title?: string; description?: string };
export type SourceLink = { label: string; url: string };
export type Faq = { question: string; answer: string };

export type HistoryStory = {
  kind: string;
  title: string;
  body: PtBlock[];
  sourceUrl: string;
  sourceLabel: string;
};
export type AttractionHistory = {
  intro: string;
  sections: { heading: string; body: PtBlock[] }[];
  stories: HistoryStory[];
  sources: SourceLink[];
};

export type Attraction = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  body?: PtBlock[];
  sourceUrl: string;
  sourceLabel: string;
  checked: string;
  address?: string;
  coordinates?: { latitude: number; longitude: number };
  status?: string;
  notice?: string;
  additionalSource?: string;
  photo?: Photo;
  gallery?: Photo[];
  history?: AttractionHistory;
  relatedGuides?: string[];
  featured?: boolean;
  seo?: Seo;
};

export type GuideSection = { id: string; title: string; body: PtBlock[] };
export type Guide = {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  photo: Photo;
  imageCaption?: string;
  intro: string;
  highlights: string[];
  sections: GuideSection[];
  faqs: Faq[];
  sources: SourceLink[];
  related: string[];
  updated: string;
  seo?: Seo;
};

export type TopicSection = { title: string; body: PtBlock[] };
export type Topic = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  description: string;
  photo: Photo;
  intro: string;
  highlights: string[];
  faqs: Faq[];
  sections: TopicSection[];
  placesHeading: string;
  placesIntro: string;
  placeSlugs: string[];
  guides: string[];
  sources: SourceLink[];
  seo?: Seo;
};

export type SiteSettings = {
  featuredAttractions: string[];
  featuredGuides: string[];
  seo?: Seo;
};

export type SiteContent = {
  attractions: Attraction[];
  guides: Guide[];
  experiences: Topic[];
  neighbourhoods: Topic[];
  settings: SiteSettings;
};
