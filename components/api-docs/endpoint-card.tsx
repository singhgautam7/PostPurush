"use client";

import { SavedRequest } from "@/types/request";
import { cn } from "@/lib/utils";
import { DocParamSection } from "./doc-param-table";
import { DocBodySection } from "./doc-body-section";
import { CodeSnippetPanel } from "./code-snippet-panel";

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400",
  POST: "bg-blue-500/15 text-blue-400",
  PUT: "bg-amber-500/15 text-amber-400",
  PATCH: "bg-violet-500/15 text-violet-400",
  DELETE: "bg-red-500/15 text-red-400",
};

interface EndpointCardProps {
  request: SavedRequest;
}

export function EndpointCard({ request }: EndpointCardProps) {
  const visibleParams = request.params.filter((p) => p.key.trim());
  const visibleHeaders = request.headers.filter((h) => h.key.trim());
  const visibleFormData =
    request.body?.formData?.filter((f) => f.key.trim()) ?? [];

  const hasBody = request.method !== "GET";
  const bodyType = request.body.type;
  const hasBodyContent =
    hasBody &&
    ((bodyType === "form" && visibleFormData.length > 0) ||
      ((bodyType === "json" || bodyType === "raw") && request.body.content));

  return (
    <div className="grid grid-cols-2 border-b border-border min-h-[120px]">
      {/* LEFT COLUMN — documentation */}
      <div className="px-8 py-6 border-r border-border space-y-5">
        {/* Endpoint title */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span
              className={cn(
                "text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0",
                methodColors[request.method] ?? "text-foreground-muted"
              )}
            >
              {request.method}
            </span>
            <h3 className="text-base font-semibold text-foreground">
              {request.name || "Untitled"}
            </h3>
          </div>
          <code className="text-xs font-mono text-foreground-muted block">
            {request.url || (
              <span className="italic text-foreground-subtle">No URL set</span>
            )}
          </code>
          {request.description && (
            <p className="text-sm text-foreground-muted mt-2 leading-relaxed">
              {request.description}
            </p>
          )}
        </div>

        {/* Query Parameters */}
        {visibleParams.length > 0 && (
          <DocParamSection title="Query Parameters" rows={visibleParams} />
        )}

        {/* Headers */}
        {visibleHeaders.length > 0 && (
          <DocParamSection title="Header Parameters" rows={visibleHeaders} />
        )}

        {/* Body */}
        {hasBodyContent && <DocBodySection request={request} />}

        {/* Empty state */}
        {visibleParams.length === 0 &&
          visibleHeaders.length === 0 &&
          !hasBodyContent && (
            <p className="text-xs text-foreground-subtle italic">
              No parameters, headers, or body configured for this endpoint.
            </p>
          )}
      </div>

      {/* RIGHT COLUMN — code snippets */}
      <div className="bg-code-bg">
        <CodeSnippetPanel request={request} />
      </div>
    </div>
  );
}
