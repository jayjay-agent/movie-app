"use client";

import { Button } from "@/components/ui/button";
import { ToggleChip } from "@/components/ui/toggle-chip";

type Props = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  userToken: string | null;
  onResetSession: () => void;
};

export function PersonalizationToggle({
  enabled,
  onEnabledChange,
  userToken,
  onResetSession,
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleChip
          label="Personalization"
          pressed={enabled}
          onPressedChange={() => onEnabledChange(!enabled)}
          disabled={!userToken}
        />
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={onResetSession}
          disabled={!userToken}
        >
          Reset session
        </Button>
      </div>
      {!userToken ? (
        <p className="max-w-xs text-[11px] leading-snug text-muted-foreground">
          User token unavailable — personalization requires a browser session.
        </p>
      ) : (
        <p className="max-w-xs text-[11px] leading-snug text-muted-foreground">
          Re-ranks results from your browsing history in this browser.
        </p>
      )}
    </div>
  );
}
