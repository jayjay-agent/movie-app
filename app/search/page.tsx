import { Suspense } from "react";

import { SearchExperience } from "./SearchExperience";

export const metadata = {
  title: "Search · Movie App",
  description:
    "Faceted, sortable, URL-synced search across the Algolia movies index.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px] px-6 py-12 font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Loading search…
        </div>
      }
    >
      <SearchExperience />
    </Suspense>
  );
}
