/**
 * search-insights wrapper.
 *
 * - Initializes the `aa` client once with the anonymous user token.
 * - Exposes typed helpers for the events we actually fire.
 * - Maintains a small in-memory ring buffer of recent events so the UI can
 *   surface activity in the Personalization debug panel (U9).
 */

"use client";

import aa from "search-insights";

import { algoliaAppId, algoliaSearchKey, indexName } from "./algolia";
import { getOrCreateUserToken, resetUserToken } from "./userToken";

export type InsightsEvent =
  | {
      kind: "view";
      objectID: string;
      timestamp: number;
    }
  | {
      kind: "click";
      objectID: string;
      queryID: string;
      position: number;
      timestamp: number;
    }
  | {
      kind: "convert";
      objectID: string;
      queryID: string | null;
      timestamp: number;
    };

const RING_SIZE = 25;
const ringBuffer: InsightsEvent[] = [];
const subscribers = new Set<(events: readonly InsightsEvent[]) => void>();

let initialized = false;
let currentToken: string | null = null;

function publish(event: InsightsEvent) {
  ringBuffer.unshift(event);
  if (ringBuffer.length > RING_SIZE) ringBuffer.pop();
  for (const sub of subscribers) sub([...ringBuffer]);
}

/**
 * Idempotent. Safe to call from a top-level provider's `useEffect`.
 */
export function initInsights(): string | null {
  if (typeof window === "undefined") return null;
  const token = getOrCreateUserToken();
  if (initialized) return currentToken;

  aa("init", {
    appId: algoliaAppId,
    apiKey: algoliaSearchKey,
    useCookie: false,
    partial: true,
  });
  if (token) aa("setUserToken", token);
  initialized = true;
  currentToken = token;
  return token;
}

/**
 * Returns the current user token in-memory. Call after `initInsights()`.
 */
export function getCurrentUserToken(): string | null {
  return currentToken;
}

/**
 * Rotates the user token and re-sets it on the Insights client.
 * Returns the new token.
 */
export function rotateUserToken(): string | null {
  const next = resetUserToken();
  if (next) aa("setUserToken", next);
  currentToken = next;
  return next;
}

/**
 * Subscribe to recent-events updates. Returns an unsubscribe function.
 */
export function subscribeToEvents(
  cb: (events: readonly InsightsEvent[]) => void
): () => void {
  subscribers.add(cb);
  cb([...ringBuffer]);
  return () => {
    subscribers.delete(cb);
  };
}

/**
 * Fire a `viewedObjectIDs` event for a single movie.
 * Used by ViewTracker on the detail page.
 */
export function sentViewedMovie(objectID: string): void {
  if (!initialized) return;
  aa("viewedObjectIDs", {
    eventName: "Movie Viewed",
    index: indexName,
    objectIDs: [objectID],
  });
  publish({ kind: "view", objectID, timestamp: Date.now() });
}

/**
 * Fire a `clickedObjectIDsAfterSearch` event for a movie clicked from
 * a results list.
 */
export function sentClickedMovie(
  objectID: string,
  queryID: string,
  position: number
): void {
  if (!initialized) return;
  aa("clickedObjectIDsAfterSearch", {
    eventName: "Movie Clicked",
    index: indexName,
    objectIDs: [objectID],
    queryID,
    positions: [position],
  });
  publish({ kind: "click", objectID, queryID, position, timestamp: Date.now() });
}

/**
 * Fire a `convertedObjectIDs(AfterSearch)` event — e.g. user added a movie
 * to a watchlist. `queryID` is optional; pass it when the conversion ties
 * back to a specific search.
 */
export function sentConvertedMovie(
  objectID: string,
  queryID: string | null = null
): void {
  if (!initialized) return;
  if (queryID) {
    aa("convertedObjectIDsAfterSearch", {
      eventName: "Movie Converted",
      index: indexName,
      objectIDs: [objectID],
      queryID,
    });
  } else {
    aa("convertedObjectIDs", {
      eventName: "Movie Converted",
      index: indexName,
      objectIDs: [objectID],
    });
  }
  publish({ kind: "convert", objectID, queryID, timestamp: Date.now() });
}
