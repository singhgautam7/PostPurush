"use client";

import { useResponseStore } from "@/store/response-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function HeadersView() {
  const response = useResponseStore((s) => s.response);

  if (!response || response.error) return null;

  const headerEntries = Object.entries(response.headers);

  if (headerEntries.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-foreground-subtle">
        No response headers
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-medium text-foreground-subtle text-xs uppercase tracking-wider">
                Key
              </th>
              <th className="text-left py-2 font-medium text-foreground-subtle text-xs uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {headerEntries.map(([key, value], i) => (
              <tr key={key} className={cn("border-b border-border/60 hover:bg-panel/50 transition-colors", i % 2 === 1 && "bg-panel/30")}>
                <td className="py-2 pr-4 font-mono text-blue-400 whitespace-nowrap text-sm">
                  {key}
                </td>
                <td className="py-2 font-mono text-foreground-muted break-all text-sm">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
}
