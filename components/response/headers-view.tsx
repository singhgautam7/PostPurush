"use client";

import { useResponseStore } from "@/store/response-store";
import { ScrollArea } from "@/components/ui/scroll-area";

export function HeadersView() {
  const response = useResponseStore((s) => s.response);

  if (!response || response.error) return null;

  const headerEntries = Object.entries(response.headers);

  if (headerEntries.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        No response headers
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-2 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Key
              </th>
              <th className="text-left py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {headerEntries.map(([key, value]) => (
              <tr key={key} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                <td className="py-2 pr-4 font-mono text-indigo-400 whitespace-nowrap">
                  {key}
                </td>
                <td className="py-2 font-mono text-foreground/80 break-all">
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
