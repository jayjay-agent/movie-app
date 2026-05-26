/**
 * Re-resolve stale TMDB poster URLs for the most-viewed records.
 *
 *   pnpm refresh-images
 *
 * The Algolia movies dataset bundles `image.tmdb.org/t/p/w154/<hash>.jpg`
 * URLs that mostly 404 today — TMDB rotated those poster hashes years
 * after the dataset was published. This script queries TMDB's current
 * search API for the top N movies (by score) and patches their `image`
 * field in Algolia via partialUpdateObjects.
 *
 * Requires:
 *   NEXT_PUBLIC_ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY (Algolia)
 *   TMDB_API_KEY                                   (TMDB free tier)
 *
 * Knobs (env-overridable):
 *   REFRESH_LIMIT — how many records to refresh (default 1000)
 *   REFRESH_POSTER_SIZE — TMDB image size (w185 / w342 / w500 / w780)
 *
 * Idempotent: re-running re-resolves any records whose image still 404s.
 */

import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { algoliasearch } from "algoliasearch";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = resolve(ROOT, "data");

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p";

type Movie = {
  objectID: string;
  title: string;
  year?: number;
  score?: number;
  image?: string;
};

type TmdbSearchResult = {
  id: number;
  title: string;
  release_date?: string;
  poster_path: string | null;
  popularity?: number;
};

type TmdbSearchResponse = {
  results: TmdbSearchResult[];
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function searchTmdb(
  apiKey: string,
  title: string,
  year: number | undefined
): Promise<string | null> {
  const params = new URLSearchParams({
    api_key: apiKey,
    query: title,
    include_adult: "false",
  });
  if (year) params.set("year", String(year));

  const res = await fetch(`${TMDB_BASE}/search/movie?${params}`);
  if (!res.ok) {
    if (res.status === 429) {
      // Rate limited. Back off briefly and signal caller to retry.
      throw new Error("RATE_LIMIT");
    }
    return null;
  }
  const data = (await res.json()) as TmdbSearchResponse;
  if (!data.results?.length) return null;

  // Prefer an exact year match, otherwise the most popular result.
  const exact = year
    ? data.results.find((r) => r.release_date?.startsWith(String(year)))
    : null;
  const best =
    exact ??
    [...data.results].sort(
      (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
    )[0];
  return best?.poster_path ?? null;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const appId = requireEnv("NEXT_PUBLIC_ALGOLIA_APP_ID");
  const adminKey = requireEnv("ALGOLIA_ADMIN_KEY");
  const tmdbKey = requireEnv("TMDB_API_KEY");
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? "movies";
  const limit = Number(process.env.REFRESH_LIMIT ?? 1000);
  const size = process.env.REFRESH_POSTER_SIZE ?? "w500";

  console.log(
    `\n→ Refreshing top ${limit} posters · size=${size} · index=${indexName}\n`
  );

  const raw = await readFile(resolve(DATA, "movies.json"), "utf8");
  const movies = JSON.parse(raw) as Movie[];

  const ranked = [...movies]
    .filter((m) => m.title && (m.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);

  console.log(`• Top ${ranked.length} records selected by score`);

  const client = algoliasearch(appId, adminKey);
  const updates: Array<{ objectID: string; image: string }> = [];

  let processed = 0;
  let resolved = 0;
  let missed = 0;
  const concurrency = 8;
  let cursor = 0;

  async function worker() {
    while (cursor < ranked.length) {
      const i = cursor++;
      const movie = ranked[i];
      let posterPath: string | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          posterPath = await searchTmdb(tmdbKey, movie.title, movie.year);
          break;
        } catch (err) {
          if (
            err instanceof Error &&
            err.message === "RATE_LIMIT" &&
            attempt < 2
          ) {
            await sleep(1500 + Math.random() * 1500);
            continue;
          }
          break;
        }
      }
      processed++;
      if (posterPath) {
        updates.push({
          objectID: movie.objectID,
          image: `${TMDB_IMG_BASE}/${size}${posterPath}`,
        });
        resolved++;
      } else {
        missed++;
      }
      if (processed % 50 === 0) {
        console.log(
          `  · ${processed}/${ranked.length} · resolved=${resolved} missed=${missed}`
        );
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  console.log(`\n• Resolved ${resolved} / ${ranked.length}; missed ${missed}`);

  if (updates.length === 0) {
    console.log("\nNothing to push.");
    return;
  }

  console.log(`• Pushing partialUpdateObjects for ${updates.length} records…`);
  const result = await client.partialUpdateObjects({
    indexName,
    objects: updates,
  });
  const lastTask = result[result.length - 1];
  if (lastTask?.taskID) {
    await client.waitForTask({ indexName, taskID: lastTask.taskID });
  }

  console.log("\n✓ Image refresh complete.\n");
  console.log(
    `Next: reload the app; the top ${ranked.length} movies should now have working posters.`
  );
}

main().catch((err) => {
  console.error("\n✖ Image refresh failed.\n");
  console.error(err);
  process.exit(1);
});
