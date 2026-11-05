"use client";

import { openConsentSettings } from "@/lib/consent/store";

// Permanent footer control: reopens the preferences so consent can be changed or withdrawn at any time.
export default function CookieSettingsLink() {
  return (
    <button type="button" className="footer-link-button" onClick={openConsentSettings}>
      Cookie settings
    </button>
  );
}
