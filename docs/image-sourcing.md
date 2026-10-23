# Image sourcing

Photographs in `public/assets/photos/` come from Wikimedia Commons. Credits and licences are in
`lib/photos.json` (used by the site) and `docs/image-credits.json` (flat list, verified 2026-10-23).

## Method

1. `scripts/find-images.mjs` – first pass: Wikipedia lead image for each attraction.
2. `scripts/collect-candidates.mjs` – Commons search (English and Hungarian names) and Commons
   category listings. Only CC0, CC BY, CC BY-SA and public-domain files at least 1000 px wide,
   JPEG/PNG, and not logos, maps or plans, are kept. Up to eight candidates per place are
   downloaded as thumbnails and arranged in labelled contact sheets.
3. Every accepted photograph was looked at on a contact sheet and judged to show the right place.
   File names and Commons category names were used as a second check. `scripts/photo-picks.json`
   records which candidate was chosen, plus the alt text.
4. `scripts/build-photos.mjs` downloads the chosen files, auto-rotates them and writes
   640 px and 1280 px WebP versions, then writes the credit files.
5. `scripts/verify-photos.mjs` re-checks that files exist, licences are allowed and every Commons
   file page returns HTTP 200.

## Coverage

94 of 100 attractions have a photograph. No acceptable photograph was found for:
`szamos-chocolate-museum`, `ikono-budapest`, `budapest-history-museum`, `budapest-gallery`,
`museum-of-illusions`, `lupa-beach`.

## Rejected matches

First-pass matches that were wrong and are not used: `budapest-gallery` (London National Gallery),
`hungarian-heritage-house` (State Opera), `madame-tussauds-budapest` first match (London),
`vaci-street` first match (street sign), `light-art-museum-lam` first match (unrelated art),
`national-dance-theatre` first match (Urania cinema; the Millenáris building is used instead),
`museum-of-illusions` (Antwerp), `szamos-chocolate-museum` (Szentendre marzipan museum),
`lupa-beach` (Commons category files are of Szentendre), `the-1956-monument` first match
(Gloria Victis, a different memorial), `obuda-museum` first match (unlabelled exhibition),
`vasarely-museum-budapest` first match (Museum of Fine Arts photo). Historic black-and-white
archive photographs were not used where the place has changed (Rudas, Tabán, Trinity Square).

## Notes

- Photos shown for a housing building are described as such in the alt text, for example the
  Hungarian National Gallery (Buda Castle palace), the Ludwig Museum (Palace of Arts) and the
  Fradi Museum (Groupama Aréna).
- CC BY and CC BY-SA licences require attribution. Display the credit from `lib/photos.json`
  next to or on the page for each photograph.
