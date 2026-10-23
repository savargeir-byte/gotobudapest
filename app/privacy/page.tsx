import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
export const metadata: Metadata = {
  title: "Privacy | GoToBudapest",
  description: "Information about data handling, hosting and external links on the GoToBudapest visitor guide."
};
export default function PrivacyPage(){
 return <><a className="skip" href="#privacy">Skip to privacy information</a><SiteHeader/><main id="privacy">
 <section className="section editorial-intro"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Privacy</span></nav><div className="eyebrow">YOUR PRIVACY</div><h1>Privacy information.</h1><p className="editorial-subtitle">How this travel-information website works and which third-party services you might encounter.</p></section>
 <div className="section editorial-reading"><article className="editorial-copy privacy-copy">
 <section><h2>What this site provides</h2><p>GoToBudapest publishes travel guides and attraction information. The current website does not provide a user account or an on-site booking checkout. Links to official venues and other external services take you to their own websites, where their privacy terms apply.</p></section>
 <section><h2>Browsing and hosting</h2><p>Like other hosted websites, technical requests may be processed by hosting and security infrastructure to deliver pages, prevent abuse and diagnose errors. Such infrastructure may process information including IP addresses, browser information and request timestamps in accordance with its provider terms and retention settings.</p></section>
 <section><h2>External links</h2><p>Links to transport providers, museums, baths and other businesses are provided for visitor convenience. GoToBudapest does not control those websites or their tracking technologies. Review the third party’s privacy information before submitting personal or payment details.</p></section>
 <section><h2>Analytics and changes</h2><p>Site analytics, consent configuration and any other third-party integrations must be checked against the active production deployment. This page should be reviewed and updated before new tracking, booking or contact-form features are enabled.</p></section>
 <section><h2>Your questions</h2><p>For information about the organisation behind the site, see our sister website <a href="https://goicetravel.is" target="_blank" rel="noopener noreferrer">GoIceTravel ↗</a>. A verified operator contact and any legally required controller disclosures must be added before relying on this page as a complete production privacy notice.</p></section>
 <p className="editorial-notice">Editorial status: this page is a factual starting point, not a substitute for reviewing the production services and applicable privacy requirements.</p>
 </article></div></main><SiteFooter/></>;
}