"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendPoint } from "@/hooks/use-analytics";

interface ResponseTimeChartProps {
  points: TrendPoint[];
  top5Urls: string[];
}

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function truncateUrl(url: string, max = 30): string {
  const path = url.replace(/^https?:\/\/[^/]+/, "") || url;
  return path.length > max ? path.slice(0, max) + "\u2026" : path;
}

export function ResponseTimeChart({ points, top5Urls }: ResponseTimeChartProps) {
  // Transform data: each row has `time` + one key per URL with its duration
  const { chartData, chartConfig } = useMemo(() => {
    // Group points by timestamp to create rows
    const byTime = new Map<number, Record<string, number | string>>();
    points.forEach((p) => {
      if (!byTime.has(p.timestamp)) {
        byTime.set(p.timestamp, { time: p.time, timestamp: p.timestamp });
      }
      const row = byTime.get(p.timestamp)!;
      row[p.url] = p.duration;
    });

    const data = Array.from(byTime.values()).sort(
      (a, b) => (a.timestamp as number) - (b.timestamp as number)
    );

    const config: ChartConfig = {};
    top5Urls.forEach((url, i) => {
      config[url] = {
        label: truncateUrl(url),
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });

    return { chartData: data, chartConfig: config };
  }, [points, top5Urls]);

  if (points.length === 0) {
    return (
      <Card className="bg-panel border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Response Time Trend
          </CardTitle>
          <CardDescription className="text-xs">
            Duration over time, top 5 endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-xs text-foreground-muted">
            No data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-panel border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Response Time Trend
        </CardTitle>
        <CardDescription className="text-xs">
          Duration over time, top 5 endpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(v) => `${v}ms`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {top5Urls.map((url, i) => (
              <Line
                key={url}
                dataKey={url}
                name={truncateUrl(url)}
                dot={false}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                connectNulls
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
