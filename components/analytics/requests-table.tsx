"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/utils/get-response-size";
import { AnalyticsRecord, AnalyticsFilters } from "@/hooks/use-analytics";
import { useRouter } from "next/navigation";
import { RequestDetailModal } from "./request-detail-modal";
import { formatTimestamp } from "@/lib/format-time";

type SortKey = "startTime" | "durationMs" | "statusCode";

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PATCH: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
  HEAD: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  OPTIONS: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

function statusColor(code: number): string {
  if (code >= 200 && code < 300)
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (code >= 300 && code < 400)
    return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (code >= 400 && code < 500)
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-red-500/15 text-red-400 border-red-500/30";
}

function durationColor(ms: number): string {
  if (ms < 200) return "text-emerald-400";
  if (ms < 1000) return "text-amber-400";
  return "text-red-400";
}

function SortIcon({
  column,
  sortBy,
  sortDir,
}: {
  column: SortKey;
  sortBy: SortKey;
  sortDir: "asc" | "desc";
}) {
  if (sortBy !== column)
    return <ChevronDown size={12} className="opacity-0 group-hover:opacity-30" />;
  return sortDir === "desc" ? (
    <ChevronDown size={12} />
  ) : (
    <ChevronUp size={12} />
  );
}

interface RequestsTableProps {
  filtered: AnalyticsRecord[];
  filters: AnalyticsFilters;
}

export function RequestsTable({ filtered, filters }: RequestsTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>("startTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedRecord, setSelectedRecord] = useState<AnalyticsRecord | null>(
    null
  );
  const router = useRouter();

  const repeatRequest = (record: AnalyticsRecord) => {
    router.push("/");
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("postpurush:open-request", {
          detail: { requestId: record.requestId },
        })
      );
    }, 50);
  };

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        sortDir === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]
      ),
    [filtered, sortBy, sortDir]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Reset to page 1 when filters or sort changes
  useEffect(() => setPage(1), [filters, sortBy, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="flex flex-col px-4 md:px-6 py-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle mb-3">
        Request History
      </h3>
      <div className="bg-panel border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20 text-xs">Method</TableHead>
              <TableHead className="text-xs">Request</TableHead>
              <TableHead className="text-xs max-w-[240px] hidden md:table-cell">URL</TableHead>
              <TableHead
                className="w-20 text-xs cursor-pointer group"
                onClick={() => toggleSort("statusCode")}
              >
                <span className="flex items-center gap-1">
                  Status
                  <SortIcon
                    column="statusCode"
                    sortBy={sortBy}
                    sortDir={sortDir}
                  />
                </span>
              </TableHead>
              <TableHead
                className="w-24 text-xs cursor-pointer group"
                onClick={() => toggleSort("durationMs")}
              >
                <span className="flex items-center gap-1">
                  Duration
                  <SortIcon
                    column="durationMs"
                    sortBy={sortBy}
                    sortDir={sortDir}
                  />
                </span>
              </TableHead>
              <TableHead className="w-20 text-xs hidden md:table-cell">Size</TableHead>
              <TableHead className="w-24 text-xs hidden md:table-cell">Env</TableHead>
              <TableHead
                className="w-36 text-xs cursor-pointer group"
                onClick={() => toggleSort("startTime")}
              >
                <span className="flex items-center gap-1">
                  Time
                  <SortIcon
                    column="startTime"
                    sortBy={sortBy}
                    sortDir={sortDir}
                  />
                </span>
              </TableHead>
              <TableHead className="w-24 text-xs" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((r) => (
              <TableRow key={r.id} className="group/row">
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[10px]",
                      methodColors[r.method] ??
                        "bg-raised text-foreground-muted"
                    )}
                  >
                    {r.method}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground truncate max-w-[200px]">
                  {r.requestName}
                </TableCell>
                <TableCell className="max-w-[240px] hidden md:table-cell">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs font-mono text-foreground-muted truncate block">
                        {r.resolvedUrl}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-sm break-all font-mono text-xs"
                    >
                      {r.resolvedUrl}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[10px]",
                      statusColor(r.statusCode)
                    )}
                  >
                    {r.statusCode || "ERR"}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-xs font-mono",
                    durationColor(r.durationMs)
                  )}
                >
                  {r.durationMs}ms
                </TableCell>
                <TableCell className="text-xs font-mono text-foreground-muted hidden md:table-cell">
                  {formatBytes(r.responseSizeBytes)}
                </TableCell>
                <TableCell className="text-xs text-foreground-muted hidden md:table-cell">
                  {r.envName ?? "\u2014"}
                </TableCell>
                <TableCell className="text-xs text-foreground-muted">
                  {formatTimestamp(r.startTime)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setSelectedRecord(r)}
                        >
                          <Eye size={13} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">View this request</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => repeatRequest(r)}
                        >
                          <RotateCcw size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Repeat this request</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-muted">Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-foreground-muted">
            {sorted.length === 0
              ? "0 entries"
              : `${(page - 1) * pageSize + 1}\u2013${Math.min(page * pageSize, sorted.length)} of ${sorted.length}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            <ChevronsLeft size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={13} />
          </Button>
          <span className="text-xs px-2">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
          >
            <ChevronsRight size={13} />
          </Button>
        </div>
      </div>
      </div>

      <RequestDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
