"use client";

import "@algolia/autocomplete-theme-classic";

import { autocomplete } from "@algolia/autocomplete-js";
import { createLocalStorageRecentSearchesPlugin } from "@algolia/autocomplete-plugin-recent-searches";
import { createQuerySuggestionsPlugin } from "@algolia/autocomplete-plugin-query-suggestions";
import { getAlgoliaResults } from "@algolia/autocomplete-preset-algolia";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { indexName, qsIndexName, searchClient } from "@/lib/algolia";

type MovieHit = {
  objectID: string;
  title: string;
  year?: number;
  image?: string;
  genre?: string[];
};

type QuerySuggestionHit = {
  objectID: string;
  query: string;
};

type AnyItem = Record<string, unknown>;

/**
 * Global header search powered by @algolia/autocomplete-js.
 *
 * Three sources:
 *   - Recent searches (localStorage)
 *   - Query Suggestions (owned mode only — sandbox skips this)
 *   - Top movies (always)
 *
 * On selecting a movie → navigates to /movie/[objectID].
 * On Enter without selecting → navigates to /search?movies[query]=<term>.
 */
export function AutocompleteHeader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;

    const recentSearches = createLocalStorageRecentSearchesPlugin({
      key: "movies-recent",
      limit: 5,
    });

    const plugins = qsIndexName
      ? [
          recentSearches,
          createQuerySuggestionsPlugin({
            searchClient,
            indexName: qsIndexName,
            getSearchParams() {
              return (
                recentSearches.data?.getAlgoliaSearchParams({
                  hitsPerPage: 5,
                }) ?? { hitsPerPage: 5 }
              );
            },
            transformSource({ source }) {
              return {
                ...source,
                onSelect({ item }) {
                  const q = (item as QuerySuggestionHit).query;
                  router.push(
                    `/search?movies%5Bquery%5D=${encodeURIComponent(q)}`
                  );
                },
              };
            },
          }),
        ]
      : [recentSearches];

    const instance = autocomplete<AnyItem>({
      container: containerRef.current,
      placeholder: "Search 22,000 movies…",
      openOnFocus: true,
      detachedMediaQuery: "(max-width: 640px)",
      plugins,
      onSubmit({ state }) {
        if (state.query) {
          router.push(
            `/search?movies%5Bquery%5D=${encodeURIComponent(state.query)}`
          );
        }
      },
      getSources({ query }) {
        if (!query) return [];
        return [
          {
            sourceId: "movies",
            getItemUrl({ item }) {
              return `/movie/${(item as unknown as MovieHit).objectID}`;
            },
            getItems() {
              return getAlgoliaResults<AnyItem>({
                searchClient,
                queries: [
                  {
                    indexName,
                    params: { query, hitsPerPage: 5 },
                  },
                ],
              });
            },
            onSelect({ item }) {
              router.push(
                `/movie/${(item as unknown as MovieHit).objectID}`
              );
            },
            templates: {
              header() {
                return "Movies";
              },
              item({ item, html }) {
                const movie = item as unknown as MovieHit;
                const meta = [movie.year, movie.genre?.[0]]
                  .filter(Boolean)
                  .join(" · ");
                return html`
                  <a class="ac-movie" href=${`/movie/${movie.objectID}`}>
                    ${movie.image
                      ? html`<img
                          class="ac-poster"
                          src=${movie.image}
                          alt=""
                          loading="lazy"
                        />`
                      : html`<div class="ac-poster ac-poster-empty"></div>`}
                    <div class="ac-movie-meta">
                      <span class="ac-movie-title">${movie.title}</span>
                      ${meta ? html`<span class="ac-movie-sub">${meta}</span>` : null}
                    </div>
                  </a>
                `;
              },
              noResults() {
                return "No movies found.";
              },
            },
          },
        ];
      },
    });

    return () => {
      instance.destroy();
    };
  }, [router]);

  return <div ref={containerRef} className="autocomplete-host w-full" />;
}

