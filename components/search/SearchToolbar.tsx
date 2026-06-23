"use client";

import {
  CurrentRefinements,
  SearchBox,
  SortBy,
  Stats,
} from "react-instantsearch";

import { RuleContextToggle } from "@/components/rules/RuleContextToggle";
import { NeuralSearchToggle } from "@/components/search/NeuralSearchToggle";
import { PersonalizationToggle } from "@/components/search/PersonalizationToggle";
import { indexName } from "@/lib/algolia";

const SORT_OPTIONS = [
  { label: "Relevance", value: indexName },
  { label: "Newest", value: `${indexName}_year_desc` },
  { label: "Top rated", value: `${indexName}_rating_desc` },
];

type Props = {
  personalizationEnabled: boolean;
  onPersonalizationChange: (enabled: boolean) => void;
  userToken: string | null;
  onResetSession: () => void;
  weekendContextEnabled: boolean;
  onWeekendContextChange: (enabled: boolean) => void;
};

export function SearchToolbar({
  personalizationEnabled,
  onPersonalizationChange,
  userToken,
  onResetSession,
  weekendContextEnabled,
  onWeekendContextChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBox
          placeholder="Search movies by title, actor, plot…"
          autoFocus
          classNames={{
            root: "w-full lg:max-w-xl",
            form: "relative",
            input:
              "h-11 w-full border border-border bg-background px-4 pr-10 font-sans text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30",
            submit: "absolute right-2 top-1/2 -translate-y-1/2 hidden",
            reset: "absolute right-2 top-1/2 -translate-y-1/2 hidden",
            loadingIndicator:
              "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground",
          }}
        />
        <div className="flex flex-wrap items-center gap-3 text-xs tracking-widest text-muted-foreground uppercase">
          <Stats
            translations={{
              rootElementText({ nbHits, processingTimeMS }) {
                if (nbHits === 0) return "no results";
                return `${nbHits.toLocaleString()} movies · ${processingTimeMS}ms`;
              },
            }}
          />
          <span aria-hidden>·</span>
          <label className="flex items-center gap-2">
            <span>Sort</span>
            <SortBy
              items={SORT_OPTIONS}
              classNames={{
                select:
                  "h-9 border border-border bg-background px-3 font-mono text-[11px] tracking-widest uppercase focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30",
              }}
            />
          </label>
          <NeuralSearchToggle />
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6 border-t border-border pt-4">
        <PersonalizationToggle
          enabled={personalizationEnabled}
          onEnabledChange={onPersonalizationChange}
          userToken={userToken}
          onResetSession={onResetSession}
        />
        <RuleContextToggle
          enabled={weekendContextEnabled}
          onEnabledChange={onWeekendContextChange}
        />
      </div>

      <CurrentRefinements
        classNames={{
          root: "flex flex-wrap items-center gap-2 text-[11px] tracking-widest uppercase",
          item: "flex items-center gap-1 border border-border bg-muted px-2 py-1",
          delete:
            "ml-1 text-muted-foreground hover:text-foreground transition-colors",
        }}
      />
    </div>
  );
}
