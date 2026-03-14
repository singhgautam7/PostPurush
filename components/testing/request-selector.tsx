"use client";

import { useState, useMemo, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SavedRequest } from "@/types/request";

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PATCH: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
};

interface RequestSelectorProps {
  requests: SavedRequest[];
  selected: SavedRequest | null;
  onSelect: (request: SavedRequest | null) => void;
}

export function RequestSelector({
  requests,
  selected,
  onSelect,
}: RequestSelectorProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) return requests.slice(0, 8);
    const q = query.toLowerCase();
    return requests
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [requests, query]);

  if (selected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-panel border border-border rounded-lg">
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 font-mono text-[10px] px-1.5 py-0.5",
            methodColors[selected.method] ?? "bg-raised text-foreground-muted"
          )}
        >
          {selected.method}
        </Badge>
        <span className="text-sm font-medium text-foreground truncate">
          {selected.name}
        </span>
        <span className="text-xs text-foreground-subtle font-mono truncate hidden sm:inline">
          {selected.url}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-6 w-6 p-0 text-foreground-subtle hover:text-foreground"
          onClick={() => onSelect(null)}
        >
          <X size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle"
      />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          timeoutRef.current = setTimeout(
            () => setShowSuggestions(false),
            150
          );
        }}
        placeholder="Search and select a saved request..."
        className="pl-9 h-10 text-sm"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 mt-1 w-full bg-panel border border-border rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((r) => (
            <div
              key={r.id}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(r);
                setQuery("");
                setShowSuggestions(false);
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
                  {r.name}
                </span>
                <span className="text-[10px] text-foreground-subtle font-mono truncate">
                  {r.url || "No URL"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showSuggestions && suggestions.length === 0 && query.trim() && (
        <div className="absolute z-50 top-full left-0 mt-1 w-full bg-panel border border-border rounded-lg shadow-xl p-4">
          <p className="text-xs text-foreground-subtle text-center">
            No matching requests found
          </p>
        </div>
      )}
    </div>
  );
}
