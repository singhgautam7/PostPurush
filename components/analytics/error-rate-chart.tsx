"use client";

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
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorRateEntry } from "@/hooks/use-analytics";

interface ErrorRateChartProps {
  data: ErrorRateEntry[];
}

const chartConfig = {
  errorRate: {
    label: "Error Rate",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

function barColor(rate: number): string {
  if (rate > 50) return "#ef4444";
  if (rate > 20) return "#f59e0b";
  return "#10b981";
}

export function ErrorRateChart({ data }: ErrorRateChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-panel border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Error Rate by Endpoint
          </CardTitle>
          <CardDescription className="text-xs">
            Percentage of failed requests per endpoint
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
          Error Rate by Endpoint
        </CardTitle>
        <CardDescription className="text-xs">
          Percentage of failed requests per endpoint
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={data} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              type="category"
              dataKey="url"
              width={120}
              tick={{ fontSize: 9 }}
              tickFormatter={(url) =>
                url.length > 20 ? url.slice(0, 20) + "\u2026" : url
              }
            />
            <ChartTooltip
              content={({ active, payload }) =>
                active && payload?.[0] ? (
                  <div className="bg-panel border border-border rounded-lg px-3 py-2 text-xs">
                    <p className="font-mono text-foreground-muted mb-1">
                      {payload[0].payload.fullUrl}
                    </p>
                    <p>
                      Error rate:{" "}
                      <span className="font-semibold text-red-400">
                        {payload[0].value}%
                      </span>
                    </p>
                    <p>Total calls: {payload[0].payload.total}</p>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="errorRate" radius={[0, 3, 3, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={barColor(entry.errorRate)}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
