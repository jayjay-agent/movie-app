"use client";

import { TrendingItems } from "react-instantsearch";

import { MoviePosterTile } from "@/components/search/MoviePosterTile";
import type { RawMovie } from "@/lib/algolia";

import {
  RailEmpty,
  RailHeader,
  RailScroller,
  RailShell,
} from "./RailShell";

type Props = {
  title?: string;
  facetName?: string;
  facetValue?: string;
  limit?: number;
};

export function TrendingRail({
  title,
  facetName,
  facetValue,
  limit = 12,
}: Props) {
  return (
    <section className="space-y-3">
      <RailHeader
        eyebrow="Trending"
        title={
          title ?? (facetName && facetValue ? `Trending · ${facetValue}` : "This week")
        }
      />
      <RailShell>
        <TrendingItems<RawMovie>
          limit={limit}
          facetName={facetName}
          facetValue={facetValue}
          itemComponent={({ item }) => (
            <li className="list-none snap-start">
              <MoviePosterTile item={item} />
            </li>
          )}
          emptyComponent={() => (
            <RailEmpty message="Recommendation models still warming up" />
          )}
          classNames={{
            list: "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-6 lg:overflow-visible",
          }}
        />
      </RailShell>
    </section>
  );
}

// Re-export so the homepage doesn't need to know about the scroller.
export { RailScroller };
