"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TrendingRail } from "@/components/recommend/TrendingRail";
import { algoliaMode } from "@/lib/algolia";

export function HomeExperience() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-14 px-6 py-12">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div className="space-y-4">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-muted-foreground">
            {algoliaMode} · Algolia Recommend
          </p>
          <h1 className="font-heading text-4xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-5xl">
            What&apos;s trending
            <br />
            in the catalog
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            Trending rails powered by Algolia Recommend — global picks and
            genre-scoped charts. Search the full index when you want filters,
            facets, and rules.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="/search">Browse all movies</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/search?movies%5Bquery%5D=action">Try action</Link>
            </Button>
          </div>
        </div>
        <div className="border border-border bg-muted/20 px-5 py-4 font-mono text-[11px] leading-relaxed tracking-wide text-muted-foreground uppercase">
          <p className="text-foreground">Demo tips</p>
          <ul className="mt-3 list-inside list-disc space-y-1 normal-case">
            <li>Rails collapse gracefully when models are cold-starting.</li>
            <li>
              Run <code className="font-mono">pnpm seed-events</code> in owned
              mode for richer Recommend signals.
            </li>
            <li>
              Open <Link href="/search" className="underline">Search</Link> for
              Personalization, Rules, and NeuralSearch toggles.
            </li>
          </ul>
        </div>
      </section>

      <TrendingRail title="This week" limit={12} />
      <TrendingRail facetName="genre" facetValue="Action" limit={12} />
      <TrendingRail facetName="genre" facetValue="Drama" limit={12} />
    </div>
  );
}
