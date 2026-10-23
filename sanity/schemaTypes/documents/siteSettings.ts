import { defineField, defineType } from "sanity";
import { refArray } from "./shared";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Site title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({
      name: "description",
      title: "Default meta description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "defaultShareImage",
      title: "Default share image",
      type: "photo",
    }),
    refArray(
      "featuredAttractions",
      "Homepage: featured attractions",
      "attraction",
      { max: 9, group: null },
    ),
    refArray("featuredGuides", "Homepage: featured guides", "guide", {
      max: 6,
      group: null,
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
