import { defineField, defineType } from "sanity";

export const topicSection = defineType({
  name: "topicSection",
  title: "Section",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "body", title: "Body", type: "portableText" }),
  ],
  preview: { select: { title: "title" } },
});
