"use client";

import { Component, type ReactNode, useEffect, useState } from "react";
import { InstantSearchNext } from "react-instantsearch-nextjs";

import { indexName, searchClient } from "@/lib/algolia";

/**
 * Lightweight InstantSearchNext wrapper for Recommend rails that live
 * outside the /search route's search context (homepage, detail page).
 *
 * Recommend queries run client-only: InstantSearchNext otherwise fetches
 * Recommend results during SSR, and an untrained model makes the Algolia
 * client retry/throw server-side, hanging the whole page render. Deferring
 * to mount keeps the page's initial HTML fast and lets RailBoundary catch
 * any client-side Recommend errors.
 */
export function RailShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <RailEmpty message="Loading recommendations…" />;
  }

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

/**
 * Recommend models may not be trained on a fresh app — the API then errors
 * with "Index ai_recommend_*:...indice.bin does not exist" instead of
 * returning empty results. A widget-level `emptyComponent` can't catch that,
 * so this boundary degrades the rail to a graceful message instead of taking
 * the whole page down.
 */
export class RailBoundary extends Component<
  { fallback: string; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <RailEmpty message={this.props.fallback} />;
    }
    return this.props.children;
  }
}
