"use client";

import { useEffect, useState } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { initInsights } from "@/lib/insights";

/**
 * Root client provider tree.
 *
 * - Wraps `next-themes` ThemeProvider (light/dark via the `d` hotkey).
 * - Initializes search-insights on first paint with the anonymous user token.
 *
 * Mounted from `app/layout.tsx`.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(initInsights());
  }, []);

  return <ThemeProvider>{children}</ThemeProvider>;
}
