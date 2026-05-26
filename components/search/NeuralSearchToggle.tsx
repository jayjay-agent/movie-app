"use client";

import { useEffect, useState } from "react";

type Mode = "keywordSearch" | "neuralSearch";

/**
 * Toggles the index's `mode` setting between keyword and neural search.
 *
 * The state is server-side (an index setting), so this component:
 *  - GETs the current mode on mount
 *  - POSTs to /api/neural-mode on change
 *  - Surfaces the dashboard notice (e.g. "needs more events") inline
 *
 * In sandbox mode the toggle will fail with a 500 (admin key required);
 * the inline error makes that clear instead of crashing the page.
 */
export function NeuralSearchToggle() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/neural-mode")
      .then((r) => r.json())
      .then((data: { ok: boolean; mode?: Mode; error?: string }) => {
        if (data.ok && data.mode) setMode(data.mode);
        else setNotice(data.error ?? "Mode unavailable — admin key not set?");
      })
      .catch(() => setNotice("Could not read current mode."));
  }, []);

  async function toggle() {
    if (!mode || busy) return;
    const next: Mode = mode === "neuralSearch" ? "keywordSearch" : "neuralSearch";
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/neural-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: next }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        mode?: Mode;
        notice?: string | null;
        error?: string;
      };
      if (data.ok && data.mode) {
        setMode(data.mode);
        if (data.notice) setNotice(data.notice);
      } else {
        setNotice(data.error ?? "Failed to switch mode.");
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Network error.");
    } finally {
      setBusy(false);
    }
  }

  const isNeural = mode === "neuralSearch";
  const disabled = !mode || busy;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-pressed={isNeural}
        className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          aria-hidden
          className={
            "inline-block h-2 w-2 rounded-full " +
            (isNeural ? "bg-primary" : "bg-muted-foreground")
          }
        />
        <span>
          {mode === null ? "Mode …" : isNeural ? "Neural" : "Keyword"}
        </span>
      </button>
      {notice ? (
        <p className="max-w-xs text-[11px] leading-snug text-muted-foreground">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
