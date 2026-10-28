// Provider-neutral contract of the Budapest tours marketplace. The backend
// (lib/marketplace/*, app/api/marketplace/search) and the UI (/tours) share these
// types. Nothing here is ever invented: a field is present only when the provider
// API supplied it, and the capability table says which filters and sorts each
// provider can honour server-side.

export const PROVIDERS = ["viator", "tiqets", "tourdesk"] as const;
export type Provider = (typeof PROVIDERS)[number];
export const PROVIDER_LABEL: Record<Provider, string> = {
  viator: "Viator",
  tiqets: "Tiqets",
  tourdesk: "TourDesk",
};

export const SORTS = ["relevance", "rating", "popularity", "price_asc", "price_desc"] as const;
export type SortKey = (typeof SORTS)[number];
export const SORT_LABEL: Record<SortKey, string> = {
  relevance: "Recommended",
  rating: "Top rated",
  popularity: "Most popular",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
};

// Category tabs. Providers without a taxonomy are matched on title/summary text
// (lib/marketplace/categories.ts); Viator is additionally narrowed with live tags.
export const CATEGORIES = [
  { key: "cruises", label: "Cruises & boats" },
  { key: "baths", label: "Thermal baths & spas" },
  { key: "walking", label: "City & walking tours" },
  { key: "food", label: "Food & drink" },
  { key: "tickets", label: "Museums & attractions" },
  { key: "daytrips", label: "Day trips" },
  { key: "transfers", label: "Airport transfers" },
  // Added by the UI: matched on product titles and Viator tags, not on a provider taxonomy.
  { key: "sightseeing", label: "Sightseeing" },
  { key: "nightlife", label: "Nightlife" },
  { key: "family", label: "Family activities" },
] as const;
export type CategoryKey = (typeof CATEGORIES)[number]["key"];

// Duration buckets (minutes).
export const DURATIONS = [
  { key: "lt2", label: "Up to 2 hours", fromMin: 0, toMin: 120 },
  { key: "2to5", label: "2 to 5 hours", fromMin: 120, toMin: 300 },
  { key: "5to8", label: "5 to 8 hours", fromMin: 300, toMin: 480 },
  { key: "gt8", label: "8 hours or more", fromMin: 480, toMin: null },
] as const;
export type DurationKey = (typeof DURATIONS)[number]["key"];

export const MARKETPLACE_CURRENCY = "EUR";

export type MarketplaceQuery = {
  q?: string;
  category?: CategoryKey;
  provider?: Provider; // undefined = all providers
  sort: SortKey;
  priceMin?: number; // EUR
  priceMax?: number; // EUR
  duration?: DurationKey;
  minRating?: number; // 4 or 4.5
  cursor?: string; // opaque, produced by the backend
};

// One provider-supplied rendition of a photo. Never synthesised or upscaled by us.
export type ImageVariant = { src: string; width: number; height?: number };

// An editorial photograph of the exact venue a product is about, from our own licensed library
// (lib/photos.json). NOT a supplier photo of the product; always shown with that wording and its credit.
export type VenuePhoto = {
  src640: string;
  src1280: string;
  width?: number;
  height?: number;
  alt: string;
  venue: string;
  venueSlug: string;
  credit: { title: string; author: string; license: string; licenseUrl: string; sourceUrl: string };
};

export type MarketplaceProduct = {
  id: string; // `${provider}:${providerKey}`, unique across providers
  provider: Provider;
  providerKey: string;
  title: string;
  summary?: string;
  // Provider-licensed photograph only. Tiqets returns none on this key tier.
  // `src` is the widest variant the API offered. `variants` (Viator) is a bounded list of the
  // usable variants (see lib/marketplace/images.ts) from which cards build srcset/sizes;
  // `small` is the variant chosen for a ~480 CSS px card at 2x (never a thumbnail).
  // `sourceLimited` is true when even the widest variant is narrower than a 2x card needs.
  image?: {
    src: string;
    alt: string;
    small?: string;
    variants?: ImageVariant[];
    sourceLimited?: boolean;
  };
  // Set only when the provider supplied no photo and the title names one venue we hold a credited
  // photograph of (lib/marketplace/attraction-match.ts). Never set next to `image`.
  venuePhoto?: VenuePhoto;
  // "From" price exactly as supplied by the API.
  price?: { amount: number; currency: string; label: string };
  rating?: { value: number; count: number };
  durationMinutes?: number;
  durationLabel?: string;
  freeCancellation?: boolean; // only when the API says so
  categories: CategoryKey[];
  // Internal product page when one exists.
  detailUrl?: string;
  // Provider URL exactly as supplied by the API (affiliate parameters untouched).
  bookingUrl: string;
};

export type ProviderStatus = {
  status: "ok" | "empty" | "error" | "disabled" | "unsupported" | "skipped";
  count: number;
  total?: number;
  note?: string;
};

export type MarketplaceResult = {
  items: MarketplaceProduct[];
  nextCursor?: string;
  providers: Record<Provider, ProviderStatus>;
  // Additive: honest, human-readable notes about how this page was assembled
  // (for example that sorting only applies within a merged page).
  notes?: string[];
};

// What each provider can do server-side. The UI shows a control when at least one
// selected provider supports it, and says which provider ignores it.
export const CAPABILITIES: Record<
  Provider,
  {
    search: boolean;
    rating: boolean;
    sort: SortKey[];
    price: boolean;
    duration: boolean;
    category: boolean;
  }
> = {
  viator: {
    search: true,
    rating: true,
    sort: ["relevance", "rating", "price_asc", "price_desc"],
    price: true,
    duration: true,
    category: true,
  },
  tiqets: {
    search: true,
    rating: true,
    sort: ["relevance", "popularity"],
    price: false,
    duration: false,
    category: true,
  },
  tourdesk: {
    search: true,
    rating: false,
    sort: ["relevance"],
    price: false,
    duration: false,
    category: true,
  },
};
