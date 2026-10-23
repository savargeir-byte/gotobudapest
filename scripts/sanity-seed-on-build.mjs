// Runs before `next build` on Vercel to seed Sanity with the local content.
// It never fails the build: if anything is missing or goes wrong the site
// simply falls back to the local content. The token is never printed.
import { spawnSync } from "node:child_process";

const log = (message) => console.log(`[sanity-seed] ${message}`);

if (process.env.SANITY_SEED_ON_BUILD === "0") {
  log("skipped (SANITY_SEED_ON_BUILD=0).");
  process.exit(0);
}
if (!process.env.SANITY_API_TOKEN?.trim()) {
  log("skipped (SANITY_API_TOKEN is not set).");
  process.exit(0);
}
if ((process.env.CI || process.env.GITHUB_ACTIONS) && !process.env.VERCEL) {
  log("skipped (CI outside Vercel never writes to the dataset).");
  process.exit(0);
}

log("seeding missing documents (createIfNotExists, edits are never overwritten)...");
const result = spawnSync("npx", ["tsx", "scripts/sanity-seed.ts"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});
if (result.status !== 0) {
  log("seeding did not complete; continuing the build with local content as fallback.");
}
process.exit(0);
