"use client";

import { useResponseStore } from "@/store/response-store";
import { ResponseMetadata } from "@/types/response-metadata";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/utils/get-response-size";
import { Plus } from "lucide-react";

function MetaField({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-[10px] uppercase tracking-wider text-foreground-subtle">
        {label}
      </span>
      <span className={cn("text-sm text-foreground", mono && "font-mono")}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  } as Intl.DateTimeFormatOptions);
}

function MetaPopoverButton({ meta }: { meta: ResponseMetadata }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1 px-2 h-7 rounded-full border border-primary-action/40
                     text-primary-action text-xs font-medium hover:bg-primary-action/10 transition-colors"
        >
          <Plus size={11} strokeWidth={2.5} />
          More Details
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-96 p-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <MetaField label="Method" value={meta.method} mono />
          <MetaField label="Status" value={`${meta.statusCode} ${meta.statusText}`} />
          <MetaField label="Duration" value={`${meta.durationMs} ms`} />
          <MetaField label="Size" value={formatBytes(meta.responseSizeBytes)} />
          <MetaField label="Content Type" value={meta.contentType || undefined} />
          <MetaField label="Environment" value={meta.envName ?? undefined} />
          <MetaField label="Start" value={formatTime(meta.startTime)} />
          <MetaField label="End" value={formatTime(meta.endTime)} />
          <MetaField label="Resolved URL" value={meta.resolvedUrl} mono className="col-span-2 break-all" />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ResponseMeta() {
  const response = useResponseStore((s) => s.response);
  const currentMeta = useResponseStore((s) => s.currentMeta);

  if (!response) return null;

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300)
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    if (status >= 300 && status < 400)
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
    if (status >= 400 && status < 500)
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    if (status >= 500)
      return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
    return "bg-raised text-foreground-muted border-border";
  };

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
    return value.split(";")[0];
  };

  const isError = !!response.error;
  const contentTypeBadge = isError ? null : getContentType();

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      {isError ? (
        <>
          <Badge variant="outline" className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 font-mono">
            Error
          </Badge>
          {response.time > 0 && (
            <Badge variant="outline" className="font-mono text-xs bg-panel text-foreground-muted border-border">
              {response.time} ms
            </Badge>
          )}
        </>
      ) : (
        <>
          <Badge variant="outline" className={cn("font-mono", getStatusColor(response.status))}>
            {response.status} {response.statusText}
          </Badge>
          <Badge variant="outline" className="font-mono text-xs bg-panel text-foreground-muted border-border">
            {response.time} ms
          </Badge>
          <Badge variant="outline" className="font-mono text-xs bg-panel text-foreground-muted border-border">
            {formatBytes(response.size)}
          </Badge>
          {contentTypeBadge && (
            <Badge variant="outline" className="font-mono text-xs bg-panel text-foreground-muted border-border">
              {contentTypeBadge}
            </Badge>
          )}
        </>
      )}
      {/* {currentMeta && <MetaPopoverButton meta={currentMeta} />} */}
    </div>
  );
}
