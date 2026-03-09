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
  };
}
