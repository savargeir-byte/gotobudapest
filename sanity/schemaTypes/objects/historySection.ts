import { defineField, defineType } from "sanity";

export const historySection = defineType({
  name: "historySection",
  title: "History section",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "portableText",
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: { select: { title: "heading" } },
});
