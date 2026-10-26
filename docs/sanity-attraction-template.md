# Sanity Attraction Template — Galleries, History, Legends & Stories

GoToBudapest project `ut6qxuke`, dataset `production`, Studio route `/studio`.

This document is a migration specification for the in-progress secure Sanity CMS integration. The attraction gallery and history currently render from the reviewed static sources `lib/attraction-galleries.ts` and `lib/attraction-editorial.ts`. The six featured Hospital in the Rock museum photographs already exist as Sanity image assets and can be referenced by the supplied `sanityAssetId` values. They are **not yet attached to an attraction document in Sanity**.

## Proposed fields

`attraction` document:
- Stable slug, title, SEO title/description, category and optional district/region
- Short description and long editorial introduction
- `heroImage` as `licensedImage`
- `gallery` array of **ordered `licensedImage` objects**; 3–8 distinct, place-accurate photos recommended where legitimate images exist
- `historySections`: array of `{ heading, body: PortableText[] }`, sourced, dated/reviewed
- `legendsAndStories`: array of `{ title, kind, body: PortableText[], sourceUrl, sourceLabel }`; kind enum: `historical-account`, `local-tradition`, `religious-tradition`. Never present a tradition as established historical fact or invent a supernatural legend for a venue that has none
- `visitInformation`: operator URL, check date, optional verified status/notice, accessibility notes
- `address`, `geo` (only verified)
- `relatedAttractions`, `relatedGuides`, `relatedExperiences`
- `sources`: label, URL, last fact-check
- Draft/published state via Sanity's native authentication, permissions and publication flow

`licensedImage` object:
- image asset reference (`sanity.image`), asset hotspot/crop
- alt, caption, creator, license type, license URL, original source URL
- optional explicit `photoSubject` label and `photoDate`
- validation for alt/credit/source/license before publication; allow CC0 and Public Domain
- no unrestricted remote links pasted as image assets

## Editorial and accessibility requirements

- Attraction page: existing hero, then an optional photo gallery, then a factual history, then *Stories & traditions* only when documented, then operator and visitor details
- Each photo must depict the named attraction; photos of neighbouring places can appear only when explicitly labelled as **context** and should not silently count as photos of the venue
- Gallery: keyboard-operable controls, image captions with attribution, adaptive layouts and large-image view
- Never manufacture a second gallery image by duplicating the hero. Prefer a truthful, single-photo page while real media is sought
- Do not publish photos on the basis of search thumbnails without checking source licensing and identity
- The source site provides reference information, not copyrighted prose for verbatim reuse
- Use independent original English prose for history and narrative; preserve accurate sourcing and factual qualifications
- Do not claim visitors can access closed museums, baths or caves without operator verification
- History and local-tradition fields should be optional; mark outstanding research explicitly instead of auto-generating unsupported facts

## Idempotent migration

1. Reconcile in-progress Sanity work and current main before changing schema or public routes.
2. Create `licensedImage`, `historySection`, `historicalStory` and `attraction` schema fields.
3. Import current attraction data with stable IDs; never duplicate records.
4. For Hospital in the Rock resolve its six `sanityAssetId` references directly to `gallery[].asset._ref`, keeping captions, author names, CC BY-SA 4.0 and Commons source URL.
5. Upload the corresponding local photographs for other attractions only with verifiable source and license.
6. Migrate historical accounts from `lib/attraction-editorial.ts` preserving all source citations and classification.
7. Test editing, reordering, adding and removing gallery images and history sections inside Studio, then signed revalidation in public pages.
8. Verify drafts cannot leak; validate upload types and external URLs; restrict edit roles and webhook credentials.
9. Keep the existing static data and safe rollback path until preview/production testing passes.
10. No Trip Planner, TourDesk, Viator or Tiqets integration in this stage.

## Recommended content target

- Priority A: Hospital in the Rock, Parliament, Fisherman's Bastion, Matthias Church, St Stephen's Basilica, Castle Hill, Chain Bridge, Széchenyi Baths, Great Market Hall and major museums/churches
- Priority B: all 100 existing attractions with accurate short descriptions, then carefully selected additional sights (without duplicate slugs), including central Budapest churches and historic synagogues
- Each public attraction should at least have a real hero image; a 3+ image gallery is desirable only when enough suitable, licensable photos exist.

## Acceptance tests

- 6 distinct photos at `/attractions/hospital-in-the-rock` with correct credits
- The museum's documented history and accounts distinguish facts from misconceptions
- Editor can change captions, rearrange gallery items, update a history, and publish within Sanity Studio
- Playwright verifies gallery on mobile/desktop, keyboard controls, no overflow and image loading
- Approved sources remain accessible in the rendered page
