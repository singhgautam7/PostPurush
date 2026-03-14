"use client";

import { useState, useMemo } from "react";
import {
  Eye,
  Trash2,
  Clock,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { TestRun, TestType, TestStatus } from "@/types/testing";
import { TestResultSheet } from "./test-result-sheet";
import { TestHistorySearch } from "./test-history-search";

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PATCH: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
};

const testTypeLabels: Record<TestType, string> = {
  assertion: "Assertion",
  load: "Load",
  "rate-limit": "Rate Limit",
  uptime: "Uptime",
};

interface TestHistoryFilters {
  search: string;
  testType: TestType | null;
  status: TestStatus | null;
  requestId: string | null;
}

const defaultFilters: TestHistoryFilters = {
  search: "",
  testType: null,
  status: null,
  requestId: null,
};

type SortKey = "startTime" | "duration" | "status";

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
    return (
      <ChevronDown size={12} className="opacity-0 group-hover:opacity-30" />
    );
  return sortDir === "desc" ? (
    <ChevronDown size={12} />
  ) : (
    <ChevronUp size={12} />
  );
}

interface TestHistoryProps {
  history: TestRun[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function TestHistory({
  history,
  onDelete,
  onClearAll,
}: TestHistoryProps) {
  const [clearOpen, setClearOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewRun, setViewRun] = useState<TestRun | null>(null);
  const [filters, setFilters] = useState<TestHistoryFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortKey>("startTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const hasActiveFilters =
    filters.search !== "" ||
    filters.testType !== null ||
    filters.status !== null ||
    filters.requestId !== null;

  const clearFilters = () => setFilters(defaultFilters);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    return history.filter((run) => {
      if (filters.testType && run.testType !== filters.testType) return false;
      if (filters.status && run.status !== filters.status) return false;
      if (filters.requestId && run.requestId !== filters.requestId)
        return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !run.requestName.toLowerCase().includes(q) &&
          !run.requestUrl.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [history, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "startTime") {
        cmp = a.startTime - b.startTime;
      } else if (sortBy === "duration") {
        cmp = a.endTime - a.startTime - (b.endTime - b.startTime);
      } else if (sortBy === "status") {
        cmp = a.status.localeCompare(b.status);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [filtered, sortBy, sortDir]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Clock size={32} className="text-foreground-subtle/50" />
        <p className="text-sm text-foreground-subtle">No test runs yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Filter bar */}
        <div className="sticky top-0 z-10 bg-background border-b border-border flex items-center gap-2 flex-wrap px-0 py-3">
          <TestHistorySearch
            history={history}
            search={filters.search}
            onSelect={(name, id) =>
              setFilters((f) => ({ ...f, search: name, requestId: id }))
            }
            onChange={(value) =>
              setFilters((f) => ({
                ...f,
                search: value,
                requestId: null,
              }))
            }
          />

          <Select
            value={filters.testType ?? "all"}
            onValueChange={(v) =>
              setFilters((f) => ({
                ...f,
                testType: v === "all" ? null : (v as TestType),
              }))
            }
          >
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="Test Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="assertion">Assertion</SelectItem>
              <SelectItem value="load">Load</SelectItem>
              <SelectItem value="rate-limit">Rate Limit</SelectItem>
              <SelectItem value="uptime">Uptime</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status ?? "all"}
            onValueChange={(v) =>
              setFilters((f) => ({
                ...f,
                status: v === "all" ? null : (v as TestStatus),
              }))
            }
          >
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pass">Pass</SelectItem>
              <SelectItem value="fail">Fail</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-foreground-muted"
              onClick={clearFilters}
            >
              <X size={12} className="mr-1" /> Clear
            </Button>
          )}

          {hasActiveFilters && (
            <span className="text-xs text-foreground-subtle">
              {filtered.length} of {history.length} entries
            </span>
          )}

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 text-foreground-muted hover:text-red-400"
            onClick={() => setClearOpen(true)}
          >
            <Trash2 size={12} /> Clear All History
          </Button>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead
                  className="text-xs h-8 cursor-pointer group"
                  onClick={() => toggleSort("startTime")}
                >
                  <span className="flex items-center gap-1">
                    Date/Time
                    <SortIcon
                      column="startTime"
                      sortBy={sortBy}
                      sortDir={sortDir}
                    />
                  </span>
                </TableHead>
                <TableHead className="text-xs h-8">Request</TableHead>
                <TableHead className="text-xs h-8">Test Type</TableHead>
                <TableHead
                  className="text-xs h-8 cursor-pointer group"
                  onClick={() => toggleSort("status")}
                >
                  <span className="flex items-center gap-1">
                    Status
                    <SortIcon
                      column="status"
                      sortBy={sortBy}
                      sortDir={sortDir}
                    />
                  </span>
                </TableHead>
                <TableHead
                  className="text-xs h-8 cursor-pointer group"
                  onClick={() => toggleSort("duration")}
                >
                  <span className="flex items-center gap-1">
                    Duration
                    <SortIcon
                      column="duration"
                      sortBy={sortBy}
                      sortDir={sortDir}
                    />
                  </span>
                </TableHead>
                <TableHead className="text-xs h-8 w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((run) => (
                <TableRow key={run.id} className="border-border">
                  <TableCell className="text-xs text-foreground-muted py-2">
                    {new Date(run.startTime).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-[9px] px-1 py-0",
                          methodColors[run.requestMethod] ??
                            "bg-raised text-foreground-muted"
                        )}
                      >
                        {run.requestMethod}
                      </Badge>
                      <span className="text-xs text-foreground truncate max-w-[150px]">
                        {run.requestName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-raised border-border text-foreground-muted"
                    >
                      {testTypeLabels[run.testType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        run.status === "pass"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : run.status === "fail"
                            ? "bg-red-500/15 text-red-400 border-red-500/30"
                            : run.status === "error"
                              ? "bg-red-500/15 text-red-400 border-red-500/30"
                              : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                      )}
                    >
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-foreground-muted py-2">
                    {Math.round((run.endTime - run.startTime) / 1000)}s
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-foreground-subtle hover:text-foreground"
                        onClick={() => setViewRun(run)}
                      >
                        <Eye size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-foreground-subtle hover:text-red-400"
                        onClick={() => setDeleteId(run.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all test history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all test run history from this device.
              Your saved collections and environments will not be affected. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClearAll();
                setClearOpen(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete All History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete test run?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this test run from your history. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TestResultSheet run={viewRun} onClose={() => setViewRun(null)} />
    </>
  );
}
