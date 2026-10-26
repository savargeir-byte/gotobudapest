import { defineArrayMember, defineField, defineType } from "sanity";
import {
  editorialOrderings,
  galleryField,
  groups,
  heroImageField,
  orderField,
  publishedAtField,
  refArray,
  seoField,
  slugField,
} from "./shared";

const httpsOnly = { scheme: ["https"] };

export const attraction = defineType({
  name: "attraction",
  title: "Attraction",
  type: "document",
  groups: [...groups, { name: "history", title: "History" }],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    slugField("name"),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      group: "content",
      to: [{ type: "category" }],
      options: { filter: 'kind == "attraction"' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "region",
      title: "Region / district",
      type: "reference",
      group: "content",
      to: [{ type: "region" }],
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "body",
      title: "Editorial body",
      type: "portableText",
      group: "content",
    }),
    heroImageField,
    galleryField,
    defineField({
      name: "address",
      title: "Address",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "location",
      title: "Location (GPS)",
      description:
        "Only fill in when official coordinates exist; never estimate.",
      type: "geopoint",
      group: "content",
    }),
    defineField({
      name: "operatingStatus",
      title: "Operating status",
      description: "e.g. Closed for renovation, Seasonal: check dates.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "notice",
      title: "Visitor notice",
      type: "text",
      rows: 3,
      group: "content",
    }),
    defineField({
      name: "sourceUrl",
      title: "Official source URL",
      type: "url",
      group: "content",
      validation: (rule) => rule.required().uri(httpsOnly),
    }),
    defineField({
      name: "sourceLabel",
      title: "Source label",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "additionalSource",
      title: "Additional source URL",
      type: "url",
      group: "content",
      validation: (rule) => rule.uri(httpsOnly),
    }),
    defineField({
      name: "checked",
      title: "Source last checked",
      type: "date",
      group: "content",
    }),
    defineField({
      name: "historyIntro",
      title: "History: introduction",
      description:
        "Independent, sourced prose. Never invent facts; leave empty until researched.",
      type: "text",
      rows: 4,
      group: "history",
    }),
    defineField({
      name: "historySections",
      title: "History sections",
      type: "array",
      group: "history",
      of: [defineArrayMember({ type: "historySection" })],
    }),
    defineField({
      name: "stories",
      title: "Stories and local traditions",
      description:
        "Label each entry honestly: documented account, local tradition or religious tradition.",
      type: "array",
      group: "history",
      of: [defineArrayMember({ type: "historicalStory" })],
    }),
    defineField({
      name: "historySources",
      title: "Historical sources",
      type: "array",
      group: "history",
      of: [defineArrayMember({ type: "sourceLink" })],
    }),
    publishedAtField,
    orderField,
    defineField({
      name: "featured",
      title: "Featured on the homepage",
      type: "boolean",
      group: "content",
      initialValue: false,
    }),
    seoField,
    refArray("relatedAttractions", "Related attractions", "attraction", {
      max: 12,
    }),
    refArray("relatedGuides", "Related guides", "guide", { max: 12 }),
    refArray("relatedExperiences", "Related experiences", "experience", {
      max: 12,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "category.title",
      media: "heroImage",
      status: "operatingStatus",
    },
    prepare: ({ title, subtitle, media, status }) => ({
      title,
      subtitle: [subtitle, status].filter(Boolean).join(" · "),
      media,
    }),
  },
  orderings: [
    ...editorialOrderings,
    {
      title: "Name A–Z",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});
