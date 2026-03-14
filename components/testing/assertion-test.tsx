"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, XCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AssertionConfig, AssertionResults } from "@/types/testing";

interface AssertionTestProps {
  config: AssertionConfig;
  onConfigChange: (config: AssertionConfig) => void;
  results: AssertionResults | null;
  onRun: () => void;
  running: boolean;
  disabled?: boolean;
}

export function AssertionTest({
  config,
  onConfigChange,
  results,
  onRun,
  running,
  disabled,
}: AssertionTestProps) {
  const addAssertion = () => {
    onConfigChange({
      assertions: [
        ...config.assertions,
        { id: crypto.randomUUID(), expression: "" },
      ],
    });
  };

  const updateAssertion = (id: string, expression: string) => {
    onConfigChange({
      assertions: config.assertions.map((a) =>
        a.id === id ? { ...a, expression } : a
      ),
    });
  };

  const removeAssertion = (id: string) => {
    onConfigChange({
      assertions: config.assertions.filter((a) => a.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Assertions</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={addAssertion}
            disabled={disabled}
          >
            <Plus size={12} /> Add Assertion
          </Button>
        </div>

        <div className="space-y-2">
          {config.assertions.map((a) => (
            <div key={a.id} className="flex items-center gap-2">
              <Input
                value={a.expression}
                onChange={(e) => updateAssertion(a.id, e.target.value)}
                placeholder="e.g. response.status === 200"
                className="flex-1 text-xs font-mono h-8"
                disabled={disabled}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-foreground-subtle hover:text-red-400"
                onClick={() => removeAssertion(a.id)}
                disabled={disabled || config.assertions.length === 1}
              >
                <Trash2 size={12} />
              </Button>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-foreground-subtle">
          Available: <code className="text-foreground-muted">response.status</code>,{" "}
          <code className="text-foreground-muted">.statusText</code>,{" "}
          <code className="text-foreground-muted">.time</code>,{" "}
          <code className="text-foreground-muted">.size</code>,{" "}
          <code className="text-foreground-muted">.body</code>,{" "}
          <code className="text-foreground-muted">.headers</code>
        </p>
      </div>

      <Button
        onClick={onRun}
        disabled={
          disabled ||
          running ||
          config.assertions.every((a) => !a.expression.trim())
        }
        className="bg-primary-action text-primary-action-fg hover:bg-primary-action/85 h-8 text-xs gap-1.5"
      >
        <Play size={12} /> {running ? "Running..." : "Run Assertions"}
      </Button>

      {results && <AssertionResultsView results={results} />}
    </div>
  );
}

export function AssertionResultsView({
  results,
}: {
  results: AssertionResults;
}) {
  const allPassed = results.results.every((r) => r.passed);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 bg-panel border border-border rounded-lg">
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            results.responseSnapshot.status >= 200 &&
              results.responseSnapshot.status < 300
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : results.responseSnapshot.status >= 400
                ? "bg-red-500/15 text-red-400 border-red-500/30"
                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
          )}
        >
          {results.responseSnapshot.status}
        </Badge>
        <span className="text-xs text-foreground-muted">
          {results.responseSnapshot.time}ms
        </span>
        <span className="text-xs text-foreground-subtle">
          {results.responseSnapshot.size} bytes
        </span>
        <Badge
          variant="outline"
          className={cn(
            "ml-auto text-xs",
            allPassed
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border-red-500/30"
          )}
        >
          {allPassed ? "All Passed" : "Failed"}
        </Badge>
      </div>

      <div className="space-y-1.5">
        {results.results.map((r) => (
          <div
            key={r.id}
            className={cn(
              "flex items-start gap-2 px-3 py-2 rounded-md border text-xs",
              r.passed
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            )}
          >
            {r.passed ? (
              <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            )}
            <div className="min-w-0">
              <code className="text-foreground-muted font-mono">
                {r.expression}
              </code>
              {r.error && (
                <p className="text-red-400 mt-0.5">{r.error}</p>
              )}
              {!r.error && !r.passed && r.actual && (
                <p className="text-foreground-subtle mt-0.5">
                  Got: {r.actual}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
