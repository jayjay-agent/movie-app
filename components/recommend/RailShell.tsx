"use client";

import { InstantSearchNext } from "react-instantsearch-nextjs";

import { indexName, searchClient } from "@/lib/algolia";

/**
 * Lightweight InstantSearchNext wrapper for Recommend rails that live
 * outside the /search route's search context (homepage, detail page).
 *
 * Uses the same searchClient + indexName so cached queries are deduplicated
 * across rails on the same page.
 */
export function RailShell({ children }: { children: React.ReactNode }) {
  return (
    <InstantSearchNext indexName={indexName} searchClient={searchClient} insights>
      {children}
    </InstantSearchNext>
  );
}

export function RailHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title?: string;
}) {
  return (
    <header className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="font-heading text-xs tracking-[0.25em] uppercase text-muted-foreground">
        {eyebrow}
      </h2>
      {title ? (
        <p className="font-heading text-lg font-semibold uppercase tracking-tight">
          {title}
        </p>
      ) : null}
    </header>
  );
}

export function RailEmpty({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-border px-4 py-8 text-center font-mono text-xs tracking-widest uppercase text-muted-foreground">
      {message}
    </div>
  );
}

export function RailScroller({ children }: { children: React.ReactNode }) {
  return (
    <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-6 lg:overflow-visible">
      {children}
    </ul>
  );
}
