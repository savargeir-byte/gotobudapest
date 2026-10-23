# Sanity editorial Guide Template — migration contract

This is a design specification for **the subsequent Sanity phase**, not an implemented Studio integration. The current website still uses the static guides in `lib/guides.ts` and the image placement manifest in `lib/inline-photos.ts`.

## Goal

Editors must be able to create and reorder richly photographed Budapest guides inside the secure Sanity Studio at `/studio`, without editing TypeScript.

## Suggested schema

Create a `guide` document with:

- `title`, `slug.current`, `shortTitle`, `category`, `description`, `updatedAt`, `publishedAt`.
- `seo`: meta title, meta description, canonical path (internal routes only), share image.
- `hero`: a `licensedImage` object including asset reference, alt, caption, author, license, licenseUrl, originalSourceUrl, image hotspot/crop.
- `intro`: short, accessible lead text.
- `highlights`: 3–6 short strings.
- `body`: **ordered Portable Text blocks** for normal paragraphs and H2/H3 headings, plus image/gallery objects between any paragraphs.
- `faqs`: question and answer objects.
- `sources`: labelled verified source URL + last-checked date.
- `relatedGuides`: references, and optionally `relatedAttractions` references.
- `status`: validation/review workflow handled using authorized Studio permissions and published/draft state.

The `body` Portable Text array should permit:

1. Rich text with headings, bullet lists, internal and external links.
2. `editorialImage` referencing `licensedImage`, with optional caption and placement style (standard / wide).
3. `editorialGallery` object containing 2–4 `licensedImage` entries (not a bare nested array).
4. Optional `editorialCallout` with short text.
5. Optional `attractionReference` cards that resolve to a published attraction.

Image fields must validate alt text, captions, credit, license and source URL for Commons-licensed photos. Reject unsafe links and unsupported file types. Use responsive sizes, image hotspots, alt text and visible attribution on the public website.

## Rendering

- Reuse `components/editorial-inline-photo.tsx` visual spacing, aspect ratio, caption hierarchy and Wikimedia attribution layout.
- Use `next-sanity` and Sanity's Portable Text React renderer, defining safe custom components for `editorialImage`, `editorialGallery` and related-place objects.
- Sanitize/allowlist links, avoid `dangerouslySetInnerHTML`, keep draft and preview data authenticated and server-only.
- Render public content from published Sanity documents; do not leak an Editor API token into a browser.
- Make the gallery responsive without CLS, with small-screen image variants and no horizontal overflow.
- Optional editorial validation warning for a guide over ~600 words with no inline image, but do not hard-fail short or accessibility-focused guides.
- Do not load unrestricted remote images; retain Sanity CDN configuration only as explicitly approved.

## Migration of the existing live guides

1. Audit and reconcile current `main`, pending PRs, and in-progress Sanity work before changing anything.
2. Import existing six guide articles, preserving slugs, FAQ, source links, SEO and headings.
3. Convert each current guide section to ordered H2 and paragraph Portable Text blocks. Insert each `lib/inline-photos.ts` image block **after the specified section**, preserving user-selected captions and credits.
4. Resolve each `photoKey` using `lib/photos.json`; upload or reference the corresponding locally licensed source image without inventing usage rights or losing metadata. Do not treat existing local file paths as a Sanity asset ID.
5. Use deterministic document identifiers so re-running the migration is idempotent. Preserve backup JSON and rollback behavior.
6. Verify every image source, license credit and route before switching reads from static to Sanity.
7. Confirm `/studio` authenticated editing, draft previews, publish, revalidation via signed webhook, mobile visual QA and site speed.
8. Do not add Trip Planner. Do not add TourDesk, Viator or Tiqets in this phase.

## QA acceptance

- Editor can drag images before/after headings without code changes.
- A two- or three-image gallery can be positioned anywhere in the guide.
- Published guide renders the exact editorial order, captions, image credits, alt text and related links.
- All existing guide slugs remain stable and SEO metadata survives migration.
- Unauthenticated users cannot see drafts, modify content or trigger arbitrary webhook actions.
