"use client";

import { cn } from "@/lib/utils";
import { SlowestEndpoint } from "@/hooks/use-analytics";

interface SlowestEndpointsProps {
  endpoints: SlowestEndpoint[];
}

export function SlowestEndpoints({ endpoints }: SlowestEndpointsProps) {
  return (
    <div className="px-4 md:px-6 py-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle mb-3">
        Slowest Endpoints
      </h3>
      <div className="bg-panel border border-border rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-xs min-w-[500px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2 text-foreground-subtle font-medium w-6">
                #
              </th>
              <th className="text-left px-4 py-2 text-foreground-subtle font-medium">
                Endpoint
              </th>
              <th className="text-right px-4 py-2 text-foreground-subtle font-medium">
                Avg
              </th>
              <th className="text-right px-4 py-2 text-foreground-subtle font-medium">
                P95
              </th>
              <th className="text-right px-4 py-2 text-foreground-subtle font-medium">
                Calls
              </th>
              <th className="text-right px-4 py-2 text-foreground-subtle font-medium">
                Err Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep, i) => (
              <tr
                key={ep.url}
                className="border-b border-border last:border-0 hover:bg-raised/50"
              >
                <td className="px-4 py-2 text-foreground-subtle">{i + 1}</td>
                <td
                  className="px-4 py-2 font-mono text-foreground-muted max-w-[360px] truncate"
                  title={ep.url}
                >
                  {ep.url}
                </td>
                <td
                  className={cn(
                    "px-4 py-2 text-right font-mono font-semibold",
                    ep.avgDuration > 1000
                      ? "text-red-400"
                      : ep.avgDuration > 300
                        ? "text-amber-400"
                        : "text-emerald-400"
                  )}
                >
                  {ep.avgDuration}ms
                </td>
                <td className="px-4 py-2 text-right font-mono text-foreground-muted">
                  {ep.p95}ms
                </td>
                <td className="px-4 py-2 text-right text-foreground-muted">
                  {ep.callCount}
                </td>
                <td
                  className={cn(
                    "px-4 py-2 text-right font-mono font-semibold",
                    ep.errorRate > 50
                      ? "text-red-400"
                      : ep.errorRate > 20
                        ? "text-amber-400"
                        : "text-foreground-muted"
                  )}
                >
                  {ep.errorRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {endpoints.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-foreground-muted">
            No data
          </div>
        )}
      </div>
    </div>
  );
}
