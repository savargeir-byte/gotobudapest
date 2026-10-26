import { defineField, defineType } from "sanity";

// Kinds follow docs/sanity-attraction-template.md: never present a tradition as
// established historical fact.
export const storyKinds = [
  { title: "Documented historical account", value: "historical-account" },
  { title: "Local tradition", value: "local-tradition" },
  { title: "Religious tradition", value: "religious-tradition" },
];

export const historicalStory = defineType({
  name: "historicalStory",
  title: "Story or tradition",
  type: "object",
  fields: [
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: { list: storyKinds, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "portableText",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "sourceUrl",
      title: "Source URL",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "sourceLabel",
      title: "Source label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "title", subtitle: "kind" } },
});
