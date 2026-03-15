"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsFilters, AnalyticsRecord } from "@/hooks/use-analytics";
import { SearchWithSuggestions } from "./search-with-suggestions";
import { ExportCSVButton } from "./export-csv-button";
import { ClearHistoryButton } from "./clear-history-button";

interface FilterBarProps {
  filters: AnalyticsFilters;
  setFilters: React.Dispatch<React.SetStateAction<AnalyticsFilters>>;
  uniqueEnvNames: string[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
  filteredCount: number;
  totalCount: number;
  allRecords: AnalyticsRecord[];
  filtered: AnalyticsRecord[];
  onCleared: () => void;
}

export function FilterBar({
  filters,
  setFilters,
  uniqueEnvNames,
  hasActiveFilters,
  clearFilters,
  filteredCount,
  totalCount,
  allRecords,
  filtered,
  onCleared,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border flex items-center gap-2 flex-wrap px-4 md:px-6 py-3">
      <SearchWithSuggestions
        allRecords={allRecords}
        filters={filters}
        setFilters={setFilters}
      />

      <Select
        value={filters.method ?? "all"}
        onValueChange={(v) =>
          setFilters((f) => ({ ...f, method: v === "all" ? null : v }))
        }
      >
        <SelectTrigger className="h-8 w-28 text-xs">
          <SelectValue placeholder="Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Methods</SelectItem>
          {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map(
            (m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>

      <Select
        value={filters.statusCategory ?? "all"}
        onValueChange={(v) =>
          setFilters((f) => ({
            ...f,
            statusCategory: v === "all" ? null : v,
          }))
        }
      >
        <SelectTrigger className="h-8 w-28 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="2xx">2xx Success</SelectItem>
          <SelectItem value="3xx">3xx Redirect</SelectItem>
          <SelectItem value="4xx">4xx Client Error</SelectItem>
          <SelectItem value="5xx">5xx Server Error</SelectItem>
          <SelectItem value="err">ERR (Network Error)</SelectItem>
        </SelectContent>
      </Select>

      {uniqueEnvNames.length > 0 && (
        <Select
          value={filters.envName ?? "all"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, envName: v === "all" ? null : v }))
          }
        >
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Envs</SelectItem>
            {uniqueEnvNames.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-foreground-muted"
          onClick={clearFilters}
        >
          <X size={12} className="mr-1" /> Clear
        </Button>
      )}

      {hasActiveFilters && (
        <span className="text-xs text-foreground-subtle">
          {filteredCount} of {totalCount} entries
        </span>
      )}

      <div className="flex-1" />

      <ExportCSVButton filtered={filtered} />
      <ClearHistoryButton onCleared={onCleared} />
    </div>
  );
}
