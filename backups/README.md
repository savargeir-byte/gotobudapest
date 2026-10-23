# Content backups

`local-content-2026-10-23.json` is a snapshot of all GoToBudapest content as it
existed in the repository before the Sanity migration:

- `attractions`: the 100 directory entries (`lib/attractions.json`) with their resolved
  photograph and editorial order
- `guides`: the 8 travel guides (`lib/guides.ts`, including the Downtown Pest and Food &
  Markets guides)
- `experiences` and `neighbourhoods` (`lib/topics.ts`)
- `photos`: every photograph record with author, licence and source URL (`lib/photos.json`)

Regenerate it with `npx tsx scripts/export-local-content.ts` (the date in the file name
is fixed to the migration date; copy the file if you want another dated snapshot).

## Rolling back

The original sources (`lib/attractions.json`, `lib/guides.ts`, `lib/topics.ts`,
`lib/photos.json`, `public/assets`) remain in the repository and are the site's fallback
when Sanity is empty or unreachable. To go back to them completely:

1. Remove or unset `SANITY_API_TOKEN` and set `SANITY_SEED_ON_BUILD=0` in Vercel, so
   no further seeding happens.
2. Deploy the previous Vercel deployment (Deployments → Promote to Production), or
   delete the documents in the dataset (Studio, or `npx sanity documents delete`).

Seeding only ever *creates* missing documents (`createIfNotExists`), so editors'
changes made in Studio are never overwritten by a re-run.
