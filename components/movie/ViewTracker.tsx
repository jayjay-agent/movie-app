"use client";

import { useEffect, useRef } from "react";

import { sentViewedMovie } from "@/lib/insights";

/**
 * Fires a single `viewedObjectIDs` Insights event on mount.
 * Guards against double-fire under React strict mode / fast refresh.
 */
export function ViewTracker({ objectID }: { objectID: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    sentViewedMovie(objectID);
  }, [objectID]);

  return null;
}
