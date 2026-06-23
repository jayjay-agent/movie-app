"use client";

import Link from "next/link";
import { useInstantSearch } from "react-instantsearch";

import { Button } from "@/components/ui/button";

type BannerPayload = {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type UserDataEntry = { banner?: BannerPayload };

/**
 * Renders an Algolia Rule's `userData.banner` payload when one matches the
 * current query. The rule that fires this is defined in data/rules.json
 * (search "oscars" to see it in action).
 */
export function PinnedBanner() {
  const { results } = useInstantSearch();
  const userData = (results?.userData ?? []) as UserDataEntry[];
  const banner = userData.find((u) => u.banner)?.banner;
  if (!banner) return null;

  return (
    <aside className="flex flex-col items-start gap-3 border border-primary bg-primary/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-primary">
          Algolia Rule
        </p>
        <h3 className="font-heading text-lg font-semibold uppercase leading-tight tracking-tight">
          {banner.title}
        </h3>
        {banner.subtitle ? (
          <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
        ) : null}
      </div>
      {banner.ctaHref ? (
        <Button asChild>
          <Link href={banner.ctaHref}>{banner.ctaLabel ?? "Browse"}</Link>
        </Button>
      ) : null}
    </aside>
  );
}
