/**
 * Validated environment configuration.
 *
 * This module reads `process.env` at module load time, validates the shape based
 * on `NEXT_PUBLIC_ALGOLIA_MODE`, and exports a typed config object.
 *
 * Public values (prefixed `NEXT_PUBLIC_`) are safe to import anywhere.
 * Server values (admin key, analytics key) are only accessible via getters
 * that throw if called from a client context.
 */

export type AlgoliaMode = "sandbox" | "owned";

type SandboxConfig = {
  mode: "sandbox";
  appId: string;
  searchKey: string;
  indexName: string;
  qsIndexName: null;
  agentId: null;
};

type OwnedConfig = {
  mode: "owned";
  appId: string;
  searchKey: string;
  indexName: string;
  qsIndexName: string;
  agentId: string | null;
};

export type AlgoliaConfig = SandboxConfig | OwnedConfig;

const SANDBOX_DEFAULTS = {
  appId: "latency",
  searchKey: "6be0576ff61c053d5f9a3225e2a90f76",
  indexName: "movies",
} as const;

function readPublicEnv(): AlgoliaConfig {
  const mode = (process.env.NEXT_PUBLIC_ALGOLIA_MODE ?? "sandbox") as AlgoliaMode;

  if (mode === "sandbox") {
    return {
      mode,
      appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? SANDBOX_DEFAULTS.appId,
      searchKey:
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ?? SANDBOX_DEFAULTS.searchKey,
      indexName:
        process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? SANDBOX_DEFAULTS.indexName,
      qsIndexName: null,
      agentId: null,
    };
  }

  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? "movies";
  const qsIndexName =
    process.env.NEXT_PUBLIC_ALGOLIA_QS_INDEX_NAME ?? "movies_query_suggestions";
  const agentId = process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ID || null;

  if (!appId || !searchKey) {
    throw new Error(
      "NEXT_PUBLIC_ALGOLIA_MODE=owned requires NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_SEARCH_KEY. Set them in .env.local, or switch back to sandbox mode."
    );
  }

  return { mode, appId, searchKey, indexName, qsIndexName, agentId };
}

export const algoliaConfig = readPublicEnv();

/**
 * Server-only admin key. Throws if accessed in the browser.
 */
export function getAdminKey(): string {
  if (typeof window !== "undefined") {
    throw new Error("getAdminKey() must only be called from server code.");
  }
  const key = process.env.ALGOLIA_ADMIN_KEY;
  if (!key) {
    throw new Error(
      "ALGOLIA_ADMIN_KEY is not set. Required for provisioning scripts and the /api/neural-mode route."
    );
  }
  return key;
}

/**
 * Server-only analytics key. Throws if accessed in the browser.
 */
export function getAnalyticsKey(): string {
  if (typeof window !== "undefined") {
    throw new Error("getAnalyticsKey() must only be called from server code.");
  }
  const key = process.env.ALGOLIA_ANALYTICS_KEY;
  if (!key) {
    throw new Error(
      "ALGOLIA_ANALYTICS_KEY is not set. Required for the /analytics route."
    );
  }
  return key;
}
