"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { agentId, algoliaAppId, algoliaSearchKey } from "@/lib/algolia";

const SAMPLE_PROMPTS = [
  "Recommend a feel-good comedy from the 1990s",
  "What are some movies about lonely robots?",
  "Best sci-fi from before 1985",
  "Suggest a thriller with Tom Hanks",
];

function NotConfigured() {
  return (
    <div className="mx-auto max-w-2xl border border-dashed border-border px-8 py-12 text-center">
      <p className="font-heading text-xs tracking-[0.25em] uppercase text-muted-foreground">
        Agent Studio
      </p>
      <h2 className="font-heading mt-4 text-2xl font-semibold uppercase leading-tight">
        Not configured for this environment
      </h2>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground mx-auto">
        Create an agent in the Algolia dashboard (Agent Studio → Create Agent),
        ground it against your movies index, then paste its agent ID into
        <code className="mx-1 font-mono">NEXT_PUBLIC_ALGOLIA_AGENT_ID</code>.
      </p>
      <div className="mt-6 flex justify-center">
        <Button asChild variant="outline">
          <Link href="https://dashboard.algolia.com" target="_blank">
            Open Algolia dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function AgentChat() {
  if (!agentId) {
    return <NotConfigured />;
  }
  return <Chat />;
}

function Chat() {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `https://${algoliaAppId}.algolia.net/agent-studio/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-5`,
      headers: {
        "x-algolia-application-id": algoliaAppId,
        "x-algolia-api-key": algoliaSearchKey,
      },
    }),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function submit(text: string) {
    const value = text.trim();
    if (!value) return;
    sendMessage({ text: value });
    setInput("");
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-220px)] max-w-[860px] flex-col gap-4 px-6 py-8">
      <header className="space-y-2">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-muted-foreground">
          Agent Studio · streaming
        </p>
        <h1 className="font-heading text-2xl font-semibold uppercase leading-tight">
          Ask the movies agent
        </h1>
      </header>

      <ol className="flex-1 space-y-4 overflow-y-auto border border-border bg-card p-4">
        {messages.length === 0 ? (
          <li className="flex flex-col items-start gap-3 text-sm">
            <p className="text-muted-foreground">
              Try one of these prompts, or write your own.
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="default"
                  onClick={() => submit(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </li>
        ) : null}

        {messages.map((m) => (
          <li
            key={m.id}
            className={
              m.role === "user"
                ? "ml-auto max-w-[80%] border border-border bg-muted px-4 py-3 text-sm"
                : "max-w-[80%] border border-border bg-background px-4 py-3 text-sm"
            }
          >
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              {m.role}
            </p>
            <div className="mt-2 space-y-2 leading-relaxed">
              {m.parts?.map((part, idx) =>
                part.type === "text" ? (
                  <p key={idx}>{part.text}</p>
                ) : null
              )}
            </div>
          </li>
        ))}
        <div ref={endRef} />
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(input);
            }
          }}
          placeholder="Ask anything about movies…"
          rows={1}
          className="min-h-[44px] flex-1 resize-y border border-border bg-background px-3 py-2 font-sans text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <Button
          type="submit"
          disabled={!input.trim() || status === "streaming"}
        >
          {status === "streaming" ? "…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
