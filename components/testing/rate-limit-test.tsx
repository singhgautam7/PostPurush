"use client";

import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { RateLimitConfig, RateLimitResults } from "@/types/testing";

interface RateLimitTestProps {
  config: RateLimitConfig;
  onConfigChange: (config: RateLimitConfig) => void;
  results: RateLimitResults | null;
  onRun: () => void;
  onStop: () => void;
  running: boolean;
  disabled?: boolean;
  progress: { current: number; total: number };
}

export function RateLimitTest({
  config,
  onConfigChange,
  results,
  onRun,
  onStop,
  running,
  disabled,
  progress,
}: RateLimitTestProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs text-foreground-muted w-36">
            Max Requests
          </label>
          <Input
            type="number"
            min={1}
            max={300}
            value={config.maxRequests}
            onChange={(e) =>
              onConfigChange({
                ...config,
                maxRequests: Math.min(
                  300,
                  Math.max(1, parseInt(e.target.value) || 1)
                ),
              })
            }
            className="w-20 h-7 text-xs"
            disabled={disabled}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-foreground-muted w-36">
            Delay Between (ms)
          </label>
          <Input
            type="number"
            min={0}
            max={5000}
            value={config.delayMs}
            onChange={(e) =>
              onConfigChange({
                ...config,
                delayMs: Math.min(
                  5000,
                  Math.max(0, parseInt(e.target.value) || 0)
                ),
              })
            }
            className="w-20 h-7 text-xs"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!running ? (
          <Button
            onClick={onRun}
            disabled={disabled}
            className="bg-primary-action text-primary-action-fg hover:bg-primary-action/85 h-8 text-xs gap-1.5"
          >
            <Play size={12} /> Run Detection
          </Button>
        ) : (
          <Button
            onClick={onStop}
            variant="outline"
            className="h-8 text-xs gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Square size={12} /> Stop
          </Button>
        )}
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

      {results && <RateLimitResultsView results={results} />}
    </div>
  );
}

const chartConfig: ChartConfig = {
  time: { label: "Response Time", color: "var(--color-chart-1)" },
};

export function RateLimitResultsView({
  results,
}: {
  results: RateLimitResults;
}) {
  const chartData = results.responses.map((r) => ({
    index: r.index + 1,
    time: r.time,
    status: r.status,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {results.limitHitAt != null ? (
          <Badge
            variant="outline"
            className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs"
          >
            Rate limit hit at request #{results.limitHitAt}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs"
          >
            No rate limit detected
          </Badge>
        )}
        {results.estimatedRPM != null && (
          <span className="text-xs text-foreground-muted">
            ~{results.estimatedRPM} req/min
          </span>
        )}
        {results.retryAfter && (
          <span className="text-xs text-foreground-subtle">
            Retry-After: {results.retryAfter}s
          </span>
        )}
        <span className="text-xs text-foreground-subtle">
          {results.requestsSent} requests sent
        </span>
      </div>

      {chartData.length > 1 && (
        <div className="bg-panel border border-border rounded-lg p-4">
          <p className="text-xs font-medium text-foreground mb-3">
            Response Time Timeline
          </p>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="index"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                label={{
                  value: "Request #",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 10,
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => `${v}ms`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="time"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              {results.limitHitAt != null && (
                <ReferenceLine
                  x={results.limitHitAt}
                  stroke="hsl(0, 84%, 60%)"
                  strokeDasharray="4 4"
                  label={{
                    value: "429",
                    position: "top",
                    fontSize: 10,
                    fill: "hsl(0, 84%, 60%)",
                  }}
                />
              )}
            </LineChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
}
