import { defineField, defineType } from "sanity";

export const guideSection = defineType({
  name: "guideSection",
  title: "Guide section",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "Anchor ID",
      description: "Used in the table of contents link, e.g. before-you-start.",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only."),
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "body", title: "Body", type: "portableText" }),
  ],
  preview: { select: { title: "title", subtitle: "id" } },
});
