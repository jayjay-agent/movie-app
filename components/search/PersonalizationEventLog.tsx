"use client";

import { useEffect, useState } from "react";

import {
  subscribeToEvents,
  type InsightsEvent,
} from "@/lib/insights";

function formatEvent(event: InsightsEvent): string {
  const time = new Date(event.timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  switch (event.kind) {
    case "view":
      return `${time} · view · ${event.objectID}`;
    case "click":
      return `${time} · click · ${event.objectID} · pos ${event.position}`;
    case "convert":
      return `${time} · convert · ${event.objectID}`;
  }
}

type Props = {
  /** When false the panel is not rendered. */
  visible: boolean;
};

export function PersonalizationEventLog({ visible }: Props) {
  const [events, setEvents] = useState<readonly InsightsEvent[]>([]);

  useEffect(() => {
    if (!visible) return;
    return subscribeToEvents(setEvents);
  }, [visible]);

  if (!visible) return null;

  return (
    <details className="border border-border bg-muted/30 px-4 py-3">
      <summary className="cursor-pointer font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
        Insights events ({events.length})
      </summary>
      {events.length === 0 ? (
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          No events yet — view or click movies to populate.
        </p>
      ) : (
        <ul className="mt-3 space-y-1 font-mono text-[11px] leading-relaxed">
          {events.slice(0, 5).map((event, i) => (
            <li key={`${event.kind}-${event.objectID}-${event.timestamp}-${i}`}>
              {formatEvent(event)}
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
