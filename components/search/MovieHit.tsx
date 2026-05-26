"use client";

import Link from "next/link";
import { Highlight } from "react-instantsearch";
import type { Hit } from "instantsearch.js";

import { Poster } from "@/components/movie/Poster";
import { sentClickedMovie } from "@/lib/insights";
import { cn } from "@/lib/utils";

export type MovieFields = {
  title: string;
  alternative_titles?: string[];
  year?: number;
  genre?: string[];
  actors?: string[];
  image?: string;
  score?: number;
  rating?: number;
};

export type MovieRecord = Hit<MovieFields>;

type Props = {
  hit: MovieRecord;
  className?: string;
};

export function MovieHit({ hit, className }: Props) {
  const promoted = hit._rankingInfo?.promoted;

  function handleClick() {
    if (hit.__queryID && hit.__position !== undefined) {
      sentClickedMovie(hit.objectID, hit.__queryID, hit.__position);
    }
  }

  return (
    <Link
      href={`/movie/${hit.objectID}`}
      onClick={handleClick}
      className={cn(
        "group/hit flex flex-col border border-border bg-card transition-colors hover:bg-muted",
        className
      )}
    >
      <div className="relative aspect-[2/3] w-full">
        <Poster
          src={hit.image}
          alt={hit.title}
          className="size-full"
          imgClassName="transition-transform duration-300 group-hover/hit:scale-[1.02]"
        />
        {promoted ? (
          <span className="absolute top-2 left-2 bg-primary px-2 py-1 font-mono text-[10px] tracking-widest text-primary-foreground uppercase">
            ★ Pinned
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-heading text-sm font-semibold uppercase leading-tight tracking-wide">
          <Highlight attribute="title" hit={hit} />
        </h3>
        <div className="flex items-center justify-between gap-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          <span>{hit.year ?? "—"}</span>
          {typeof hit.rating === "number" || typeof hit.score === "number" ? (
            <span aria-label="Rating">
              ★ {(hit.rating ?? hit.score)!.toFixed(1)}
            </span>
          ) : null}
        </div>
        {hit.genre?.length ? (
          <div className="mt-auto flex flex-wrap gap-1.5">
            {hit.genre.slice(0, 3).map((g) => (
              <span
                key={g}
                className="border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-widest uppercase"
              >
                {g}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
