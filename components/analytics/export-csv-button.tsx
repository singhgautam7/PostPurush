"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsRecord } from "@/hooks/use-analytics";

interface ExportCSVButtonProps {
  filtered: AnalyticsRecord[];
}

export function ExportCSVButton({ filtered }: ExportCSVButtonProps) {
  const handleExport = () => {
    const headers = [
      "Time",
      "Method",
      "Request",
      "URL",
      "Status",
      "Duration (ms)",
      "Size (bytes)",
      "Environment",
    ];
    const rows = filtered.map((r) => [
      new Date(r.startTime).toLocaleString(),
      r.method,
      r.requestName,
      r.resolvedUrl,
      r.statusCode === 0 ? "ERR" : r.statusCode,
      r.durationMs,
      r.responseSizeBytes,
      r.envName ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `postpurush-analytics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 text-xs gap-1.5"
      onClick={handleExport}
    >
      <Download size={12} /> Export CSV
    </Button>
  );
}
