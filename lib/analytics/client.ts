"use client";

import { createDeduper, type EventMap, type EventName } from "./events";
import { GA_MEASUREMENT_ID } from "./config";
import { createGa } from "./ga";

// The measurement ID is a public identifier (see ./config.ts); the tag still loads only after analytics consent.
const GA_ID = GA_MEASUREMENT_ID;

function loadScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

export const ga = createGa(
  GA_ID,
  typeof window === "undefined"
    ? { win: {}, doc: { cookie: "", location: { hostname: "", protocol: "" } }, loadScript: () => {} }
    : { win: window as never, doc: document as never, loadScript },
);

const deduper = createDeduper();
export const CLICK_INTERVAL_MS = 800;

/** A view or similar event that must fire once per `key` (for example the route and its navigation number). */
export function trackOnce<E extends EventName>(key: string, name: E, params: EventMap[E]): boolean {
  if (!ga.isEnabled() || !deduper.once(`${name}:${key}`)) return false;
  return ga.send(name, params);
}

/** A user action: at most once per interval for the same event and parameters, so a double click counts once. */
export function track<E extends EventName>(name: E, params: EventMap[E]): boolean {
  if (!ga.isEnabled() || !deduper.within(`${name}:${JSON.stringify(params)}`, CLICK_INTERVAL_MS)) return false;
  return ga.send(name, params);
}
