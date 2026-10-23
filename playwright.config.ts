import { defineConfig, devices } from "@playwright/test";

// PW_BASE_URL tests an already deployed site (e.g. a Vercel preview).
// Without it the config serves the local production build on port 3100.
// PW_CHANNEL=msedge|chrome uses an installed browser instead of downloaded Chromium.
const baseURL = process.env.PW_BASE_URL || "http://localhost:3100";
const channel = process.env.PW_CHANNEL || undefined;

// Local runs start the server with a known webhook secret so signed requests can
// be tested. It is a throwaway test value, never a real secret.
if (!process.env.PW_BASE_URL)
  process.env.PW_REVALIDATE_SECRET ??= "playwright-test-secret";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL, channel, trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        channel,
        viewport: { width: 1440, height: 900 },
      },
    },
    { name: "mobile", use: { ...devices["Pixel 7"], channel } },
  ],
  webServer: process.env.PW_BASE_URL
    ? undefined
    : {
        command: "npx next start -p 3100",
        url: "http://localhost:3100",
        reuseExistingServer: !process.env.CI,
        env: { SANITY_REVALIDATE_SECRET: process.env.PW_REVALIDATE_SECRET ?? "" },
        timeout: 60_000,
      },
});
