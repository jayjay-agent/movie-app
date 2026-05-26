/**
 * Shared Algolia clients.
 *
 * - `searchClient` is the browser-safe, search-only client. Used by every
 *   InstantSearch widget, Autocomplete, and Recommend rail.
 * - `getServerSearchClient()` returns a full-featured client that can read
 *   single records by objectID and call admin operations. Server-only.
 */

import { liteClient as createLiteClient } from "algoliasearch/lite";
import { algoliasearch } from "algoliasearch";

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
 * Full Algolia client with admin capabilities. Server-only.
 *
 * Use for: single-record fetches (`getObject`), index settings, save/update.
 * Do NOT import this from a Client Component — it pulls the admin key.
 */
export function getServerSearchClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "getServerSearchClient() must only be called from server code."
    );
  }
  return algoliasearch(algoliaConfig.appId, getAdminKey());
}
