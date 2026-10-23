import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "SEO title",
      description: "Optional. Up to about 70 characters. Falls back to the page title.",
      type: "string",
      validation: (rule) => rule.max(70).warning("Longer titles may be truncated."),
    }),
    defineField({
      name: "description",
      title: "Meta description",
      description: "Up to about 170 characters.",
      type: "text",
      rows: 3,
      validation: (rule) =>
        rule.max(170).warning("Longer descriptions may be truncated in search results."),
    }),
  ],
});
