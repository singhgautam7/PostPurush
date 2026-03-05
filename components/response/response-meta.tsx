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

  const getContentType = () => {
    if (!response.headers) return null;
    const contentTypeKey = Object.keys(response.headers).find(
      (k) => k.toLowerCase() === "content-type"
    );
    if (!contentTypeKey) return null;

    const value = response.headers[contentTypeKey];
    if (value.includes("application/json")) return "JSON";
    if (value.includes("text/html")) return "HTML";
    if (value.includes("text/plain")) return "Text";
    if (value.includes("multipart/form-data")) return "Multipart";
    if (value.includes("application/xml") || value.includes("text/xml")) return "XML";

    // Return the first part of the mime type
    return value.split(";")[0];
  };

  const contentTypeBadge = getContentType();

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2">
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
      {contentTypeBadge && (
        <Badge variant="outline" className="font-mono text-xs text-blue-400 border-blue-500/30 bg-blue-500/10">
          {contentTypeBadge}
        </Badge>
      )}
    </div>
  );
}
