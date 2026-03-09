"use client";

import { BarChart2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/use-analytics";
import { FilterBar } from "./filter-bar";
import { StatCards } from "./stat-cards";
import { RequestsTable } from "./requests-table";

export function AnalyticsView() {
  const {
    allRecords,
    filtered,
    filters,
    setFilters,
    stats,
    loading,
    reload,
    uniqueEnvNames,
    hasActiveFilters,
    clearFilters,
  } = useAnalytics();

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <h1 className="text-lg font-semibold text-foreground">Analytics</h1>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={reload}
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 size={20} className="animate-spin text-foreground-subtle" />
          <p className="text-sm text-foreground-muted">
            Loading analytics...
          </p>
        </div>
      )}

      {/* Empty — no data */}
      {!loading && allRecords.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 gap-2">
          <BarChart2 size={32} className="text-foreground-subtle" />
          <p className="text-sm font-medium text-foreground">
            No request history yet
          </p>
          <p className="text-xs text-foreground-muted">
            Send some requests from the Collections tab to see analytics here.
          </p>
        </div>
      )}

      {/* Main content */}
      {!loading && allRecords.length > 0 && (
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            uniqueEnvNames={uniqueEnvNames}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            filteredCount={filtered.length}
            totalCount={allRecords.length}
          />

          <StatCards
            stats={stats}
            filters={filters}
            setFilters={setFilters}
          />

          {/* Empty — filters match nothing */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className="text-sm text-foreground-muted">
                No results match your filters.
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}

          {filtered.length > 0 && (
            <RequestsTable filtered={filtered} filters={filters} />
          )}
        </div>
      )}
    </div>
  );
}
