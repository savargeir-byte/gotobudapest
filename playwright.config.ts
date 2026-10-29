import { defineConfig, devices } from "@playwright/test";

// PW_BASE_URL tests an already deployed site (e.g. a Vercel preview).
// Without it the config serves the local production build on port 3100.
// PW_CHANNEL=msedge|chrome uses an installed browser instead of downloaded Chromium.
const baseURL = process.env.PW_BASE_URL || "http://localhost:3100";
const channel = process.env.PW_CHANNEL || undefined;
const bookingUi = /(booking-ui|marketplace-ui|viator-product|image-quality).spec.ts$/;
// Flips the shared mock provider's TourDesk scenario; runs after every other project so no
// parallel test sees an empty/401/unstable catalogue (see the dedicated project below).
const discovery = /tourdesk-discovery.spec.ts$/;
// Proves the real per-client limits on its own unscaled server (port 3102).
const rateLimits = /rate-limits.spec.ts$/;
// TourDesk is paused by default; this spec runs on its own server (port 3103) with the switch unset.
const tourdeskHidden = /tourdesk-hidden.spec.ts$/;

// The shared test servers receive every browser test from one loopback address, so they
// scale the per-address budget (honoured only off Vercel, see lib/rate-limit.ts). The
// dedicated rate-limits server does not, and no test sends a forwarded-address header.
const RATE_LIMIT_TEST_SCALE = "1000";

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
      testIgnore: [bookingUi, discovery, rateLimits, tourdeskHidden],
      use: {
        ...devices["Desktop Chrome"],
        channel,
        viewport: { width: 1440, height: 900 },
      },
    },
    { name: "mobile", testIgnore: [bookingUi, discovery, rateLimits, tourdeskHidden], use: { ...devices["Pixel 7"], channel } },
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
          {
            name: "rate-limits",
            testMatch: rateLimits,
            use: { ...devices["Desktop Chrome"], channel, baseURL: "http://localhost:3102" },
          },
          {
            name: "tourdesk-hidden-desktop",
            testMatch: tourdeskHidden,
            dependencies: ["tourdesk-discovery"],
            use: { ...devices["Desktop Chrome"], channel, baseURL: "http://localhost:3103" },
          },
          {
            name: "tourdesk-hidden-mobile",
            testMatch: tourdeskHidden,
            dependencies: ["tourdesk-hidden-desktop"],
            use: { ...devices["Pixel 7"], channel, baseURL: "http://localhost:3103" },
          },
          {
            name: "tourdesk-discovery",
            testMatch: discovery,
            dependencies: ["desktop", "mobile", "booking-ui-desktop", "booking-ui-mobile"],
            use: { ...devices["Desktop Chrome"], channel, baseURL: "http://localhost:3101" },
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
          env: { SANITY_REVALIDATE_SECRET: process.env.PW_REVALIDATE_SECRET ?? "", RATE_LIMIT_TEST_SCALE },
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
            // TourDesk is paused in the public marketplace by default; these tests keep the integration under test.
            TOURDESK_MARKETPLACE_ENABLED: "true",
            VIATOR_API_KEY: "dummy-viator-key",
            TIQETS_API_KEY: "dummy-tiqets-key",
            SANITY_REVALIDATE_SECRET: "dummy-secret",
            NEXT_PUBLIC_SITE_URL: "",
            VERCEL_ENV: "",
            RATE_LIMIT_TEST_SCALE,
          },
        },
        {
          // The DEFAULT configuration: TourDesk credentials exist but TOURDESK_MARKETPLACE_ENABLED is not set, so
          // the public marketplace must neither show nor call TourDesk (e2e/tourdesk-hidden.spec.ts).
          command: "npx next start -p 3103",
          url: "http://localhost:3103",
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
          env: {
            ...(process.env as Record<string, string>),
            BOOKING_MOCK_ORIGIN: "http://127.0.0.1:3900",
            TOURDESK_API_KEY: "dummy-tourdesk-key",
            VIATOR_API_KEY: "dummy-viator-key",
            TIQETS_API_KEY: "dummy-tiqets-key",
            SANITY_REVALIDATE_SECRET: "dummy-secret",
            NEXT_PUBLIC_SITE_URL: "",
            VERCEL_ENV: "",
            TOURDESK_MARKETPLACE_ENABLED: "",
            TOURDESK_BOOKING_ENABLED: "",
            RATE_LIMIT_TEST_SCALE,
          },
        },
        {
          // Unscaled limits: the rate-limits project proves 30 requests/minute per client.
          command: "npx next start -p 3102",
          url: "http://localhost:3102",
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
          env: {
            ...(process.env as Record<string, string>),
            BOOKING_MOCK_ORIGIN: "http://127.0.0.1:3900",
            TOURDESK_API_KEY: "dummy-tourdesk-key",
            VIATOR_API_KEY: "dummy-viator-key",
            TIQETS_API_KEY: "dummy-tiqets-key",
            SANITY_REVALIDATE_SECRET: process.env.PW_REVALIDATE_SECRET ?? "playwright-test-secret",
            NEXT_PUBLIC_SITE_URL: "",
            VERCEL_ENV: "",
            RATE_LIMIT_TEST_SCALE: "",
          },
        },
      ],
});
