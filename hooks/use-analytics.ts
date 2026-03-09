"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ResponseMetadata } from "@/types/response-metadata";
import { loadAllResponseMetadata } from "@/lib/storage/storage-helpers";

export interface AnalyticsFilters {
  method: string | null;
  statusCategory: string | null;
  requestId: string | null;
  envName: string | null;
  search: string;
}

export type AnalyticsRecord = ResponseMetadata & { requestId: string };

const defaultFilters: AnalyticsFilters = {
  method: null,
  statusCategory: null,
  requestId: null,
  envName: null,
  search: "",
};

export function computeStats(records: AnalyticsRecord[]) {
  const total = records.length;
  const avgDuration = total
    ? Math.round(records.reduce((s, r) => s + r.durationMs, 0) / total)
    : 0;
  const successCount = records.filter(
    (r) => r.statusCode >= 200 && r.statusCode < 300
  ).length;
  const successRate = total ? Math.round((successCount / total) * 100) : 0;
  const errorCount = records.filter(
    (r) => r.statusCode >= 400 || r.statusCode === 0
  ).length;
  const avgSize = total
    ? records.reduce((s, r) => s + r.responseSizeBytes, 0) / total
    : 0;
  const methodCounts = records.reduce(
    (acc, r) => {
      acc[r.method] = (acc[r.method] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const statusCounts = {
    "2xx": records.filter((r) => r.statusCode >= 200 && r.statusCode < 300)
      .length,
    "3xx": records.filter((r) => r.statusCode >= 300 && r.statusCode < 400)
      .length,
    "4xx": records.filter((r) => r.statusCode >= 400 && r.statusCode < 500)
      .length,
    "5xx": records.filter((r) => r.statusCode >= 500).length,
    "ERR": records.filter((r) => r.statusCode === 0).length,
  };
  const p95Duration = (() => {
    if (!total) return 0;
    const sorted = [...records].map((r) => r.durationMs).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * 0.95)] ?? 0;
  })();
  const uniqueEndpoints = new Set(records.map((r) => r.resolvedUrl)).size;

  return {
    total,
    avgDuration,
    successRate,
    errorCount,
    avgSize,
    methodCounts,
    statusCounts,
    p95Duration,
    uniqueEndpoints,
  };
}

export interface SlowestEndpoint {
  url: string;
  avgDuration: number;
  p95: number;
  callCount: number;
  errorRate: number;
}

export interface ErrorRateEntry {
  url: string;
  fullUrl: string;
  errorRate: number;
  total: number;
}

export interface TrendPoint {
  time: string;
  timestamp: number;
  url: string;
  duration: number;
}

export function useAnalytics() {
  const [allRecords, setAllRecords] = useState<AnalyticsRecord[]>([]);
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const flat = await loadAllResponseMetadata();
    setAllRecords(flat);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return allRecords.filter((r) => {
      if (filters.method && r.method !== filters.method) return false;
      if (filters.statusCategory) {
        const cat = filters.statusCategory;
        const s = r.statusCode;
        if (cat === "err" && s !== 0) return false;
        if (cat === "2xx" && !(s >= 200 && s < 300)) return false;
        if (cat === "3xx" && !(s >= 300 && s < 400)) return false;
        if (cat === "4xx" && !(s >= 400 && s < 500)) return false;
        if (cat === "5xx" && !(s >= 500)) return false;
      }
      if (filters.requestId && r.requestId !== filters.requestId) return false;
      if (filters.envName && r.envName !== filters.envName) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !r.requestName.toLowerCase().includes(q) &&
          !r.resolvedUrl.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [allRecords, filters]);

  const stats = useMemo(() => computeStats(filtered), [filtered]);

  const uniqueEnvNames = useMemo(() => {
    const names = new Set<string>();
    allRecords.forEach((r) => {
      if (r.envName) names.add(r.envName);
    });
    return Array.from(names).sort();
  }, [allRecords]);

  const hasActiveFilters =
    filters.method !== null ||
    filters.statusCategory !== null ||
    filters.requestId !== null ||
    filters.envName !== null ||
    filters.search !== "";

  const clearFilters = useCallback(() => setFilters(defaultFilters), []);

  // Slowest endpoints
  const slowestEndpoints = useMemo<SlowestEndpoint[]>(() => {
    const byUrl: Record<string, number[]> = {};
    const errorsByUrl: Record<string, { errors: number; total: number }> = {};
    filtered.forEach((r) => {
      if (!byUrl[r.resolvedUrl]) byUrl[r.resolvedUrl] = [];
      byUrl[r.resolvedUrl].push(r.durationMs);
      if (!errorsByUrl[r.resolvedUrl])
        errorsByUrl[r.resolvedUrl] = { errors: 0, total: 0 };
      errorsByUrl[r.resolvedUrl].total++;
      if (r.statusCode >= 400 || r.statusCode === 0)
        errorsByUrl[r.resolvedUrl].errors++;
    });
    return Object.entries(byUrl)
      .map(([url, durations]) => {
        const sorted = [...durations].sort((a, b) => a - b);
        const avg = Math.round(
          durations.reduce((s, d) => s + d, 0) / durations.length
        );
        const p95 =
          sorted[Math.floor(sorted.length * 0.95)] ??
          sorted[sorted.length - 1] ??
          0;
        const { errors, total } = errorsByUrl[url];
        return {
          url,
          avgDuration: avg,
          p95,
          callCount: durations.length,
          errorRate: Math.round((errors / total) * 100),
        };
      })
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);
  }, [filtered]);

  // Error rate by endpoint
  const errorRateData = useMemo<ErrorRateEntry[]>(() => {
    const byUrl: Record<
      string,
      { total: number; errors: number; url: string }
    > = {};
    filtered.forEach((r) => {
      if (!byUrl[r.resolvedUrl])
        byUrl[r.resolvedUrl] = { total: 0, errors: 0, url: r.resolvedUrl };
      byUrl[r.resolvedUrl].total++;
      if (r.statusCode >= 400 || r.statusCode === 0)
        byUrl[r.resolvedUrl].errors++;
    });
    return Object.values(byUrl)
      .map((d) => ({
        url: d.url.replace(/^https?:\/\/[^/]+/, "") || "/",
        fullUrl: d.url,
        errorRate: d.total > 0 ? Math.round((d.errors / d.total) * 100) : 0,
        total: d.total,
      }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 6);
  }, [filtered]);

  // Endpoint trend data (response time over time, top 5 endpoints)
  const endpointTrendData = useMemo(() => {
    const urlCounts = filtered.reduce(
      (acc, r) => {
        acc[r.resolvedUrl] = (acc[r.resolvedUrl] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const top5Urls = Object.entries(urlCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([url]) => url);

    const points: TrendPoint[] = filtered
      .filter((r) => top5Urls.includes(r.resolvedUrl))
      .sort((a, b) => a.startTime - b.startTime)
      .map((r) => ({
        time: new Date(r.startTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: r.startTime,
        url: r.resolvedUrl,
        duration: r.durationMs,
      }));

    return { points, top5Urls };
  }, [filtered]);

  return {
    allRecords,
    filtered,
    filters,
    setFilters,
    stats,
    loading,
    reload: load,
    uniqueEnvNames,
    hasActiveFilters,
    clearFilters,
    slowestEndpoints,
    errorRateData,
    endpointTrendData,
  };
}
