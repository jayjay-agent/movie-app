"use client";

import Link from "next/link";

import type { RawMovie } from "@/lib/algolia";
import { sentClickedMovie } from "@/lib/insights";
import { cn } from "@/lib/utils";

type Props = {
  item: RawMovie & {
    __queryID?: string;
    __position?: number;
  };
  className?: string;
};

/**
 * Compact poster tile used inside Recommend rails. Smaller than MovieHit,
 * no facet chips, no Highlight (Recommend hits don't carry _highlightResult).
 */
export function MoviePosterTile({ item, className }: Props) {
  function handleClick() {
    if (item.__queryID && typeof item.__position === "number") {
      sentClickedMovie(item.objectID, item.__queryID, item.__position);
    }
  }

  return (
    <Link
      href={`/movie/${item.objectID}`}
      onClick={handleClick}
      className={cn(
        "group/tile flex w-[160px] shrink-0 flex-col gap-2 sm:w-[180px]",
        className
      )}
    >
      <div className="aspect-[2/3] w-full overflow-hidden border border-border bg-muted">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover/tile:scale-[1.03]"
          />
        ) : (
          <div
            aria-hidden
            className="size-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--muted), var(--muted) 6px, var(--background) 6px, var(--background) 12px)",
            }}
          />
        )}
      </div>
      <div className="space-y-1">
        <p className="line-clamp-2 font-heading text-xs font-semibold uppercase tracking-wide">
          {item.title}
        </p>
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          {[item.year, item.genre?.[0]].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
    </Link>
  );
}
