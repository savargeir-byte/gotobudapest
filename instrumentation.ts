// Runs once when the Next.js server starts. Its only job is the loopback-only
// provider mock used by the browser booking tests (see lib/booking/test-origin.ts);
// it does nothing on Vercel production or when BOOKING_MOCK_ORIGIN is not a loopback URL.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { installProviderMock } = await import("./lib/booking/test-origin");
  installProviderMock();
}
