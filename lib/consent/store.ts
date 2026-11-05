"use client";

import { useSyncExternalStore } from "react";
import {
  ALL_DENIED,
  cookieHeaderValue,
  makeRecord,
  readFromCookieString,
  type ConsentChoices,
  type ConsentRecord,
} from "./consent";

// Small client store for the visitor's consent. Server and first client render both see "not ready", so the
// pages stay static and nothing optional can run before the cookie has been read.
export type ConsentAction = "accept_all" | "reject_all" | "custom" | "withdraw";
export type ConsentState = {
  ready: boolean;
  record: ConsentRecord | null;
  settingsOpen: boolean;
  // How the current record came about; null when it was read from an earlier visit.
  lastAction: ConsentAction | null;
};

let state: ConsentState = { ready: false, record: null, settingsOpen: false, lastAction: null };
const listeners = new Set<() => void>();
const SERVER_STATE: ConsentState = state;

function set(next: Partial<ConsentState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function initConsent() {
  if (state.ready) return;
  set({ ready: true, record: readFromCookieString(document.cookie) });
}

export function saveConsent(choices: Partial<Omit<ConsentChoices, "necessary">>, action: ConsentAction) {
  const record = makeRecord(choices);
  document.cookie = cookieHeaderValue(record, window.location.protocol === "https:");
  set({ record, settingsOpen: false, lastAction: action });
  return record;
}

export const openConsentSettings = () => set({ settingsOpen: true });
export const closeConsentSettings = () => set({ settingsOpen: false });

/** The current choices, read live (for callbacks that must not rely on a stale render). */
export const currentChoices = (): ConsentChoices => state.record?.choices ?? ALL_DENIED;

export function useConsent(): ConsentState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => SERVER_STATE,
  );
}
