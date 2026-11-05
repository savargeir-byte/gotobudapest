"use client";

export default function CookieSettingsLink() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("gtb:open-cookie-settings"))}
      style={{ font: "inherit", padding: 0, border: 0, background: "transparent", color: "inherit", textAlign: "left", cursor: "pointer" }}>
      Cookie settings
    </button>
  );
}
