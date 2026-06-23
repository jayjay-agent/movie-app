"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Configure,
  Hits,
  Pagination,
  useInstantSearch,
} from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";

import { AppliedRulesDebug } from "@/components/rules/AppliedRulesDebug";
import { PinnedBanner } from "@/components/rules/PinnedBanner";
import { AgenticChat } from "@/components/search/AgenticChat";
import { EmptyResults } from "@/components/search/EmptyResults";
import { FacetSidebar } from "@/components/search/FacetSidebar";
import { MovieHit, type MovieRecord } from "@/components/search/MovieHit";
import { PersonalizationEventLog } from "@/components/search/PersonalizationEventLog";
import { SearchToolbar } from "@/components/search/SearchToolbar";
import { indexName, searchClient } from "@/lib/algolia";
import { rotateUserToken } from "@/lib/insights";
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

type SearchConfigureProps = {
  personalizationEnabled: boolean;
  userToken: string | null;
  weekendContextEnabled: boolean;
};

function SearchConfigure({
  personalizationEnabled,
  userToken,
  weekendContextEnabled,
}: SearchConfigureProps) {
  return (
    <Configure
      hitsPerPage={24}
      clickAnalytics
      {...(personalizationEnabled && userToken
        ? {
            enablePersonalization: true,
            personalizationImpact: 100,
            userToken,
          }
        : {})}
      {...(weekendContextEnabled ? { ruleContexts: ["weekend"] } : {})}
    />
  );
}

export function SearchExperience() {
  const searchParams = useSearchParams();
  const debug = searchParams.get("debug") === "1";

  const [userToken, setUserToken] = useState<string | null>(null);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
  const [weekendContextEnabled, setWeekendContextEnabled] = useState(false);

  useEffect(() => {
    setUserToken(getOrCreateUserToken());
  }, []);

  function handleResetSession() {
    setUserToken(rotateUserToken());
  }

  return (
    <InstantSearchNext
      indexName={indexName}
      searchClient={searchClient}
      routing
      insights
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <SearchConfigure
        personalizationEnabled={personalizationEnabled}
        userToken={userToken}
        weekendContextEnabled={weekendContextEnabled}
      />

      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-8 lg:grid-cols-[260px_1fr]">
        <FacetSidebar />
        <div className="min-w-0 space-y-6">
          <SearchToolbar
            personalizationEnabled={personalizationEnabled}
            onPersonalizationChange={setPersonalizationEnabled}
            userToken={userToken}
            onResetSession={handleResetSession}
            weekendContextEnabled={weekendContextEnabled}
            onWeekendContextChange={setWeekendContextEnabled}
          />
          <PinnedBanner />
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
          <AppliedRulesDebug visible={debug} />
          <PersonalizationEventLog visible={debug} />
        </div>
      </div>

      <AgenticChat />
    </InstantSearchNext>
  );
}
