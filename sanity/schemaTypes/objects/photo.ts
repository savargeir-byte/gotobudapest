import { defineField, defineType } from "sanity";
import { apiVersion } from "../../env";

const MAX_BYTES = 10 * 1024 * 1024;
const httpsOnly = { scheme: ["https"] };

export const photo = defineType({
  name: "photo",
  title: "Photo",
  type: "image",
  options: { hotspot: true, accept: "image/jpeg,image/png,image/webp" },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      description:
        "Describe what is visible in the photo (15–200 characters). Required whenever an image is set.",
      type: "string",
      validation: (rule) =>
        rule.custom((alt, context) => {
          const parent = context.parent as { asset?: unknown } | undefined;
          if (!parent?.asset) return true;
          if (!alt || alt.trim().length < 15)
            return "Alt text is required (at least 15 characters).";
          if (alt.length > 200) return "Keep alt text under 200 characters.";
          return true;
        }),
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({
      name: "creditTitle",
      title: "Source file title",
      type: "string",
    }),
    defineField({
      name: "creditAuthor",
      title: "Photographer / author",
      type: "string",
    }),
    defineField({
      name: "creditLicense",
      title: "Licence",
      description: "e.g. CC BY-SA 4.0, CC0, Public domain, Unsplash License.",
      type: "string",
    }),
    defineField({
      name: "creditLicenseUrl",
      title: "Licence URL",
      type: "url",
      validation: (rule) => rule.uri(httpsOnly),
    }),
    defineField({
      name: "creditSourceUrl",
      title: "Source page URL",
      description: "Where the photo and its licence can be verified.",
      type: "url",
      validation: (rule) => rule.uri(httpsOnly),
    }),
  ],
  validation: (rule) =>
    rule.custom(async (value, context) => {
      const ref = (value as { asset?: { _ref?: string } } | undefined)?.asset
        ?._ref;
      if (!ref) return true;
      const size = await context
        .getClient({ apiVersion })
        .fetch<number | null>("*[_id == $id][0].size", { id: ref });
      if (typeof size === "number" && size > MAX_BYTES)
        return "Image is larger than 10 MB. Upload a smaller file.";
      return true;
    }),
});
