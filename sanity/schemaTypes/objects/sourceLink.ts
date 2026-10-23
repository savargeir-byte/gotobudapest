import { defineField, defineType } from "sanity";

export const sourceLink = defineType({
  name: "sourceLink",
  title: "Source link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["https"] }),
    }),
  ],
  preview: { select: { title: "label", subtitle: "url" } },
});
