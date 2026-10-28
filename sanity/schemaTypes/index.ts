import type { SchemaTypeDefinition } from "sanity";
import { faq } from "./objects/faq";
import { guideSection } from "./objects/guideSection";
import { historicalStory } from "./objects/historicalStory";
import { historySection } from "./objects/historySection";
import { photo } from "./objects/photo";
import { portableText } from "./objects/portableText";
import { seo } from "./objects/seo";
import { sourceLink } from "./objects/sourceLink";
import { topicSection } from "./objects/topicSection";
import { attraction } from "./documents/attraction";
import { category } from "./documents/category";
import { experience } from "./documents/experience";
import { guide } from "./documents/guide";
import { neighbourhood } from "./documents/neighbourhood";
import { region } from "./documents/region";
import { siteSettings } from "./documents/siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  attraction,
  guide,
  experience,
  neighbourhood,
  region,
  category,
  siteSettings,
  // objects
  photo,
  portableText,
  seo,
  sourceLink,
  faq,
  guideSection,
  topicSection,
  historySection,
  historicalStory,
];
