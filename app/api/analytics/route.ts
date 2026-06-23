import { NextResponse } from "next/server";

import { algoliaAppId, indexName } from "@/lib/algolia";

export const revalidate = 60;

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

function authHeaders(key: string) {
  return {
    "X-Algolia-Application-Id": algoliaAppId,
    "X-Algolia-API-Key": key,
  };
}

async function fetchJSON<T>(url: string, key: string): Promise<T | null> {
  const res = await fetch(url, {
    headers: authHeaders(key),
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export async function GET() {
  const analyticsKey = process.env.ALGOLIA_ANALYTICS_KEY;
  if (!analyticsKey) {
    const payload: AnalyticsResponse = {
      configured: false,
      indexName,
      topSearches: [],
      noResultSearches: [],
      clickThroughRate: null,
      conversionRate: null,
      totalSearches: null,
    };
    return NextResponse.json(payload);
  }

  const base = "https://analytics.algolia.com/2";
  const qs = `?index=${encodeURIComponent(indexName)}&limit=10`;

  const [top, noResults, ctr, conv, count] = await Promise.all([
    fetchJSON<{ searches: SearchRow[] }>(`${base}/searches${qs}`, analyticsKey),
    fetchJSON<{ searches: SearchRow[] }>(
      `${base}/searches/noResults${qs}`,
      analyticsKey
    ),
    fetchJSON<{ rate: number }>(
      `${base}/clicks/clickThroughRate${qs}`,
      analyticsKey
    ),
    fetchJSON<{ rate: number }>(
      `${base}/conversions/conversionRate${qs}`,
      analyticsKey
    ),
    fetchJSON<{ count: number }>(`${base}/searches/count${qs}`, analyticsKey),
  ]);

  const payload: AnalyticsResponse = {
    configured: true,
    indexName,
    topSearches: top?.searches ?? [],
    noResultSearches: noResults?.searches ?? [],
    clickThroughRate: ctr?.rate ?? null,
    conversionRate: conv?.rate ?? null,
    totalSearches: count?.count ?? null,
  };

  return NextResponse.json(payload);
}
