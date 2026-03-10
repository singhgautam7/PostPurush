"use client";

import { SavedRequest } from "@/types/request";
import { CodeViewer } from "@/components/code/code-viewer";

interface DocBodySectionProps {
  request: SavedRequest;
}

export function DocBodySection({ request }: DocBodySectionProps) {
  const bodyType = request.body.type;

  if (bodyType === "form") {
    const rows = request.body.formData?.filter((f) => f.key.trim()) ?? [];
    if (rows.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle border-b border-border pb-1.5">
          Request Body (Form Data)
        </h4>
        <div className="space-y-4">
          {rows.map((row, i) => (
            <div key={`${row.key}-${i}`} className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold font-mono text-accent">
                  {row.key}
                </span>
                <span className="text-xs text-foreground-subtle">
                  {row.type ?? "string"}
                </span>
                {row.value && !row.sensitive && (
                  <code className="text-xs text-foreground-subtle font-mono">
                    {row.value}
                  </code>
                )}
                {row.sensitive && (
                  <span className="text-xs text-foreground-subtle italic font-mono">
                    ●●●●● (sensitive)
                  </span>
                )}
                <span
                  className={`ml-auto text-xs font-medium ${
                    row.deprecated
                      ? "text-amber-400"
                      : row.required
                        ? "text-accent"
                        : "text-foreground-subtle"
                  }`}
                >
                  {row.deprecated
                    ? "Deprecated"
                    : row.required
                      ? "Required"
                      : "Optional"}
                </span>
              </div>
              {row.description && (
                <p className="text-xs text-foreground-muted leading-relaxed">
                  {row.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bodyType === "json" || bodyType === "raw") {
    if (!request.body.content) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle border-b border-border pb-1.5">
          Request Body ({bodyType === "json" ? "JSON" : "Raw"})
        </h4>
        <CodeViewer
          code={request.body.content}
          language={bodyType === "json" ? "json" : "bash"}
          editable={false}
          showCopy={true}
          minHeight="0"
        />
      </div>
    );
  }

  return null;
}
