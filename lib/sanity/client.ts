import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

// Public, read-only client for published content. It carries no token, so it can
// only see what the dataset exposes publicly (published documents, never drafts).
// Credentials that can write (SANITY_API_TOKEN) are never used by the website.
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

export const SANITY_TAG = "sanity";

export function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: string[] = [SANITY_TAG],
): Promise<T> {
  return client.fetch<T>(query, params, {
    next: { revalidate: 3600, tags },
  });
}
