// Which providers the PUBLIC marketplace uses. SERVER-SIDE ONLY: it reads the runtime environment, so
// client components receive the result (a list of provider names) as data and never import this.
//
// TourDesk is paused until the owner provides a replacement or newly authorised API access (its search
// answers HTTP 500 for the account; see docs/MASTER_TODO.md B-006 and B-007). The integration is NOT
// removed: the adapter, discovery, booking engine, normalisation, tests and configuration all stay. This
// one switch decides whether the marketplace uses it, and it defaults to OFF without any configuration.
//
// To enable it again after a new API has been tested: set TOURDESK_MARKETPLACE_ENABLED=true (or change the
// default below). Native TourDesk checkout has its own, independent gate (lib/booking/gate.ts) and stays
// off either way.
import { PROVIDERS, type Provider } from "./types";

export function tourdeskMarketplaceEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.TOURDESK_MARKETPLACE_ENABLED === "true";
}

// The providers the public marketplace may request and show, in display order.
export function activeProviders(env: Record<string, string | undefined> = process.env): Provider[] {
  return PROVIDERS.filter((p) => p !== "tourdesk" || tourdeskMarketplaceEnabled(env));
}

// "Viator and Tiqets", "TourDesk, Viator and Tiqets": for copy that names the partners.
export function providerNames(active: readonly Provider[], labels: Record<Provider, string>): string {
  const names = active.map((p) => labels[p]);
  return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
