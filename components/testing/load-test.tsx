"use client";

import { useState } from "react";
import { Play, Minus, Plus, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { LoadConfig, LoadResults } from "@/types/testing";
import { SavedRequest } from "@/types/request";
import { generateCode } from "@/lib/codegen/generate-code";

interface LoadTestProps {
  config: LoadConfig;
  onConfigChange: (config: LoadConfig) => void;
  results: LoadResults | null;
  onRun: () => void;
  running: boolean;
  disabled?: boolean;
  progress: { current: number; total: number };
  request: SavedRequest | null;
}

export function LoadTest({
  config,
  onConfigChange,
  results,
  onRun,
  running,
  disabled,
  progress,
  request,
}: LoadTestProps) {
  const showConcurrentWarning =
    config.mode === "concurrent" && config.requestCount > 10;

  const downloadScript = () => {
    if (!request) return;
    const curl = generateCode(request, "curl");
    const script = `#!/bin/bash
# Load test: ${config.requestCount} concurrent requests
echo "Starting load test with ${config.requestCount} requests..."
START=$(date +%s%N)

for i in $(seq 1 ${config.requestCount}); do
  (
    RSTART=$(date +%s%N)
    ${curl} -s -o /dev/null -w "%{http_code} %{time_total}" 2>/dev/null
    REND=$(date +%s%N)
    echo "Request $i completed"
  ) &
done

wait
END=$(date +%s%N)
ELAPSED=$(( (END - START) / 1000000 ))
echo "All ${config.requestCount} requests completed in \${ELAPSED}ms"
`;
    const blob = new Blob([script], { type: "text/x-shellscript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "load-test.sh";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs text-foreground-muted w-28">
            Request Count
          </label>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() =>
                onConfigChange({
                  ...config,
                  requestCount: Math.max(1, config.requestCount - 1),
                })
              }
              disabled={disabled || config.requestCount <= 1}
            >
              <Minus size={12} />
            </Button>
            <Input
              type="number"
              min={1}
              max={100}
              value={config.requestCount}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  requestCount: Math.min(
                    100,
                    Math.max(1, parseInt(e.target.value) || 1)
                  ),
                })
              }
              className="w-16 h-7 text-xs text-center"
              disabled={disabled}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() =>
                onConfigChange({
                  ...config,
                  requestCount: Math.min(100, config.requestCount + 1),
                })
              }
              disabled={disabled || config.requestCount >= 100}
            >
              <Plus size={12} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-foreground-muted w-28">Mode</label>
          <div className="flex bg-panel border border-border rounded-md p-0.5">
            {(["sequential", "concurrent"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onConfigChange({ ...config, mode })}
                disabled={disabled}
                className={cn(
                  "px-3 py-1 text-xs rounded-sm transition-colors capitalize",
                  config.mode === mode
                    ? "bg-tab-active text-foreground"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {showConcurrentWarning && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertTriangle
              size={14}
              className="text-amber-400 mt-0.5 shrink-0"
            />
            <div className="text-xs text-amber-300 space-y-1">
              <p>
                Browsers limit concurrent connections per domain. For accurate
                results, use the shell script.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] gap-1 text-amber-400 hover:text-amber-300 p-0"
                onClick={downloadScript}
              >
                <Download size={10} /> Download .sh Script
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onRun}
          disabled={disabled || running}
          className="bg-primary-action text-primary-action-fg hover:bg-primary-action/85 h-8 text-xs gap-1.5"
        >
          <Play size={12} /> {running ? "Running..." : "Run Load Test"}
        </Button>
        {running && progress.total > 0 && (
          <span className="text-xs text-foreground-muted">
            {progress.current} / {progress.total}
          </span>
        )}
      </div>

      {running && progress.total > 0 && (
        <div className="h-1.5 bg-raised rounded-full overflow-hidden">
          <div
            className="h-1.5 bg-primary-action rounded-full transition-all"
            style={{
              width: `${(progress.current / progress.total) * 100}%`,
            }}
          />
        </div>
      )}

      {results && <LoadResultsView results={results} />}
    </div>
  );
}

const chartConfig: ChartConfig = {
  time: { label: "Response Time", color: "var(--color-chart-1)" },
};

export function LoadResultsView({ results }: { results: LoadResults }) {
  const chartData = results.responses.map((r) => ({
    index: `#${r.index + 1}`,
    time: r.time,
    status: r.status,
  }));

  const getBarColor = (status: number) => {
    if (status >= 200 && status < 300) return "var(--color-chart-2)";
    if (status >= 300 && status < 500) return "hsl(45, 93%, 47%)";
    return "hsl(0, 84%, 60%)";
  };

  const stats = [
    { label: "Total", value: results.total },
    { label: "Success", value: results.success, color: "text-emerald-400" },
    { label: "Failed", value: results.failed, color: "text-red-400" },
    { label: "Avg Time", value: `${results.avgTime}ms` },
    { label: "P95", value: `${results.p95}ms` },
    { label: "Req/sec", value: results.reqPerSec },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-panel border border-border rounded-lg p-2.5 text-center"
          >
            <p className="text-[10px] text-foreground-subtle">{s.label}</p>
            <p
              className={cn(
                "text-sm font-semibold mt-0.5",
                s.color ?? "text-foreground"
              )}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-panel border border-border rounded-lg p-4">
          <p className="text-xs font-medium text-foreground mb-3">
            Response Times
          </p>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="index"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => `${v}ms`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="time" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
}
