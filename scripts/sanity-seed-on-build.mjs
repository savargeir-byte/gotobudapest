// Optional: seeds Sanity with the local content before `next build`.
//
// OFF by default. A normal build never writes to the production dataset. Enable it
// deliberately for one build by setting SANITY_SEED_ON_BUILD=1 (and a server-only
// SANITY_API_TOKEN with write access) in the Vercel environment scope you intend,
// or use the manual "Seed Sanity" GitHub workflow / `npm run sanity:seed` instead.
// The seed is createIfNotExists only (edits are never overwritten), never fails the
// build, and never prints the token. Every skip reason is logged so the Vercel build
// log shows exactly why nothing was written.
import { spawnSync } from "node:child_process";

const log = (message) => console.log(`[sanity-seed] ${message}`);
const exit = (message) => {
  log(message);
  process.exit(0);
};

if (process.env.SANITY_SEED_ON_BUILD !== "1")
  exit("skipped (opt-in: SANITY_SEED_ON_BUILD is not 1; builds do not write to Sanity by default).");
if (!process.env.SANITY_API_TOKEN?.trim())
  exit("skipped (SANITY_API_TOKEN is not available in this build environment/scope).");
if ((process.env.CI || process.env.GITHUB_ACTIONS) && !process.env.VERCEL)
  exit("skipped (CI outside Vercel never writes to the dataset).");

log(`seeding missing documents (createIfNotExists; VERCEL_ENV=${process.env.VERCEL_ENV ?? "n/a"})...`);
const result = spawnSync("npx", ["tsx", "scripts/sanity-seed.ts"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});
log(
  result.status === 0
    ? "seed finished."
    : `seed did not complete (exit ${result.status}); continuing with local content as fallback.`,
);
process.exit(0);
