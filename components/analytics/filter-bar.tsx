"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsFilters } from "@/hooks/use-analytics";

interface FilterBarProps {
  filters: AnalyticsFilters;
  setFilters: React.Dispatch<React.SetStateAction<AnalyticsFilters>>;
  uniqueEnvNames: string[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export function FilterBar({
  filters,
  setFilters,
  uniqueEnvNames,
  hasActiveFilters,
  clearFilters,
  filteredCount,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap px-6 py-3 border-b border-border">
      <div className="relative">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle"
        />
        <Input
          placeholder="Search requests..."
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
          className="pl-8 h-8 w-52 text-xs"
        />
      </div>

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
    </div>
  );
}
