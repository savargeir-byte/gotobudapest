import type { MarketplaceProduct, MarketplaceQuery, ProviderStatus } from "../types";

export type ProviderArgs = {
  query: MarketplaceQuery;
  // Provider-native position: Viator 1-based `start`, Tiqets/TourDesk 1-based page.
  position: number;
  size: number;
};

export type ProviderPage = {
  items: MarketplaceProduct[];
  status: ProviderStatus;
  // Next provider-native position, or undefined when the provider is exhausted.
  next?: number;
  // Rows the provider returned before any local filtering.
  rawCount: number;
};

export const disabledPage = (note: string): ProviderPage => ({
  items: [],
  status: { status: "disabled", count: 0, note },
  rawCount: 0,
});
