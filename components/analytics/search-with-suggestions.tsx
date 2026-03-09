"use client";

import { useState, useMemo, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnalyticsRecord, AnalyticsFilters } from "@/hooks/use-analytics";

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PATCH: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
  HEAD: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  OPTIONS: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

interface SearchWithSuggestionsProps {
  allRecords: AnalyticsRecord[];
  filters: AnalyticsFilters;
  setFilters: React.Dispatch<React.SetStateAction<AnalyticsFilters>>;
}

export function SearchWithSuggestions({
  allRecords,
  filters,
  setFilters,
}: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState(filters.search);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    return allRecords
      .filter((r) => {
        if (seen.has(r.requestId)) return false;
        seen.add(r.requestId);
        return true;
      })
      .filter((r) => {
        if (!query.trim()) return false;
        const q = query.toLowerCase();
        return (
          r.requestName.toLowerCase().includes(q) ||
          r.resolvedUrl.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [allRecords, query]);

  const applySuggestion = (r: AnalyticsRecord) => {
    setFilters((f) => ({
      ...f,
      search: r.requestName,
      method: r.method,
      requestId: r.requestId,
    }));
    setQuery(r.requestName);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <Search
        size={13}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle"
      />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setFilters((f) => ({
            ...f,
            search: e.target.value,
            method: null,
            requestId: null,
          }));
          if (e.target.value) {
            setShowSuggestions(true);
          } else {
            setShowSuggestions(false);
          }
        }}
        onFocus={() => {
          if (query) setShowSuggestions(true);
        }}
        onBlur={() => {
          timeoutRef.current = setTimeout(
            () => setShowSuggestions(false),
            150
          );
        }}
        placeholder="Search requests..."
        className="pl-8 h-8 w-64 text-xs"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 mt-1 w-80 bg-panel border border-border rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((r) => (
            <div
              key={r.requestId}
              onMouseDown={(e) => {
                e.preventDefault();
                applySuggestion(r);
              }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-raised cursor-pointer"
            >
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 font-mono text-[10px] px-1.5 py-0.5",
                  methodColors[r.method] ?? "bg-raised text-foreground-muted"
                )}
              >
                {r.method}
              </Badge>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-foreground truncate">
                  {r.requestName}
                </span>
                <span className="text-[10px] text-foreground-subtle font-mono truncate">
                  {r.resolvedUrl}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
