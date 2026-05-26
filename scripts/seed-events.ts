/**
 * Seed synthetic Insights events so Personalization and NeuralSearch demos
 * have signal in a fresh Algolia app.
 *
 *   pnpm seed-events
 *
 * What it does:
 *   1. Pulls a random sample of records from the configured index.
 *   2. For a few synthetic user tokens, emits view + click + conversion
 *      events distributed across the past 30 days via the Insights REST API.
 *
 * Not idempotent in the strict sense — re-running adds more events. That's
 * usually what you want for warming up models.
 */

import { algoliasearch } from "algoliasearch";

const INSIGHTS_ENDPOINT = "https://insights.algolia.io/1/events";

type EventRow = {
  eventType: "view" | "click" | "conversion";
  eventName: string;
  index: string;
  userToken: string;
  objectIDs: string[];
  timestamp: number;
  positions?: number[];
};

function requireEnv(name: string, hint?: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing required env var: ${name}${hint ? ` (${hint})` : ""}`
    );
  }
  return v;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function daysAgo(d: number): number {
  return Date.now() - d * 24 * 60 * 60 * 1000;
}

async function main() {
  const appId = requireEnv("NEXT_PUBLIC_ALGOLIA_APP_ID");
  const adminKey = requireEnv("ALGOLIA_ADMIN_KEY");
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? "movies";

  console.log(`\n→ Seeding events for app=${appId} index=${indexName}\n`);

  const client = algoliasearch(appId, adminKey);
  const { hits } = await client.searchSingleIndex({
    indexName,
    searchParams: { hitsPerPage: 200 },
  });

  if (!hits.length) {
    throw new Error(
      `Index '${indexName}' has no records. Run \`pnpm provision\` first.`
    );
  }

  const tokens = [
    "seed-token-action-fan",
    "seed-token-drama-fan",
    "seed-token-classic-fan",
    "seed-token-random",
  ];

  const events: EventRow[] = [];

  for (const userToken of tokens) {
    const seen = pickRandom(hits, 40);
    for (const hit of seen) {
      const t = daysAgo(Math.random() * 30);
      events.push({
        eventType: "view",
        eventName: "Movie Viewed",
        index: indexName,
        userToken,
        objectIDs: [hit.objectID],
        timestamp: t,
      });
      if (Math.random() < 0.4) {
        events.push({
          eventType: "click",
          eventName: "Movie Clicked",
          index: indexName,
          userToken,
          objectIDs: [hit.objectID],
          positions: [1 + Math.floor(Math.random() * 5)],
          timestamp: t + 1000,
        });
      }
      if (Math.random() < 0.1) {
        events.push({
          eventType: "conversion",
          eventName: "Movie Converted",
          index: indexName,
          userToken,
          objectIDs: [hit.objectID],
          timestamp: t + 2000,
        });
      }
    }
  }

  console.log(`• Generated ${events.length.toLocaleString()} synthetic events`);

  // Insights API accepts batches up to 1000 events per call.
  const batches: EventRow[][] = [];
  for (let i = 0; i < events.length; i += 1000) {
    batches.push(events.slice(i, i + 1000));
  }

  for (let i = 0; i < batches.length; i++) {
    const res = await fetch(INSIGHTS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Algolia-Application-Id": appId,
        "X-Algolia-API-Key": adminKey,
      },
      body: JSON.stringify({ events: batches[i] }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Insights POST failed (${res.status}): ${body.slice(0, 400)}`
      );
    }
    console.log(`  ✓ Batch ${i + 1}/${batches.length} sent`);
  }

  console.log("\n✓ Event seeding complete.\n");
  console.log("Events take ~5 minutes to propagate. After that:");
  console.log("  · Recommend models will train on the next nightly cycle.");
  console.log("  · NeuralSearch can be enabled in the dashboard once");
  console.log("    Algolia confirms enough click events (≥1000).\n");
}

main().catch((err) => {
  console.error("\n✖ Event seeding failed.\n");
  console.error(err);
  process.exit(1);
});
