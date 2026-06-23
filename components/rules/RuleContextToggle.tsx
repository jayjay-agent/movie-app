"use client";

import { ToggleChip } from "@/components/ui/toggle-chip";
import { algoliaMode } from "@/lib/algolia";

type Props = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
};

export function RuleContextToggle({ enabled, onEnabledChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <ToggleChip
        label="Weekend context"
        pressed={enabled}
        onPressedChange={() => onEnabledChange(!enabled)}
      />
      <p className="max-w-xs text-[11px] leading-snug text-muted-foreground">
        {enabled
          ? algoliaMode === "owned"
            ? "Sends ruleContexts=weekend — requires the weekend rule (paid plan)."
            : "Sandbox mode has no custom rules — toggle visible for demo wiring only."
          : "Off — standard rule matching only."}
      </p>
    </div>
  );
}
