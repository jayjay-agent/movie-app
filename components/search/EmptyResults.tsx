"use client";

import { useClearRefinements, useSearchBox } from "react-instantsearch";

import { Button } from "@/components/ui/button";

const SUGGESTED_QUERIES = ["action", "comedy", "1990s", "Tom Hanks", "sci-fi"];

export function EmptyResults() {
  const { refine } = useSearchBox();
  const { refine: clearAll } = useClearRefinements();

  return (
    <div className="flex flex-col items-center justify-center gap-6 border border-dashed border-border px-6 py-20 text-center">
      <p className="font-heading text-sm tracking-widest uppercase text-muted-foreground">
        Nothing matched
      </p>
      <h2 className="font-heading max-w-md text-2xl font-semibold uppercase leading-tight tracking-tight">
        No movies found for this combination.
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Try removing a filter, broadening your query, or one of the suggestions
        below.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SUGGESTED_QUERIES.map((q) => (
          <Button
            key={q}
            variant="outline"
            size="default"
            onClick={() => {
              clearAll();
              refine(q);
            }}
          >
            {q}
          </Button>
        ))}
      </div>
    </div>
  );
}
