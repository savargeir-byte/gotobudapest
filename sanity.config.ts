"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { media } from "sanity-plugin-media";
import { apiVersion, dataset, projectId, studioBasePath } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { singletonTypes, structure } from "./sanity/structure";

// "use client" lets the server-rendered Studio page pass this config to the
// client-side Studio (next-sanity pattern).
//
// Authentication is Sanity's own: only project members can open or edit
// content in the Studio. No anonymous or custom login providers are configured.
export default defineConfig({
  name: "gotobudapest",
  title: "GoToBudapest",
  projectId,
  dataset,
  basePath: studioBasePath,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    media(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    // Singletons: no duplicate / unpublish / delete.
    actions: (input, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? input.filter(
            ({ action }) =>
              action !== undefined &&
              !["unpublish", "delete", "duplicate"].includes(action),
          )
        : input,
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter(({ templateId }) => !singletonTypes.has(templateId))
        : prev,
  },
});
