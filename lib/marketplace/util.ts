import { createHash } from "node:crypto";
import { DURATIONS, type MarketplaceQuery } from "./types";

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function minutesLabel(min: number): string {
  if (min < 60) return `${min} min`;
  if (min >= 1440 && min % 1440 === 0) {
    const d = min / 1440;
    return d === 1 ? "1 day" : `${d} days`;
  }
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : h === 1 ? "1 hour" : `${h} hours`;
}

// Best-effort parse of a duration string a provider supplied ("2 hours",
// "1.5 hours", "90 minutes", "2h 30m"). Returns undefined when unsure: a
// duration is never guessed.
export function parseDurationMinutes(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return Math.round(value);
  if (typeof value !== "string") return undefined;
  const s = value.toLowerCase();
  let total = 0;
  let found = false;
  const re = /(\d+(?:[.,]\d+)?)\s*(days?|d|hours?|hrs?|h|minutes?|mins?|m)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const n = Number(m[1].replace(",", "."));
    const u = m[2];
    found = true;
    if (u.startsWith("d")) total += n * 1440;
    else if (u.startsWith("h")) total += n * 60;
    else total += n;
  }
  return found && total > 0 ? Math.round(total) : undefined;
}

export function inDurationBucket(minutes: number | undefined, key: MarketplaceQuery["duration"]): boolean {
  if (!key) return true;
  if (minutes === undefined) return false;
  const b = DURATIONS.find((d) => d.key === key)!;
  return minutes >= b.fromMin && (b.toMin === null || minutes < b.toMin);
}

export const shortHash = (s: string, len = 6) =>
  createHash("sha1").update(s).digest("base64url").slice(0, len);

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
