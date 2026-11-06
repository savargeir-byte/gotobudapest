"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ALL_DENIED, type ConsentChoices } from "@/lib/consent/consent";
import {
  closeConsentSettings,
  initConsent,
  openConsentSettings,
  saveConsent,
  useConsent,
  type ConsentAction,
} from "@/lib/consent/store";

// First layer: one short notice with three buttons of the same size and weight. Nothing optional is on until the
// visitor chooses. Second layer: a modal with one switch per optional category, all off by default.
// The same dialog opens from "Cookie settings" in the footer, so consent can be changed or withdrawn at any time.

type Optional = "analytics" | "functional" | "marketing";
const CATEGORIES: { key: Optional; title: string; text: string }[] = [
  {
    key: "analytics",
    title: "Analytics",
    text: "Counts visits and shows which pages and tours are looked at, so we can improve the site. Uses Google Analytics 4 (when configured) and Vercel Web Analytics. Off until you allow it.",
  },
  {
    key: "functional",
    title: "Functional personalisation",
    text: "Would remember preferences such as your language or favourites between visits. The site does not use any such feature today, so this switch currently changes nothing.",
  },
  {
    key: "marketing",
    title: "Marketing and advertising",
    text: "Would allow advertising and remarketing measurement. No advertising tag is installed today, so this switch currently changes nothing beyond keeping Google's advertising signals denied.",
  },
];

export default function ConsentManager() {
  const { ready, record, settingsOpen } = useConsent();
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<ConsentChoices>(ALL_DENIED);

  useEffect(() => initConsent(), []);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (settingsOpen && !el.open) {
      setDraft(record?.choices ?? ALL_DENIED);
      el.showModal();
    }
    if (!settingsOpen && el.open) el.close();
  }, [settingsOpen, record]);

  if (!ready) return null;

  const choose = (choices: Partial<Omit<ConsentChoices, "necessary">>, action: ConsentAction) => saveConsent(choices, action);
  const acceptAll = () => choose({ analytics: true, functional: true, marketing: true }, "accept_all");
  const rejectAll = () => choose({}, record?.choices.analytics ? "withdraw" : "reject_all");
  const saveDraft = () => {
    const none = !draft.analytics && !draft.functional && !draft.marketing;
    const all = draft.analytics && draft.functional && draft.marketing;
    choose(draft, none ? (record?.choices.analytics ? "withdraw" : "reject_all") : all ? "accept_all" : "custom");
  };

  return (
    <>
      {!record ? (
        <section className="consent-banner" role="region" aria-labelledby="consent-title" data-testid="consent-banner">
          <div className="consent-text">
            <h2 id="consent-title">Your privacy choices</h2>
            <p>
              We always use the storage the site needs to work. With your permission we also use optional analytics to
              understand how the site is used. Nothing optional runs until you choose.{" "}
              <Link href="/privacy#cookies">Cookie and privacy details</Link>
            </p>
          </div>
          <div className="consent-actions">
            <button type="button" className="consent-btn" onClick={rejectAll}>
              Reject all
            </button>
            <button type="button" className="consent-btn" onClick={openConsentSettings}>
              Manage preferences
            </button>
            <button type="button" className="consent-btn" onClick={acceptAll}>
              Accept all
            </button>
          </div>
        </section>
      ) : null}

      <dialog
        ref={dialog}
        className="consent-dialog"
        aria-labelledby="consent-dialog-title"
        onClose={() => closeConsentSettings()}
        data-testid="consent-dialog"
      >
        <form
          method="dialog"
          onSubmit={(e) => {
            e.preventDefault();
            saveDraft();
          }}
        >
          <h2 id="consent-dialog-title">Cookie settings</h2>
          <p className="consent-intro">
            Choose which optional categories you allow. You can change this at any time from &ldquo;Cookie settings&rdquo; in
            the footer. <Link href="/privacy#cookies">Full cookie inventory</Link>
          </p>
          <fieldset>
            <legend className="sr">Cookie categories</legend>
            <div className="consent-row">
              <div>
                <strong>Strictly necessary</strong>
                <p>Remembers your cookie choice and keeps the site secure and working. Always on; it does not need consent.</p>
              </div>
              <label className="consent-switch">
                <input type="checkbox" checked disabled aria-label="Strictly necessary, always on" />
                <span aria-hidden="true">Always on</span>
              </label>
            </div>
            {CATEGORIES.map((c) => (
              <div className="consent-row" key={c.key}>
                <div>
                  <strong id={`consent-${c.key}`}>{c.title}</strong>
                  <p>{c.text}</p>
                </div>
                <label className="consent-switch">
                  <input
                    type="checkbox"
                    checked={draft[c.key]}
                    aria-labelledby={`consent-${c.key}`}
                    onChange={(e) => setDraft({ ...draft, [c.key]: e.target.checked })}
                  />
                  <span aria-hidden="true">{draft[c.key] ? "On" : "Off"}</span>
                </label>
              </div>
            ))}
          </fieldset>
          <div className="consent-actions">
            <button type="button" className="consent-btn" onClick={rejectAll}>
              Reject all
            </button>
            <button type="submit" className="consent-btn">
              Save my choices
            </button>
            <button type="button" className="consent-btn" onClick={acceptAll}>
              Accept all
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
