"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { SavedRequest } from "@/types/request";
import { EnvironmentVariable } from "@/types/environment";
import {
  TestRun,
  TestType,
  TestStatus,
  AssertionConfig,
  AssertionResults,
  LoadConfig,
  LoadResults,
  RateLimitConfig,
  RateLimitResults,
  UptimeConfig,
  UptimeResults,
} from "@/types/testing";
import { sendRequest, SendResult } from "@/lib/request/send-request";
import {
  saveTestRun,
  loadAllTestRuns,
  deleteTestRun,
  clearAllTestRuns,
} from "@/lib/storage/storage-helpers";

type ProgressCallback = (current: number, total: number) => void;

export function useTesting() {
  const [history, setHistory] = useState<TestRun[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const abortRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadHistory = useCallback(async () => {
    const runs = await loadAllTestRuns();
    setHistory(runs);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  // --- Assertion runner ---
  async function runAssertion(
    request: SavedRequest,
    variables: EnvironmentVariable[],
    config: AssertionConfig
  ): Promise<TestRun> {
    const startTime = Date.now();
    const result = await sendRequest(request, variables);
    const { response } = result;

    let parsedBody: unknown = response.raw;
    try {
      parsedBody = JSON.parse(response.raw);
    } catch {
      // not JSON
    }

    const ctx = {
      status: response.status,
      statusText: response.statusText,
      time: response.time,
      size: response.size,
      body: parsedBody,
      headers: response.headers,
    };

    const assertionResults = config.assertions.map((a) => {
      try {
        const fn = new Function("response", "return (" + a.expression + ")");
        const result = fn(ctx);
        return {
          id: a.id,
          expression: a.expression,
          passed: !!result,
          actual: String(result),
        };
      } catch (err) {
        return {
          id: a.id,
          expression: a.expression,
          passed: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    const allPassed = assertionResults.every((r) => r.passed);

    const run: TestRun = {
      id: crypto.randomUUID(),
      requestId: request.id,
      requestName: request.name,
      requestMethod: request.method,
      requestUrl: request.url,
      testType: "assertion",
      config,
      results: {
        results: assertionResults,
        responseSnapshot: {
          status: response.status,
          time: response.time,
          size: response.size,
        },
      } as AssertionResults,
      status: allPassed ? "pass" : "fail",
      startTime,
      endTime: Date.now(),
    };

    await saveTestRun(run);
    await loadHistory();
    return run;
  }

  // --- Load runner ---
  async function runLoad(
    request: SavedRequest,
    variables: EnvironmentVariable[],
    config: LoadConfig,
    onProgress: ProgressCallback
  ): Promise<TestRun> {
    const startTime = Date.now();
    const responses: LoadResults["responses"] = [];

    if (config.mode === "sequential") {
      for (let i = 0; i < config.requestCount; i++) {
        if (abortRef.current?.signal.aborted) break;
        const result = await sendRequest(request, variables);
        responses.push({
          index: i,
          time: result.response.time,
          status: result.response.status,
          error: result.response.error,
        });
        onProgress(i + 1, config.requestCount);
      }
    } else {
      const promises = Array.from({ length: config.requestCount }, (_, i) =>
        sendRequest(request, variables).then((result) => {
          responses.push({
            index: i,
            time: result.response.time,
            status: result.response.status,
            error: result.response.error,
          });
          onProgress(responses.length, config.requestCount);
          return result;
        })
      );
      await Promise.allSettled(promises);
      responses.sort((a, b) => a.index - b.index);
    }

    const times = responses.map((r) => r.time).sort((a, b) => a - b);
    const success = responses.filter((r) => r.status >= 200 && r.status < 300).length;
    const elapsed = (Date.now() - startTime) / 1000;

    const run: TestRun = {
      id: crypto.randomUUID(),
      requestId: request.id,
      requestName: request.name,
      requestMethod: request.method,
      requestUrl: request.url,
      testType: "load",
      config,
      results: {
        total: responses.length,
        success,
        failed: responses.length - success,
        avgTime: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
        p95: times.length ? times[Math.floor(times.length * 0.95)] : 0,
        reqPerSec: elapsed > 0 ? parseFloat((responses.length / elapsed).toFixed(2)) : 0,
        responses,
      } as LoadResults,
      status: "complete",
      startTime,
      endTime: Date.now(),
    };

    await saveTestRun(run);
    await loadHistory();
    return run;
  }

  // --- Rate Limit runner ---
  async function runRateLimit(
    request: SavedRequest,
    variables: EnvironmentVariable[],
    config: RateLimitConfig,
    onProgress: ProgressCallback
  ): Promise<TestRun> {
    const startTime = Date.now();
    const responses: RateLimitResults["responses"] = [];
    let limitHitAt: number | undefined;
    let retryAfter: string | undefined;

    for (let i = 0; i < config.maxRequests; i++) {
      if (abortRef.current?.signal.aborted) break;

      const result = await sendRequest(request, variables);
      responses.push({
        index: i,
        time: result.response.time,
        status: result.response.status,
      });
      onProgress(i + 1, config.maxRequests);

      if (result.response.status === 429 || result.response.status === 503) {
        limitHitAt = i + 1;
        retryAfter = result.response.headers["retry-after"];
        break;
      }

      if (config.delayMs > 0) {
        await new Promise((r) => setTimeout(r, config.delayMs));
      }
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const estimatedRPM =
      elapsed > 0 ? Math.round((responses.length / elapsed) * 60) : undefined;

    const run: TestRun = {
      id: crypto.randomUUID(),
      requestId: request.id,
      requestName: request.name,
      requestMethod: request.method,
      requestUrl: request.url,
      testType: "rate-limit",
      config,
      results: {
        requestsSent: responses.length,
        limitHitAt,
        estimatedRPM,
        retryAfter,
        responses,
      } as RateLimitResults,
      status: "complete",
      startTime,
      endTime: Date.now(),
    };

    await saveTestRun(run);
    await loadHistory();
    return run;
  }

  // --- Uptime runner ---
  function runUptime(
    request: SavedRequest,
    variables: EnvironmentVariable[],
    config: UptimeConfig,
    onProgress: ProgressCallback,
    onUpdate: (results: UptimeResults) => void
  ): Promise<TestRun> {
    const startTime = Date.now();
    const totalChecks = Math.floor((config.durationMin * 60) / config.intervalSec);
    const checks: UptimeResults["checks"] = [];

    return new Promise((resolve) => {
      let completed = 0;

      const doCheck = async () => {
        if (abortRef.current?.signal.aborted) {
          finish();
          return;
        }

        const result = await sendRequest(request, variables);
        const success = result.response.status >= 200 && result.response.status < 300;
        checks.push({
          timestamp: Date.now(),
          status: result.response.status,
          time: result.response.time,
          success,
        });
        completed++;
        onProgress(completed, totalChecks);

        const successCount = checks.filter((c) => c.success).length;
        const avgTime = checks.length
          ? Math.round(checks.reduce((a, c) => a + c.time, 0) / checks.length)
          : 0;

        onUpdate({
          checks: [...checks],
          uptimePercent: checks.length ? parseFloat(((successCount / checks.length) * 100).toFixed(1)) : 100,
          avgResponseTime: avgTime,
        });

        if (completed >= totalChecks) {
          finish();
        }
      };

      const finish = async () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        const successCount = checks.filter((c) => c.success).length;
        const avgTime = checks.length
          ? Math.round(checks.reduce((a, c) => a + c.time, 0) / checks.length)
          : 0;

        const run: TestRun = {
          id: crypto.randomUUID(),
          requestId: request.id,
          requestName: request.name,
          requestMethod: request.method,
          requestUrl: request.url,
          testType: "uptime",
          config,
          results: {
            checks,
            uptimePercent: checks.length
              ? parseFloat(((successCount / checks.length) * 100).toFixed(1))
              : 100,
            avgResponseTime: avgTime,
          } as UptimeResults,
          status: "complete",
          startTime,
          endTime: Date.now(),
        };

        await saveTestRun(run);
        await loadHistory();
        resolve(run);
      };

      // Run first check immediately
      doCheck();
      intervalRef.current = setInterval(doCheck, config.intervalSec * 1000);
    });
  }

  // --- Main dispatch ---
  const runTest = useCallback(
    async (
      testType: TestType,
      request: SavedRequest,
      variables: EnvironmentVariable[],
      config: AssertionConfig | LoadConfig | RateLimitConfig | UptimeConfig,
      onUptimeUpdate?: (results: UptimeResults) => void
    ): Promise<TestRun> => {
      abortRef.current = new AbortController();
      setRunning(true);
      setProgress({ current: 0, total: 0 });

      const onProgress: ProgressCallback = (current, total) => {
        setProgress({ current, total });
      };

      try {
        let run: TestRun;
        switch (testType) {
          case "assertion":
            run = await runAssertion(request, variables, config as AssertionConfig);
            break;
          case "load":
            run = await runLoad(request, variables, config as LoadConfig, onProgress);
            break;
          case "rate-limit":
            run = await runRateLimit(request, variables, config as RateLimitConfig, onProgress);
            break;
          case "uptime":
            run = await runUptime(
              request,
              variables,
              config as UptimeConfig,
              onProgress,
              onUptimeUpdate ?? (() => {})
            );
            break;
          default:
            throw new Error(`Unknown test type: ${testType}`);
        }
        return run;
      } finally {
        setRunning(false);
        abortRef.current = null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const removeTestRun = useCallback(
    async (id: string) => {
      await deleteTestRun(id);
      await loadHistory();
    },
    [loadHistory]
  );

  const clearHistory = useCallback(async () => {
    await clearAllTestRuns();
    setHistory([]);
  }, []);

  return {
    history,
    running,
    progress,
    runTest,
    abort,
    removeTestRun,
    clearHistory,
    loadHistory,
  };
}
