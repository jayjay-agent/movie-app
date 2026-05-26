# Movie App — an Algolia playground

A demo / test web app that exercises the full Algolia product surface against
the public Algolia movies sample dataset:

- **InstantSearch** — search box, hits, faceted refinement, sort, pagination
- **Autocomplete** — global header search with Query Suggestions + Recent Searches
- **Recommend** — Trending, Related, and Frequently-Watched-Together rails
- **Personalization + Insights** — anonymous user token, event tracking, re-ranking
- **Rules** — pinned results, banners, contextual merchandising
- **NeuralSearch** — semantic / hybrid search toggle
- **Agent Studio** — conversational chat grounded in the movies index
- **Analytics** — top searches, no-results, CTR, conversion rate

No auth, no login, mock/demo experience. Built with Next.js 16 App Router,
React 19, Tailwind v4, and shadcn/ui (preset `b5tK8n7Btg`).

## Quick start

```bash
pnpm install
pnpm dev
```

By default the app boots in **sandbox mode** — read-only against Algolia's
public `latency` demo app. No setup, no account needed.

## Two modes

| Mode | Setup | Features |
| --- | --- | --- |
| `sandbox` (default) | None. Uses Algolia's public `latency` demo app. | Search, facets, basic autocomplete. Read-only. |
| `owned` | Provision your own Algolia app. | Full features incl. Personalization, Rules, NeuralSearch, Agent Studio, analytics. |

To switch to `owned` mode:

1. Sign up for an Algolia account at <https://dashboard.algolia.com>.
2. Copy `.env.example` → `.env.local` and fill in your app ID, search key,
   admin key, and analytics key.
3. Set `NEXT_PUBLIC_ALGOLIA_MODE=owned`.
4. Run `pnpm provision` — this pushes the movies dataset, configures the index
   settings + replicas, sets up Query Suggestions, and creates sample Rules.
5. (Optional) Run `pnpm seed-events` to prime Insights with synthetic events,
   unlocking Personalization and NeuralSearch demos in a fresh app.
6. Restart the dev server.

See [`docs/mcp/provisioning-runbook.md`](./docs/mcp/provisioning-runbook.md)
for the equivalent MCP-driven flow that uses an AI agent to provision your
Algolia app interactively.

## Project structure

```
app/                 # Next.js App Router routes
components/
  ui/                # shadcn primitives (radix-sera style)
  search/            # SearchExperience, MovieHit, FacetSidebar, …
  recommend/         # Trending / Related / FBT rails
  agent/             # Agent Studio chat panel
  shell/             # Header, Footer
lib/
  algolia.ts         # Shared search client
  insights.ts        # search-insights init + event helpers
  userToken.ts       # Anonymous user token (localStorage)
  env.ts             # Validated env config
scripts/
  provision.ts       # Build-time Algolia index provisioning
  seed-events.ts     # Synthetic Insights events for cold-start demos
data/                # movies.json, settings.json, rules.json
docs/                # Plans + runbooks
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server with Turbopack. |
| `pnpm build` | Production build. |
| `pnpm start` | Run the production build. |
| `pnpm typecheck` | `tsc --noEmit`. |
| `pnpm lint` | ESLint. |
| `pnpm provision` | Push movies dataset + settings + rules to your Algolia app. |
| `pnpm seed-events` | Generate synthetic Insights events (optional). |

## Plans + decision history

This repo carries its implementation plan in
[`docs/plans/`](./docs/plans/) — the canonical record of what we decided to
build and why. Start there if you're picking up the work.
