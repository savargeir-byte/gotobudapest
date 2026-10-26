import { defineConfig, devices } from "@playwright/test";

// PW_BASE_URL tests an already deployed site (e.g. a Vercel preview).
// Without it the config serves the local production build on port 3100.
// PW_CHANNEL=msedge|chrome uses an installed browser instead of downloaded Chromium.
const baseURL = process.env.PW_BASE_URL || "http://localhost:3100";
const channel = process.env.PW_CHANNEL || undefined;
const bookingUi = /booking-ui.spec.ts$/;

// Vercel Deployment Protection: the owner can create a "Protection Bypass for
// Automation" secret (Project -> Settings -> Deployment Protection) and pass it here
// as PW_VERCEL_BYPASS to test a protected preview. Protection is never disabled.
const bypass = process.env.PW_VERCEL_BYPASS;
const bypassHeaders = bypass
  ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" }
  : undefined;

// Local runs start the server with a known webhook secret so signed requests can
// be tested. It is a throwaway test value, never a real secret.
if (!process.env.PW_BASE_URL)
  process.env.PW_REVALIDATE_SECRET ??= "playwright-test-secret";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL, channel, trace: "retain-on-failure", extraHTTPHeaders: bypassHeaders },
  projects: [
    {
      name: "desktop",
      testIgnore: bookingUi,
      use: {
        ...devices["Desktop Chrome"],
        channel,
        viewport: { width: 1440, height: 900 },
      },
    },
    { name: "mobile", testIgnore: bookingUi, use: { ...devices["Pixel 7"], channel } },
    // Browser-level booking tests run against a dedicated server wired to a LOCAL
    // MOCK of the provider APIs (e2e/support/mock-provider.mjs). They are mocked
    // tests only: no live provider is contacted. Skipped when testing a deployment.
    ...(process.env.PW_BASE_URL
      ? []
      : [
          {
            name: "booking-ui-desktop",
            testMatch: bookingUi,
            use: {
              ...devices["Desktop Chrome"],
              channel,
              baseURL: "http://localhost:3101",
              viewport: { width: 1440, height: 900 },
            },
          },
          {
            name: "booking-ui-mobile",
            testMatch: bookingUi,
            use: { ...devices["Pixel 7"], channel, baseURL: "http://localhost:3101" },
          },
        ]),
  ],
  webServer: process.env.PW_BASE_URL
    ? undefined
    : [
        {
          command: "npx next start -p 3100",
          url: "http://localhost:3100",
          reuseExistingServer: !process.env.CI,
          env: { SANITY_REVALIDATE_SECRET: process.env.PW_REVALIDATE_SECRET ?? "" },
          timeout: 60_000,
        },
        {
          command: "node e2e/support/mock-provider.mjs",
          url: "http://127.0.0.1:3900/__health",
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
        },
        {
          command: "npx next start -p 3101",
          url: "http://localhost:3101",
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
          env: {
            ...(process.env as Record<string, string>),
            BOOKING_MOCK_ORIGIN: "http://127.0.0.1:3900",
            // Dummy values: they only satisfy "a key is configured" checks.
            TOURDESK_API_KEY: "dummy-tourdesk-key",
            // Native checkout is default-off; the mocked browser tests exercise it.
            TOURDESK_BOOKING_ENABLED: "true",
            VIATOR_API_KEY: "dummy-viator-key",
            TIQETS_API_KEY: "dummy-tiqets-key",
            SANITY_REVALIDATE_SECRET: "dummy-secret",
            NEXT_PUBLIC_SITE_URL: "",
            VERCEL_ENV: "",
          },
        },
      ],
});
