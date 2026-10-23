import { defineField, defineType } from "sanity";
import { groups, heroImageField, slugField } from "./shared";

export const region = defineType({
  name: "region",
  title: "Region / district",
  type: "document",
  groups,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    slugField("title"),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      group: "content",
    }),
    heroImageField,
  ],
  preview: {
    select: { title: "title", subtitle: "description", media: "heroImage" },
  },
});
