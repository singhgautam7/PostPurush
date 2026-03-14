"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/utils/get-response-size";
import { AnalyticsRecord } from "@/hooks/use-analytics";
import { formatTimestamp } from "@/lib/format-time";

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PATCH: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
};

function StatusBadge({ code }: { code: number }) {
  if (code === 0) {
    return (
      <Badge variant="outline" className="font-mono text-xs bg-red-500/15 text-red-400 border-red-500/30">
        ERR
      </Badge>
    );
  }
  const color =
    code >= 200 && code < 300
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : code >= 300 && code < 400
        ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
        : code >= 400 && code < 500
          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
          : "bg-red-500/15 text-red-400 border-red-500/30";
  return (
    <Badge variant="outline" className={cn("font-mono text-xs", color)}>
      {code}
    </Badge>
  );
}

interface RequestDetailModalProps {
  record: AnalyticsRecord | null;
  onClose: () => void;
}

export function RequestDetailModal({
  record,
  onClose,
}: RequestDetailModalProps) {
  if (!record) return null;

  const snapshot = record.requestSnapshot;

  return (
    <Dialog open={!!record} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-xs",
                methodColors[record.method] ?? "bg-raised text-foreground-muted"
              )}
            >
              {record.method}
            </Badge>
            {record.requestName}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs break-all">
            {record.resolvedUrl}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-3 text-xs">
            <StatusBadge code={record.statusCode} />
            <span className="text-foreground-muted font-mono">
              {record.durationMs}ms
            </span>
            <span className="text-foreground-muted font-mono">
              {formatBytes(record.responseSizeBytes)}
            </span>
            <span className="text-foreground-muted">
              {record.envName ?? "\u2014"}
            </span>
          </div>

          {!snapshot && (
            <p className="text-xs text-foreground-muted italic">
              Request details not available for entries recorded before this feature was added.
            </p>
          )}

          {snapshot?.params && snapshot.params.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-2">
                Query Params
              </h4>
              <div className="bg-code-bg rounded-lg overflow-hidden divide-y divide-border text-xs font-mono">
                {snapshot.params.map((p, i) => (
                  <div key={i} className="flex px-3 py-1.5 gap-4">
                    <span className="text-foreground-muted w-1/3 truncate">
                      {p.key}
                    </span>
                    <span className="text-foreground">{p.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {snapshot?.headers && snapshot.headers.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-2">
                Headers
              </h4>
              <div className="bg-code-bg rounded-lg overflow-hidden divide-y divide-border text-xs font-mono">
                {snapshot.headers.map((h, i) => (
                  <div key={i} className="flex px-3 py-1.5 gap-4">
                    <span className="text-foreground-muted w-1/3 truncate">
                      {h.key}
                    </span>
                    <span className="text-foreground break-all">{h.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {snapshot?.formData && snapshot.formData.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-2">
                Body{" "}
                <span className="normal-case text-foreground-subtle">
                  (form data)
                </span>
              </h4>
              <div className="bg-code-bg rounded-lg overflow-hidden divide-y divide-border text-xs font-mono">
                {snapshot.formData.map((f, i) => (
                  <div key={i} className="flex px-3 py-1.5 gap-4">
                    <span className="text-foreground-muted w-1/3 truncate">
                      {f.key}
                    </span>
                    <span className="text-foreground break-all">{f.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {snapshot?.bodyContent && snapshot.bodyType !== "form" && (
            <section>
              <h4 className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-2">
                Body{" "}
                <span className="normal-case text-foreground-subtle">
                  ({snapshot.bodyType})
                </span>
              </h4>
              <pre className="bg-code-bg rounded-lg px-3 py-2 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all max-h-48">
                {snapshot.bodyContent}
              </pre>
            </section>
          )}

          <section>
            <h4 className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-2">
              Timing
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-foreground-subtle">Start: </span>
                <span className="font-mono">
                  {formatTimestamp(record.startTime)}
                </span>
              </div>
              <div>
                <span className="text-foreground-subtle">End: </span>
                <span className="font-mono">{formatTimestamp(record.endTime)}</span>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
