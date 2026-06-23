/**
 * Shared Algolia clients and helpers.
 *
 * - `searchClient` is the browser-safe, search-only client. Used by every
 *   InstantSearch widget, Autocomplete, and Recommend rail. Module singleton.
 * - `getMovieByObjectID(id)` fetches a single record server-side using the
 *   public search key — works in both sandbox and owned mode.
 * - `getServerAdminClient()` returns a full client backed by the admin key.
 *   Server-only, throws if the admin key is missing. Used by the provisioning
 *   scripts and the /api/neural-mode toggle.
 */

import { algoliasearch } from "algoliasearch";
import { liteClient as createLiteClient } from "algoliasearch/lite";

import { algoliaConfig, getAdminKey } from "./env";

export const searchClient = createLiteClient(
  algoliaConfig.appId,
  algoliaConfig.searchKey
);

export const indexName = algoliaConfig.indexName;
export const qsIndexName = algoliaConfig.qsIndexName;
export const agentId = algoliaConfig.agentId;
export const algoliaAppId = algoliaConfig.appId;
export const algoliaSearchKey = algoliaConfig.searchKey;
export const algoliaMode = algoliaConfig.mode;

/**
 * Server-only read client backed by the public search key. Use for single-
 * record reads, not admin operations.
 */
function getServerReadClient() {
  if (typeof window !== "undefined") {
    throw new Error("getServerReadClient() must only be called from server code.");
  }
  return algoliasearch(algoliaConfig.appId, algoliaConfig.searchKey);
}

/**
 * Server-only client with admin key. Throws when ALGOLIA_ADMIN_KEY is unset.
 * Used by provisioning scripts and the NeuralSearch toggle route.
 */
export function getServerAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("getServerAdminClient() must only be called from server code.");
  }
  return algoliasearch(algoliaConfig.appId, getAdminKey());
}

export type RawMovie = {
  objectID: string;
  title: string;
  alternative_titles?: string[];
  year?: number;
  genre?: string[];
  actors?: string[];
  image?: string;
  score?: number;
  rating?: number;
  [key: string]: unknown;
};

/**
 * Fetches a single movie by objectID. Returns null if not found.
 */
export async function getMovieByObjectID(
  objectID: string
): Promise<RawMovie | null> {
  const client = getServerReadClient();
  try {
    const record = await client.getObject({
      indexName,
      objectID,
    });
    return record as RawMovie;
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

function isNotFound(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const status = (err as { status?: number }).status;
  return status === 404;
}
