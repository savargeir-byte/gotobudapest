import type { Metadata } from "next";
import { NextStudio } from "next-sanity/studio";
import { metadata as studioMetadata } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

export { viewport } from "next-sanity/studio";

export const metadata: Metadata = {
  ...studioMetadata,
  title: { absolute: "GoToBudapest Studio" },
  robots: { index: false, follow: false },
  alternates: {},
  openGraph: null,
  twitter: null,
};

export default function StudioPage() {
  return <NextStudio config={config} />;
}
