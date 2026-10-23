// Public Sanity configuration. The project ID and dataset name are not secrets
// (they appear in every public CDN URL), so safe defaults are provided. Anything
// that grants access (tokens, webhook secrets) lives in server-only modules.
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "ut6qxuke";
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
// Pinned API version: content queries must not change behaviour silently.
export const apiVersion = "2026-10-01";
// The Studio is embedded in the website at this path.
export const studioBasePath = "/studio";
