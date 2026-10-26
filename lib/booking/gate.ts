// Native TourDesk checkout gate, default OFF.
//
// PORTED from the references (identical semantics in both):
//   GoIceTravel src/lib/tourdesk/bookingGate.ts + config.ts
//   goTene      src/lib/providers/tourdesk/config.ts (isTourdeskBookingEnabledFor)
//
// Evaluation order, first match wins; fails CLOSED:
//   1. TOURDESK_BOOKING_ENABLED === "true"  -> every technically compatible product
//   2. TOURDESK_PILOT_KEYS lists the uniqueKey (comma list, each like 123-4)
// Any other value of TOURDESK_BOOKING_ENABLED (including "false") is simply "not
// enabled globally"; as in both references a listed pilot key still enables that one
// product. Remove the key from TOURDESK_PILOT_KEYS to switch it off.
//
// The server re-evaluates this gate in the checkout API; the product page uses it only
// to decide between the native widget and the provider handoff link.
type Env = Record<string, string | undefined>;

export function isTourdeskBookingEnabled(env: Env = process.env): boolean {
  return env.TOURDESK_BOOKING_ENABLED === "true";
}

export function getTourdeskPilotKeys(env: Env = process.env): Set<string> {
  return new Set(
    (env.TOURDESK_PILOT_KEYS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\d+-\d+$/.test(s)),
  );
}

export function isTourdeskPilotKey(uniqueKey: string, env: Env = process.env): boolean {
  return /^\d+-\d+$/.test(uniqueKey) && getTourdeskPilotKeys(env).has(uniqueKey);
}

export function isTourdeskBookingEnabledFor(
  uniqueKey: string,
  env: Env = process.env,
): boolean {
  return isTourdeskBookingEnabled(env) || isTourdeskPilotKey(uniqueKey, env);
}
