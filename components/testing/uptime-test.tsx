"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UptimeConfig, UptimeResults } from "@/types/testing";

const INTERVALS = [5, 10, 30, 60];
const DURATIONS = [1, 2, 5, 10];

interface UptimeTestProps {
  config: UptimeConfig;
  onConfigChange: (config: UptimeConfig) => void;
  results: UptimeResults | null;
  onRun: () => void;
  onStop: () => void;
  running: boolean;
  disabled?: boolean;
  progress: { current: number; total: number };
}

export function UptimeTest({
  config,
  onConfigChange,
  results,
  onRun,
  onStop,
  running,
  disabled,
  progress,
}: UptimeTestProps) {
  const totalChecks = Math.floor(
    (config.durationMin * 60) / config.intervalSec
  );

  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (running) {
      setCountdown(config.intervalSec);
      countdownRef.current = setInterval(() => {
        setCountdown((c) => (c <= 1 ? config.intervalSec : c - 1));
      }, 1000);
    } else {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setCountdown(0);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [running, config.intervalSec]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-foreground-muted block mb-1.5">
            Interval
          </label>
          <div className="flex bg-panel border border-border rounded-md p-0.5">
            {INTERVALS.map((sec) => (
              <button
                key={sec}
                onClick={() =>
                  onConfigChange({ ...config, intervalSec: sec })
                }
                disabled={disabled || running}
                className={cn(
                  "px-3 py-1 text-xs rounded-sm transition-colors",
                  config.intervalSec === sec
                    ? "bg-tab-active text-foreground"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-foreground-muted block mb-1.5">
            Duration
          </label>
          <div className="flex bg-panel border border-border rounded-md p-0.5">
            {DURATIONS.map((min) => (
              <button
                key={min}
                onClick={() =>
                  onConfigChange({ ...config, durationMin: min })
                }
                disabled={disabled || running}
                className={cn(
                  "px-3 py-1 text-xs rounded-sm transition-colors",
                  config.durationMin === min
                    ? "bg-tab-active text-foreground"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                {min}min
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-foreground-subtle">
          {totalChecks} checks total
        </p>
      </div>

      <div className="flex items-center gap-2">
        {!running ? (
          <Button
            onClick={onRun}
            disabled={disabled}
            className="bg-primary-action text-primary-action-fg hover:bg-primary-action/85 h-8 text-xs gap-1.5"
          >
            <Play size={12} /> Start Monitoring
          </Button>
        ) : (
          <>
            <Button
              onClick={onStop}
              variant="outline"
              className="h-8 text-xs gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Square size={12} /> Stop
            </Button>
            <span className="text-xs text-foreground-muted">
              Next ping in {countdown}s... ({progress.current} /{" "}
              {progress.total} completed)
            </span>
          </>
        )}
      </div>

      {results && <UptimeResultsView results={results} totalChecks={totalChecks} />}
    </div>
  );
}

export function UptimeResultsView({
  results,
  totalChecks,
}: {
  results: UptimeResults;
  totalChecks?: number;
}) {
  const successCount = results.checks.filter((c) => c.success).length;
  const failedCount = results.checks.filter((c) => !c.success).length;
  const pendingCount = totalChecks
    ? Math.max(0, totalChecks - results.checks.length)
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            results.uptimePercent > 99
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : results.uptimePercent > 90
                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                : "bg-red-500/15 text-red-400 border-red-500/30"
          )}
        >
          {results.uptimePercent}% uptime
        </Badge>
        <span className="text-xs text-foreground-muted">
          {successCount} success / {failedCount} failed
        </span>
        <span className="text-xs text-foreground-subtle">
          Avg: {results.avgResponseTime}ms
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {results.checks.map((check, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  check.success ? "bg-emerald-400" : "bg-red-400"
                )}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>Status: {check.status}</p>
              <p>Time: {check.time}ms</p>
              <p>{new Date(check.timestamp).toLocaleTimeString()}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {Array.from({ length: pendingCount }).map((_, i) => (
          <div
            key={`pending-${i}`}
            className="w-3 h-3 rounded-full bg-foreground-subtle/30"
          />
        ))}
      </div>
    </div>
  );
}
