"use client";

import {
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Database,
  Link,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/utils/get-response-size";
import { AnalyticsFilters } from "@/hooks/use-analytics";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ label, value, sub, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-panel border border-border rounded-lg px-4 py-3 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground-subtle uppercase tracking-wider">
          {label}
        </span>
        <Icon size={14} className={color} />
      </div>
      <span className="text-2xl font-semibold text-foreground font-mono">
        {value}
      </span>
      {sub && (
        <span className="text-xs text-foreground-muted">{sub}</span>
      )}
    </div>
  );
}

interface StatCardsProps {
  stats: {
    total: number;
    avgDuration: number;
    p95Duration: number;
    successRate: number;
    errorCount: number;
    avgSize: number;
    uniqueEndpoints: number;
    methodCounts: Record<string, number>;
    statusCounts: Record<string, number>;
  };
  filters: AnalyticsFilters;
  setFilters: React.Dispatch<React.SetStateAction<AnalyticsFilters>>;
}

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400",
  POST: "bg-blue-500/15 text-blue-400",
  PUT: "bg-amber-500/15 text-amber-400",
  PATCH: "bg-violet-500/15 text-violet-400",
  DELETE: "bg-red-500/15 text-red-400",
  HEAD: "bg-cyan-500/15 text-cyan-400",
  OPTIONS: "bg-pink-500/15 text-pink-400",
};

export function StatCards({ stats, filters, setFilters }: StatCardsProps) {
  return (
    <div className="px-6 py-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Requests"
          value={stats.total}
          icon={Activity}
          color="text-primary-action"
        />
        <StatCard
          label="Avg Duration"
          value={`${stats.avgDuration}ms`}
          icon={Clock}
          color="text-blue-400"
          sub={`P95: ${stats.p95Duration}ms`}
        />
        <StatCard
          label="Success Rate"
          value={`${stats.successRate}%`}
          icon={CheckCircle}
          color="text-emerald-400"
          sub={`${stats.statusCounts["2xx"]} successful`}
        />
        <StatCard
          label="Errors"
          value={stats.errorCount}
          icon={AlertCircle}
          color="text-red-400"
          sub="4xx + 5xx + network"
        />
        <StatCard
          label="Avg Response Size"
          value={formatBytes(stats.avgSize)}
          icon={Database}
          color="text-purple-400"
        />
        <StatCard
          label="Unique Endpoints"
          value={stats.uniqueEndpoints}
          icon={Link}
          color="text-orange-400"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-foreground-subtle">Breakdown:</span>
        {Object.entries(stats.methodCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([method, count]) => (
            <button
              key={method}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  method: f.method === method ? null : method,
                }))
              }
              className={cn(
                "px-2 py-0.5 rounded text-xs font-mono font-semibold transition-colors cursor-pointer",
                filters.method === method
                  ? methodColors[method] ?? "bg-raised text-foreground"
                  : "bg-raised text-foreground-muted hover:text-foreground"
              )}
            >
              {method}: {count}
            </button>
          ))}
        {Object.entries(stats.statusCounts)
          .filter(([, v]) => v > 0)
          .map(([cat, count]) => (
            <span
              key={cat}
              className={cn(
                "px-2 py-0.5 rounded text-xs font-mono",
                cat === "2xx"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : cat === "3xx"
                    ? "bg-blue-500/15 text-blue-400"
                    : cat === "4xx"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-red-500/15 text-red-400"
              )}
            >
              {cat}: {count}
            </span>
          ))}
      </div>
    </div>
  );
}
