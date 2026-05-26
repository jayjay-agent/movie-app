"use client";

import type { Hit } from "instantsearch.js";
import { useEffect, useState } from "react";
import { Chat, ChatSidePanelLayout } from "react-instantsearch";

import { MoviePosterTile } from "@/components/search/MoviePosterTile";
import { agentId } from "@/lib/algolia";
import type { RawMovie } from "@/lib/algolia";

type ChatMovieHit = Hit<RawMovie>;

/**
 * Algolia Agentic InstantSearch — the <Chat> widget that lives INSIDE the
 * InstantSearchNext provider, alongside the regular hits.
 *
 * Distinct from the /agent route (which is a standalone full-page chat
 * using @ai-sdk/react against the same Agent Studio endpoint). Both surfaces
 * call the same agent; this one composes with hits.
 *
 * Renders nothing if NEXT_PUBLIC_ALGOLIA_AGENT_ID is unset.
 */
export function AgenticChat() {
  // The Chat widget reads sessionStorage at construction time, which throws
  // under Next.js SSR. Defer mount until the browser has hydrated.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!agentId || !mounted) return null;

  return (
    <Chat<ChatMovieHit>
      agentId={agentId}
      feedback
      layoutComponent={ChatSidePanelLayout}
      itemComponent={({ item }) => (
        <MoviePosterTile item={item as RawMovie} />
      )}
      headerProps={{
        translations: {
          title: "Movies AI",
        },
      }}
      promptProps={{
        translations: {
          textareaPlaceholder:
            "Ask the agent — 'feel-good 90s comedy', 'sci-fi about isolation'…",
          disclaimer: "Movies AI · responses are AI-generated.",
        },
      }}
    />
  );
}
