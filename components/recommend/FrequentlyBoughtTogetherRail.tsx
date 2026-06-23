"use client";

import { FrequentlyBoughtTogether } from "react-instantsearch";

import { MoviePosterTile } from "@/components/search/MoviePosterTile";
import type { RawMovie } from "@/lib/algolia";

import { RailBoundary, RailEmpty, RailHeader, RailShell } from "./RailShell";

export function FrequentlyBoughtTogetherRail({
  objectID,
}: {
  objectID: string;
}) {
  return (
    <section className="mx-auto max-w-[1200px] space-y-3 px-6 py-12">
      <RailHeader eyebrow="Recommend" title="Often watched together" />
      <RailShell>
        <RailBoundary fallback="No FBT model trained yet — needs conversion events">
          <FrequentlyBoughtTogether<RawMovie>
            objectIDs={[objectID]}
            limit={6}
            itemComponent={({ item }) => (
              <li className="list-none snap-start">
                <MoviePosterTile item={item} />
              </li>
            )}
            emptyComponent={() => (
              <RailEmpty message="No FBT model trained yet — needs conversion events" />
            )}
            classNames={{
              list: "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-6 lg:overflow-visible",
            }}
          />
        </RailBoundary>
      </RailShell>
    </section>
  );
}
