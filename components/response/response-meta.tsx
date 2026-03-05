"use client";

import { useResponseStore } from "@/store/response-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/utils/get-response-size";

export function ResponseMeta() {
  const response = useResponseStore((s) => s.response);

  if (!response) return null;

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300)
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    if (status >= 300 && status < 400)
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    if (status >= 400 && status < 500)
      return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    if (status >= 500)
      return "bg-red-500/15 text-red-400 border-red-500/30";
    return "bg-muted text-muted-foreground";
  };

  if (response.error) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <Badge
          variant="outline"
          className="bg-red-500/15 text-red-400 border-red-500/30 font-mono"
        >
          Error
        </Badge>
        {response.time > 0 && (
          <Badge variant="outline" className="font-mono text-xs text-muted-foreground border-border/50">
            {response.time} ms
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Badge
        variant="outline"
        className={cn("font-mono", getStatusColor(response.status))}
      >
        {response.status} {response.statusText}
      </Badge>
      <Badge variant="outline" className="font-mono text-xs text-muted-foreground border-border/50">
        {response.time} ms
      </Badge>
      <Badge variant="outline" className="font-mono text-xs text-muted-foreground border-border/50">
        {formatBytes(response.size)}
      </Badge>
    </div>
  );
}
