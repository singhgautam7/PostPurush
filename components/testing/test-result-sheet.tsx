"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TestRun,
  TestType,
  AssertionResults,
  LoadResults,
  RateLimitResults,
  UptimeResults,
} from "@/types/testing";
import { AssertionResultsView } from "./assertion-test";
import { LoadResultsView } from "./load-test";
import { RateLimitResultsView } from "./rate-limit-test";
import { UptimeResultsView } from "./uptime-test";

const testTypeLabels: Record<TestType, string> = {
  assertion: "Assertion Test",
  load: "Load Test",
  "rate-limit": "Rate Limit Test",
  uptime: "Uptime Monitor",
};

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PATCH: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
};

interface TestResultSheetProps {
  run: TestRun | null;
  onClose: () => void;
}

export function TestResultSheet({ run, onClose }: TestResultSheetProps) {
  return (
    <Sheet open={!!run} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        {run && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-sm">
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[10px] px-1.5 py-0.5",
                    methodColors[run.requestMethod] ??
                      "bg-raised text-foreground-muted"
                  )}
                >
                  {run.requestMethod}
                </Badge>
                {run.requestName}
              </SheetTitle>
              <SheetDescription className="text-xs space-y-1">
                <span className="block font-mono truncate">
                  {run.requestUrl}
                </span>
                <span className="block">
                  {new Date(run.startTime).toLocaleString()} —{" "}
                  {Math.round((run.endTime - run.startTime) / 1000)}s
                </span>
              </SheetDescription>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className="text-[10px] bg-raised border-border text-foreground-muted"
                >
                  {testTypeLabels[run.testType]} Details
                </Badge>
              </div>
            </SheetHeader>

            <div className="mt-6 px-6">
              {run.testType === "assertion" && (
                <AssertionResultsView
                  results={run.results as AssertionResults}
                />
              )}
              {run.testType === "load" && (
                <LoadResultsView results={run.results as LoadResults} />
              )}
              {run.testType === "rate-limit" && (
                <RateLimitResultsView
                  results={run.results as RateLimitResults}
                />
              )}
              {run.testType === "uptime" && (
                <UptimeResultsView results={run.results as UptimeResults} />
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
