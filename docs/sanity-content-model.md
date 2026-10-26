# Sanity content model (project `ut6qxuke`, dataset `production`)

This is the contract between the Studio schemas (`sanity/schemaTypes`), the seed
script (`scripts/sanity-seed.ts`) and the website queries (`lib/sanity/queries.ts`).
Change all three together.

## Principles

- Only published documents are read by the public website (no drafts, no preview
  tokens, no Draft Mode).
- The website reads with the public, token-less client. `SANITY_API_TOKEN` is used
  only by the seed script on the server/build machine.
- No invented data: missing coordinates, images, hours, prices or ratings stay empty.
- Stable IDs make seeding idempotent (`createIfNotExists`; never overwrites edits).

## Document IDs

| Type | `_id` |
| --- | --- |
| attraction | `attraction.<slug>` |
| guide | `guide.<slug>` |
| experience | `experience.<slug>` |
| neighbourhood | `neighbourhood.<slug>` |
| region | `region.<slug>` (`buda`, `pest`) |
| category | `category.<kind>-<slug>` (e.g. `category.attraction-landmarks`, `category.guide-itineraries`) |
| siteSettings | `siteSettings` (singleton) |

`slug` is a Sanity `slug` field (`slug.current`) and equals the existing URL slug.

## Shared object types

- `photo` — `image` (hotspot on, accept jpeg/png/webp, max 10 MB) with string fields:
  `alt` (required, 15–200 chars), `caption`, `creditTitle`, `creditAuthor`,
  `creditLicense`, `creditLicenseUrl` (https), `creditSourceUrl` (https).
- `portableText` — array of blocks. Styles: normal, h3, h4, blockquote. Lists: bullet,
  number. Marks: strong, em. Annotation: `link` with `href` (https/mailto only).
  No raw HTML, no custom executable types.
- `historySection` — `heading` (required), `body` (portableText, required).
- `historicalStory` — `kind` (`historical-account` | `local-tradition` | `religious-tradition`), `title`,
  `body` (portableText), `sourceUrl` (https, required), `sourceLabel` (required). A tradition is never
  presented as established fact; the kind is shown on the page.
- `seo` — `title` (≤ 70), `description` (≤ 170).
- `sourceLink` — `label`, `url` (https only).
- `faq` — `question`, `answer` (text).
- `guideSection` — `id` (string, anchor), `title`, `body` (portableText).
- `topicSection` — `title`, `body` (portableText).

## Documents

### category
`title`, `slug`, `kind` ("attraction" | "guide"), `description`.

### region (district)
`title`, `slug`, `description`, `heroImage` (photo).

### attraction
`name`, `slug`, `category` (ref category, kind=attraction), `region` (ref region,
optional), `description` (text, required), `body` (portableText, optional),
`heroImage` (photo), `gallery` (array of photo), `address`, `location` (geopoint, only
when official coordinates exist), `operatingStatus` (string, e.g. "Closed for
renovation"), `notice`, `sourceUrl` (https, required), `sourceLabel`, `additionalSource`
(https), `checked` (date), `seo`, `relatedAttractions`, `relatedGuides`,
`relatedExperiences` (arrays of refs), `historyIntro` (text), `historySections` (array of
historySection), `stories` (array of historicalStory), `historySources` (array of sourceLink), `order` (number — editorial order), `featured`
(boolean), `publishedAt` (datetime).

### guide
`title`, `shortTitle`, `slug`, `category` (ref category, kind=guide), `description`,
`heroImage` (photo), `gallery`, `intro` (text), `highlights` (array of string),
`sections` (array of guideSection), `faqs` (array of faq), `sources` (array of
sourceLink), `relatedGuides` (refs), `relatedAttractions` (refs), `seo`, `updated`
(date), `publishedAt` (datetime), `order` (number).

### experience and neighbourhood
`title`, `slug`, `eyebrow`, `summary`, `heroImage` (photo), `gallery`, `intro` (text),
`highlights` (strings), `sections` (array of topicSection), `faqs`, `placesHeading`,
`placesIntro`, `places` (ordered array of refs to attraction), `guides` (ordered refs to
guide), `sources` (sourceLink[]), `seo`, `order`, `publishedAt`. Neighbourhood adds
`region` (ref region).

### siteSettings (singleton)
`title`, `tagline`, `description`, `defaultShareImage` (photo), `featuredAttractions`
(refs, ordered), `featuredGuides` (refs, ordered), `seo`.

## Seeding

`scripts/sanity-seed.ts` reads the existing local content (`lib/attractions.json`,
`lib/guides.ts`, `lib/topics.ts`, `lib/photos.json`, `public/assets`) and creates
documents with `createIfNotExists` in transactions of ≤ 50 mutations. Images are
uploaded with `client.assets.upload` (Sanity de-duplicates by content hash). It prints
only counts. `--dry-run` builds and validates every document without a token.

## History and galleries

63 attractions carry a history (14 stories) and 13 carry a gallery (37 images), migrated unchanged
from `lib/attraction-editorial*.ts` and `lib/attraction-galleries.ts`. Gallery images are `photo`
objects (alt text, caption, credit). The six Hospital in the Rock photographs reuse the Sanity assets that
already exist (their `sanityAssetId`s are validated and referenced, not re-uploaded); local files are
uploaded once. On the website a Sanity attraction that has no history or gallery falls back per attraction
to the local modules until the migration is checked in Studio. Attractions without a researched history
get none: nothing is generated.

## Rollback

The local content files stay in the repository and are the automatic fallback when
Sanity is empty or unreachable. `backups/` holds a dated JSON export of that content.
