/**
 * Provision an Algolia application for the movie demo.
 *
 * Idempotent. Safe to re-run — settings and records merge / upsert.
 *
 *   pnpm provision
 *
 * Requires the following env vars (typically in .env.local):
 *   NEXT_PUBLIC_ALGOLIA_APP_ID
 *   NEXT_PUBLIC_ALGOLIA_INDEX_NAME    (defaults to "movies")
 *   ALGOLIA_ADMIN_KEY                  (server-only, never NEXT_PUBLIC_)
 *
 * What it does:
 *   1. Loads data/movies.json (downloads from Algolia's canonical dataset
 *      if not present locally).
 *   2. Pushes every record to the configured index.
 *   3. Applies data/settings.json (searchable attrs, facets, replicas,
 *      ranking, custom ranking).
 *   4. Pushes data/rules.json (pinned hits, banners, contextual rewrites).
 *   5. Optionally pushes data/rules.weekend.json when
 *      ALGOLIA_PROVISION_WEEKEND_RULES=1 (paid plan — optionalFilters).
 *   6. Prints a summary with task IDs.
 *
 * The matching MCP workflow lives in docs/mcp/provisioning-runbook.md — it
 * walks an AI agent through the same steps via the search_write tool. Both
 * paths produce identical end-state.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { algoliasearch, type Rule } from "algoliasearch";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = resolve(ROOT, "data");

const MOVIES_URL =
  "https://raw.githubusercontent.com/algolia/datasets/master/movies/movies.json";

type RawMovie = Record<string, unknown> & { objectID?: string };

function requireEnv(name: string, hint?: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing required env var: ${name}${hint ? ` (${hint})` : ""}`
    );
  }
  return v;
}

async function loadMovies(): Promise<RawMovie[]> {
  const cachePath = resolve(DATA_DIR, "movies.json");
  if (existsSync(cachePath)) {
    console.log(`✓ Using cached movies dataset (${cachePath})`);
    const raw = await readFile(cachePath, "utf8");
    return JSON.parse(raw);
  }
  console.log("• Movies dataset not cached. Downloading from algolia/datasets…");
  const res = await fetch(MOVIES_URL);
  if (!res.ok) {
    throw new Error(
      `Failed to download movies dataset: ${res.status} ${res.statusText}`
    );
  }
  const json = (await res.json()) as RawMovie[];
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(cachePath, JSON.stringify(json, null, 2));
  console.log(`✓ Cached ${json.length.toLocaleString()} movies to ${cachePath}`);
  return json;
}

async function loadJSON<T>(filename: string): Promise<T> {
  const raw = await readFile(resolve(DATA_DIR, filename), "utf8");
  return JSON.parse(raw) as T;
}

async function main() {
  const appId = requireEnv(
    "NEXT_PUBLIC_ALGOLIA_APP_ID",
    "your Algolia application ID"
  );
  const adminKey = requireEnv(
    "ALGOLIA_ADMIN_KEY",
    "the admin API key from your Algolia dashboard"
  );
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? "movies";

  const client = algoliasearch(appId, adminKey);

  console.log(`\n→ Provisioning app=${appId} index=${indexName}\n`);

  const includeWeekendRules =
    process.env.ALGOLIA_PROVISION_WEEKEND_RULES === "1" ||
    process.argv.includes("--with-weekend-rules");

  const [movies, settings, baseRules] = await Promise.all([
    loadMovies(),
    loadJSON<Record<string, unknown>>("settings.json"),
    loadJSON<Rule[]>("rules.json"),
  ]);

  let rules = baseRules;
  if (includeWeekendRules) {
    const weekendRules = await loadJSON<Rule[]>("rules.weekend.json");
    rules = [...baseRules, ...weekendRules];
    console.log(
      `• Including ${weekendRules.length} weekend context rule(s) (paid plan)`
    );
  }

  // Ensure every record has an objectID. Algolia rejects records without one
  // when autoGenerateObjectIDIfNotExist is false (the safer default).
  const records = movies.map((m, i) => ({
    objectID: m.objectID ?? `movie-${i}`,
    ...m,
  }));

  console.log(`• Pushing ${records.length.toLocaleString()} records…`);
  const saveResult = await client.saveObjects({
    indexName,
    objects: records,
  });
  console.log(`  ✓ saveObjects taskID=${saveResult[0]?.taskID ?? "?"}`);

  console.log(`• Applying settings (${Object.keys(settings).length} keys)…`);
  const settingsResult = await client.setSettings({
    indexName,
    indexSettings: settings,
    forwardToReplicas: true,
  });
  console.log(`  ✓ setSettings taskID=${settingsResult.taskID}`);

  console.log(`• Pushing ${rules.length} rules…`);
  const rulesResult = await client.saveRules({
    indexName,
    rules,
    clearExistingRules: true,
    forwardToReplicas: false,
  });
  console.log(`  ✓ saveRules taskID=${rulesResult.taskID}`);

  console.log("\n→ Waiting for tasks to finish…");
  await client.waitForTask({ indexName, taskID: saveResult[0]!.taskID });
  await client.waitForTask({ indexName, taskID: settingsResult.taskID });
  await client.waitForTask({ indexName, taskID: rulesResult.taskID });

  console.log("\n✓ Provisioning complete.\n");
  console.log("Next steps:");
  console.log("  1. (Optional) Run pnpm seed-events to prime Insights so");
  console.log("     Personalization and NeuralSearch demos light up.");
  console.log("  2. Set NEXT_PUBLIC_ALGOLIA_MODE=owned and restart the dev");
  console.log("     server.");
  console.log("  3. In the Algolia dashboard, enable Query Suggestions on");
  console.log(`     '${indexName}' — destination index '${indexName}_query_suggestions'.`);
  console.log("  4. (Optional) Configure NeuralSearch in the dashboard once");
  console.log("     enough click events have accumulated.\n");
}

main().catch((err) => {
  console.error("\n✖ Provisioning failed.\n");
  console.error(err);
  process.exit(1);
});
