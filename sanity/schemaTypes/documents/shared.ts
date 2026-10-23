import { defineArrayMember, defineField } from "sanity";

export const groups = [
  { name: "content", title: "Content", default: true },
  { name: "media", title: "Media" },
  { name: "seo", title: "SEO" },
  { name: "relations", title: "Relations" },
];

export const slugField = (source: string, group: string | null = "content") =>
  defineField({
    name: "slug",
    title: "Slug",
    description:
      "Part of the page URL. Changing it changes the URL, so set up a redirect first.",
    type: "slug",
    ...(group === null ? {} : { group }),
    options: { source, maxLength: 96 },
    validation: (rule) => rule.required(),
  });

export const seoField = defineField({
  name: "seo",
  title: "SEO",
  type: "seo",
  group: "seo",
});

export const heroImageField = defineField({
  name: "heroImage",
  title: "Hero image",
  type: "photo",
  group: "media",
});

export const galleryField = defineField({
  name: "gallery",
  title: "Image gallery",
  type: "array",
  group: "media",
  of: [defineArrayMember({ type: "photo" })],
});

export const publishedAtField = defineField({
  name: "publishedAt",
  title: "Published at",
  type: "datetime",
  group: "content",
});

export const orderField = defineField({
  name: "order",
  title: "Editorial order",
  description: "Lower numbers appear first in lists.",
  type: "number",
  group: "content",
  validation: (rule) => rule.integer().min(0),
});

export const refArray = (
  name: string,
  title: string,
  to: string,
  options: { max?: number; group?: string | null } = {},
) =>
  defineField({
    name,
    title,
    type: "array",
    ...(options.group === null ? {} : { group: options.group ?? "relations" }),
    of: [defineArrayMember({ type: "reference", to: [{ type: to }] })],
    validation: (rule) => {
      const unique = rule.unique();
      return options.max ? unique.max(options.max) : unique;
    },
  });

export const sourcesField = defineField({
  name: "sources",
  title: "Official sources",
  type: "array",
  group: "content",
  of: [defineArrayMember({ type: "sourceLink" })],
});

export const faqsField = defineField({
  name: "faqs",
  title: "Common questions",
  type: "array",
  group: "content",
  of: [defineArrayMember({ type: "faq" })],
});

export const highlightsField = defineField({
  name: "highlights",
  title: "At a glance",
  type: "array",
  group: "content",
  of: [defineArrayMember({ type: "string" })],
});

export const editorialOrderings = [
  {
    title: "Editorial order",
    name: "orderAsc",
    by: [{ field: "order", direction: "asc" as const }],
  },
];
