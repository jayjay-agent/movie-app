"use client";

import { useEffect, useState } from "react";
import {
  Configure,
  Hits,
  Pagination,
  useInstantSearch,
} from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";

import { EmptyResults } from "@/components/search/EmptyResults";
import { FacetSidebar } from "@/components/search/FacetSidebar";
import { MovieHit, type MovieRecord } from "@/components/search/MovieHit";
import { SearchToolbar } from "@/components/search/SearchToolbar";
import { indexName, searchClient } from "@/lib/algolia";
import { getOrCreateUserToken } from "@/lib/userToken";

function Results() {
  const { results, status } = useInstantSearch();
  const initialised = status !== "loading" || results?.__isArtificial === false;
  if (initialised && results && results.nbHits === 0 && results.query) {
    return <EmptyResults />;
  }
  return (
    <Hits<MovieRecord>
      hitComponent={({ hit }) => <MovieHit hit={hit} />}
      classNames={{
        list: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        item: "list-none",
      }}
    />
  );
}

export function SearchExperience() {
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    setUserToken(getOrCreateUserToken());
  }, []);

  return (
    <InstantSearchNext
      indexName={indexName}
      searchClient={searchClient}
      routing
      insights
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Configure
        hitsPerPage={24}
        clickAnalytics
        enablePersonalization={Boolean(userToken)}
        {...(userToken ? { userToken } : {})}
      />

      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-8 lg:grid-cols-[260px_1fr]">
        <FacetSidebar />
        <div className="min-w-0 space-y-6">
          <SearchToolbar />
          <Results />
          <Pagination
            classNames={{
              root: "flex justify-center pt-6",
              list: "flex items-center gap-1 font-mono text-xs tracking-widest uppercase",
              item: "border border-border",
              link: "block px-3 py-2 hover:bg-muted",
              selectedItem: "bg-primary text-primary-foreground",
              disabledItem: "opacity-40 pointer-events-none",
            }}
          />
        </div>
      </div>
    </InstantSearchNext>
  );
}
