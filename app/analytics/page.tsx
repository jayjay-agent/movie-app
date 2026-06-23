import Link from "next/link";

import { algoliaMode, indexName } from "@/lib/algolia";

type SearchRow = { search: string; count: number; nbHits?: number };

type AnalyticsResponse = {
  configured: boolean;
  indexName: string;
  topSearches: SearchRow[];
  noResultSearches: SearchRow[];
  clickThroughRate: number | null;
  conversionRate: number | null;
  totalSearches: number | null;
};

export const metadata = {
  title: "Analytics · Movie App",
  description:
    "Top searches, no-result rate, click-through rate, conversion rate from the Algolia Analytics API.",
};

async function fetchAnalytics(): Promise<AnalyticsResponse> {
  // Server-side: the analytics key lives in process.env, never reaches the browser.
  const analyticsKey = process.env.ALGOLIA_ANALYTICS_KEY;
  if (!analyticsKey) {
    return {
      configured: false,
      indexName,
      topSearches: [],
      noResultSearches: [],
      clickThroughRate: null,
      conversionRate: null,
      totalSearches: null,
    };
  }
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "";
  const base = "https://analytics.algolia.com/2";
  const qs = `?index=${encodeURIComponent(indexName)}&limit=10`;
  const headers = {
    "X-Algolia-Application-Id": appId,
    "X-Algolia-API-Key": analyticsKey,
  };
  async function fj<T>(url: string): Promise<T | null> {
    try {
      const res = await fetch(url, { headers, next: { revalidate: 60 } });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }
  const [top, noResults, ctr, conv, count] = await Promise.all([
    fj<{ searches: SearchRow[] }>(`${base}/searches${qs}`),
    fj<{ searches: SearchRow[] }>(`${base}/searches/noResults${qs}`),
    fj<{ rate: number }>(`${base}/clicks/clickThroughRate${qs}`),
    fj<{ rate: number }>(`${base}/conversions/conversionRate${qs}`),
    fj<{ count: number }>(`${base}/searches/count${qs}`),
  ]);
  return {
    configured: true,
    indexName,
    topSearches: top?.searches ?? [],
    noResultSearches: noResults?.searches ?? [],
    clickThroughRate: ctr?.rate ?? null,
    conversionRate: conv?.rate ?? null,
    totalSearches: count?.count ?? null,
  };
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 font-heading text-3xl font-semibold uppercase tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="mx-auto max-w-2xl border border-dashed border-border px-8 py-12 text-center">
      <p className="font-heading text-xs tracking-[0.25em] uppercase text-muted-foreground">
        Analytics
      </p>
      <h2 className="font-heading mt-4 text-2xl font-semibold uppercase leading-tight">
        Analytics key not configured
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Set <code className="font-mono">ALGOLIA_ANALYTICS_KEY</code> in your
        <code className="mx-1 font-mono">.env.local</code> to surface top
        searches, no-result rate, CTR and conversion rate.
      </p>
    </div>
  );
}

export default async function AnalyticsPage() {
  const data = await fetchAnalytics();

  if (!data.configured) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <NotConfigured />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-10 px-6 py-12">
      <header className="space-y-2">
        <p className="font-mono text-xs tracking-[0.25em] uppercase text-muted-foreground">
          {algoliaMode} · index {data.indexName}
        </p>
        <h1 className="font-heading text-3xl font-semibold uppercase leading-tight tracking-tight">
          Analytics
        </h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total searches"
          value={
            data.totalSearches !== null
              ? data.totalSearches.toLocaleString()
              : "—"
          }
        />
        <MetricCard
          label="Click-through rate"
          value={
            data.clickThroughRate !== null
              ? `${(data.clickThroughRate * 100).toFixed(1)}%`
              : "—"
          }
          hint="clicks ÷ searches with a click"
        />
        <MetricCard
          label="Conversion rate"
          value={
            data.conversionRate !== null
              ? `${(data.conversionRate * 100).toFixed(1)}%`
              : "—"
          }
          hint="conversions ÷ searches"
        />
        <MetricCard
          label="No-result rate"
          value={
            data.totalSearches && data.noResultSearches.length
              ? `${(
                  (data.noResultSearches.reduce((s, r) => s + r.count, 0) /
                    data.totalSearches) *
                    100
                ).toFixed(1)}%`
              : "—"
          }
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <SearchTable
          title="Top searches"
          rows={data.topSearches}
          emptyMessage="No searches recorded yet."
        />
        <SearchTable
          title="No-result searches"
          rows={data.noResultSearches}
          emptyMessage="No no-result searches — relevance looking good."
        />
      </section>
    </div>
  );
}

function SearchTable({
  title,
  rows,
  emptyMessage,
}: {
  title: string;
  rows: SearchRow[];
  emptyMessage: string;
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-xs tracking-[0.25em] uppercase text-muted-foreground">
        {title}
      </h2>
      {rows.length === 0 ? (
        <div className="border border-dashed border-border px-4 py-8 text-center font-mono text-xs tracking-widest uppercase text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <table className="w-full border border-border text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 font-mono text-[10px] tracking-widest uppercase">
              <th className="px-3 py-2 text-left">Query</th>
              <th className="px-3 py-2 text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.search} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2">
                  <Link
                    href={`/search?movies%5Bquery%5D=${encodeURIComponent(r.search)}`}
                    className="font-mono text-xs tracking-wide hover:underline"
                  >
                    {r.search}
                  </Link>
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs">
                  {r.count.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
