# Algolia MCP provisioning runbook

This walkthrough mirrors `scripts/provision.ts` step-for-step using
[Algolia MCP](https://github.com/algolia/mcp-node) instead of the Node CLI.
Both paths produce identical end-state — pick whichever fits your workflow.

> **Why use MCP?** It lets an AI agent (Claude Desktop, Claude Code, Cursor,
> Codex) reason about your Algolia app interactively — inspect settings,
> tweak rules, re-push records — without you context-switching to a terminal.
>
> **Why use the script instead?** It's deterministic, CI-friendly, and uses
> the supported `algoliasearch` v5 SDK. Algolia explicitly labels MCP as
> experimental.

## Prerequisites

1. Install the Algolia MCP server:
   ```bash
   npx @algolia/mcp-node@latest authenticate
   ```
   This opens a browser to grant the MCP server access to your Algolia app.

2. Register the MCP with your AI client. For Claude Code:
   ```bash
   claude mcp add algolia npx @algolia/mcp-node@latest start-server
   ```

3. Restrict MCP tools to read+write only (avoid handing your AI agent the
   ability to enable A/B tests, change billing settings, etc.):
   ```bash
   export MCP_ENABLED_TOOLS=search_read,search_write,querysuggestions,recommend
   ```

## Steps

Each step below corresponds to a discrete operation in `scripts/provision.ts`.
Drop the prompt into your AI agent — it will pick the right MCP tool.

### 1. Push the movies dataset

> Use `search_write` to push every record from `data/movies.json` to my
> Algolia index `movies`. Skip records without an `objectID`. Don't auto-
> generate IDs.

The dataset lives at
[github.com/algolia/datasets/blob/master/movies/movies.json](https://github.com/algolia/datasets/blob/master/movies/movies.json)
(~22k movies, ~12 MB). Either download it once into `data/movies.json` or
ask the agent to fetch and forward.

### 2. Apply index settings

> Read `data/settings.json` and apply it to the `movies` index via
> `search_write` setSettings. Forward to replicas.

This sets:
- `searchableAttributes` (title, alternative_titles, actors, genre, year)
- `attributesForFaceting` (genre, actors, language, year, rating, hierarchical genre)
- `customRanking` (score, rating_count, rating — descending)
- `replicas` (`movies_year_desc`, `movies_rating_desc`)
- highlight / snippet attributes

### 3. Create the replicas

The `setSettings` call above declares the replicas. Algolia auto-creates them,
but they start empty. To make them sortable, apply each replica's own
`customRanking`:

> For replica `movies_year_desc`, set customRanking to `[desc(year)]` via
> `search_write` setSettings.
>
> For replica `movies_rating_desc`, set customRanking to
> `[desc(rating), desc(rating_count)]`.

### 4. Push the rules

> Read `data/rules.json` and apply all rules to the `movies` index via
> `search_write` saveRules. Clear existing rules first. Don't forward to
> replicas.

Sample rules in this repo:

| Rule | Trigger | Effect |
|---|---|---|
| Pinned trilogy | query contains `star wars` | Pins three specific objectIDs to positions 1–3 |
| Oscars banner | query is `oscars` | Returns `userData.banner` payload |
| Sci-fi rewrite | query is `scifi` | Rewrites to `science fiction` |
| Weekend boost | rule context = `weekend` | Boosts Family / Animation genres |

### 5. Configure Query Suggestions

Query Suggestions has its own dedicated MCP tool:

> Use `querysuggestions` to create a Query Suggestions configuration with
> source = `movies`, destination = `movies_query_suggestions`, and
> generation strategy = "most popular searches".

It takes ~24 hours for the first batch of suggestions to populate (they're
generated from real Insights events). Until then, the
`@algolia/autocomplete-plugin-query-suggestions` source will fall back to
empty.

### 6. (Optional) Seed Insights events for cold-start demos

Use `scripts/seed-events.ts` for this — there isn't a clean MCP equivalent
for batch event ingestion, and the Insights REST API is simpler than driving
it through an MCP tool. After running it:

> Use `analytics` to verify events landed: check `/2/searches` and
> `/1/events` for activity in the last hour.

### 7. (Optional) Enable NeuralSearch

This is a one-line setting flip but requires ≥1000 click events to be
useful:

> Use `search_write` setSettings to set `mode: "neuralSearch"` on the
> `movies` index.

To revert: `mode: "keywordSearch"`. The app's NeuralSearch toggle (U10) calls
`/api/neural-mode` to do exactly this — so you can flip it from the UI too.

## Verification checklist

After running every step, ask the agent to confirm:

- [ ] `search_read` — `getSettings('movies')` returns the configured
      searchable attributes, facets, custom ranking, and replicas.
- [ ] `search_read` — `searchSingleIndex('movies', { query: 'star wars' })`
      returns the three pinned objectIDs at positions 1–3.
- [ ] `search_read` — `searchSingleIndex('movies', { query: 'oscars' })`
      returns the banner in `userData`.
- [ ] `querysuggestions` — config exists with the right source/destination.
- [ ] Index record count matches `data/movies.json` length (~22k).

## Reverting

To completely tear down what this runbook created:

> Use `search_write` to `deleteIndex('movies')`, `deleteIndex('movies_year_desc')`,
> `deleteIndex('movies_rating_desc')`, and `deleteIndex('movies_query_suggestions')`.

The Algolia dashboard will still show the empty rules and Query Suggestions
config for a minute or two before garbage-collecting.
