"use client";

import { useInstantSearch } from "react-instantsearch";

type AppliedRule = {
  objectID?: string;
  description?: string;
};

type ResultsWithRules = {
  appliedRules?: AppliedRule[];
};

type Props = {
  visible: boolean;
};

export function AppliedRulesDebug({ visible }: Props) {
  const { results } = useInstantSearch();

  if (!visible) return null;

  const applied =
    (results as ResultsWithRules | undefined)?.appliedRules ?? [];
  if (applied.length === 0) {
    return (
      <p className="border border-dashed border-border px-4 py-3 font-mono text-[11px] tracking-wide text-muted-foreground">
        Rules applied: none (try &quot;star wars&quot;, &quot;oscars&quot;, or
        &quot;scifi&quot;)
      </p>
    );
  }

  const labels = applied.map((rule: AppliedRule) => {
    const id = rule.objectID ?? "unknown";
    return typeof rule.description === "string" && rule.description
      ? `${id} (${rule.description})`
      : id;
  });

  return (
    <p className="border border-border bg-muted/30 px-4 py-3 font-mono text-[11px] leading-relaxed tracking-wide text-muted-foreground">
      Rules applied: {labels.join(" · ")}
    </p>
  );
}
