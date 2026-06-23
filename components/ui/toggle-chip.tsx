"use client";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  pressed: boolean;
  onPressedChange: () => void;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * Compact on/off control matching NeuralSearchToggle styling.
 */
export function ToggleChip({
  label,
  pressed,
  onPressedChange,
  disabled,
  loading,
}: Props) {
  return (
    <button
      type="button"
      onClick={onPressedChange}
      disabled={disabled || loading}
      aria-pressed={pressed}
      className={cn(
        "inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[11px] tracking-widest uppercase transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
        pressed && "border-primary/40 bg-primary/5"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block h-2 w-2 rounded-full",
          pressed ? "bg-primary" : "bg-muted-foreground"
        )}
      />
      <span>{loading ? `${label} …` : label}</span>
    </button>
  );
}
