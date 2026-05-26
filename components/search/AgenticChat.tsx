"use client";

import type { Hit } from "instantsearch.js";
import { useEffect, useState } from "react";
import { Chat, ChatSidePanelLayout } from "react-instantsearch";

import { MoviePosterTile } from "@/components/search/MoviePosterTile";
import { agentId } from "@/lib/algolia";
import type { RawMovie } from "@/lib/algolia";

type ChatMovieHit = Hit<RawMovie>;

const STARTER_PROMPTS = [
  "Feel-good comedies from the 90s",
  "Slow-burn sci-fi about isolation",
  "Underrated thrillers, post-2010",
  "Animated films that adults should watch",
];

type EmptyProps = {
  sendMessage?: (params: { text: string }) => void;
};

/**
 * Custom empty-state for the Chat widget. Replaces the default
 * ais-ChatGreeting with a richer console-style intro + clickable
 * starter prompts that fire sendMessage directly.
 */
function ChatIntro({ sendMessage }: EmptyProps) {
  return (
    <div className="chat-intro">
      <div className="chat-intro-meta">
        <span className="chat-intro-dot" aria-hidden />
        <span>Movies AI · Agent Studio</span>
      </div>

      <h2 className="chat-intro-headline">
        Ask the catalog
        <br />
        like a person.
      </h2>

      <p className="chat-intro-body">
        Describe the kind of movie you&apos;re in the mood for — by genre, era,
        cast, vibe, anything. The agent searches 133k titles and writes back.
      </p>

      <div className="chat-intro-divider">
        <span>Starter prompts</span>
      </div>

      <ul className="chat-intro-prompts">
        {STARTER_PROMPTS.map((prompt, i) => (
          <li key={prompt}>
            <button
              type="button"
              className="chat-intro-prompt"
              onClick={() => sendMessage?.({ text: prompt })}
            >
              <span className="chat-intro-prompt-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="chat-intro-prompt-text">{prompt}</span>
              <span className="chat-intro-prompt-arrow" aria-hidden>
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
          closeLabel: "Close",
          minimizeLabel: "Minimize",
          maximizeLabel: "Maximize",
          clearLabel: "Clear",
        },
      }}
      emptyComponent={ChatIntro}
      promptProps={{
        translations: {
          textareaLabel: "Message",
          textareaPlaceholder:
            "Describe a movie, mood, era, actor — anything",
          emptyMessageTooltip: "Type something to send",
          sendMessageTooltip: "Send",
          stopResponseTooltip: "Stop",
          disclaimer: "Powered by Algolia Agent Studio · Responses are AI-generated.",
        },
      }}
    />
  );
}
