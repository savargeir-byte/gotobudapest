import { defineField, defineType } from "sanity";
import { slugField } from "./shared";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    slugField("title", null),
    defineField({
      name: "kind",
      title: "Used for",
      type: "string",
      options: {
        list: [
          { title: "Attractions", value: "attraction" },
          { title: "Guides", value: "guide" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
  ],
  preview: { select: { title: "title", subtitle: "kind" } },
  orderings: [
    {
      title: "Title",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
