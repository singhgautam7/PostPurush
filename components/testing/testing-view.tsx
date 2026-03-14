"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SavedRequest } from "@/types/request";
import {
  TestType,
  TestRun,
  AssertionConfig,
  AssertionResults,
  LoadConfig,
  LoadResults,
  RateLimitConfig,
  RateLimitResults,
  UptimeConfig,
  UptimeResults,
} from "@/types/testing";
import { useRequestStore } from "@/store/request-store";
import { useEnvironmentStore } from "@/store/environment-store";
import { useTesting } from "@/hooks/use-testing";
import { RequestSelector } from "./request-selector";
import { TestTypeSelector } from "./test-type-selector";
import { AssertionTest } from "./assertion-test";
import { LoadTest } from "./load-test";
import { RateLimitTest } from "./rate-limit-test";
import { UptimeTest } from "./uptime-test";
import { TestHistory } from "./test-history";

const SESSION_REQUEST_KEY = "postpurush-test-request";
const SESSION_TYPE_KEY = "postpurush-test-type";

export function TestingView() {
  const savedRequests = useRequestStore((s) => s.savedRequests);
  const activeEnv = useEnvironmentStore((s) => s.activeEnv);

  const {
    history,
    running,
    progress,
    runTest,
    abort,
    removeTestRun,
    clearHistory,
  } = useTesting();

  const [activeTab, setActiveTab] = useState<"run" | "history">("run");
  const [selectedRequest, setSelectedRequest] = useState<SavedRequest | null>(
    null
  );
  const [testType, setTestType] = useState<TestType>("assertion");

  // Test configs
  const [assertionConfig, setAssertionConfig] = useState<AssertionConfig>({
    assertions: [
      { id: crypto.randomUUID(), expression: "response.status === 200" },
    ],
  });
  const [loadConfig, setLoadConfig] = useState<LoadConfig>({
    requestCount: 10,
    mode: "sequential",
  });
  const [rateLimitConfig, setRateLimitConfig] = useState<RateLimitConfig>({
    maxRequests: 60,
    delayMs: 0,
  });
  const [uptimeConfig, setUptimeConfig] = useState<UptimeConfig>({
    intervalSec: 5,
    durationMin: 1,
  });

  // Test results
  const [assertionResults, setAssertionResults] =
    useState<AssertionResults | null>(null);
  const [loadResults, setLoadResults] = useState<LoadResults | null>(null);
  const [rateLimitResults, setRateLimitResults] =
    useState<RateLimitResults | null>(null);
  const [uptimeResults, setUptimeResults] = useState<UptimeResults | null>(
    null
  );

  // Restore from sessionStorage
  useEffect(() => {
    const savedRequestId = sessionStorage.getItem(SESSION_REQUEST_KEY);
    const savedType = sessionStorage.getItem(SESSION_TYPE_KEY) as TestType;
    if (savedType) setTestType(savedType);
    if (savedRequestId && savedRequests.length > 0) {
      const found = savedRequests.find((r) => r.id === savedRequestId);
      if (found) setSelectedRequest(found);
    }
  }, [savedRequests]);

  // Persist to sessionStorage
  useEffect(() => {
    if (selectedRequest) {
      sessionStorage.setItem(SESSION_REQUEST_KEY, selectedRequest.id);
    } else {
      sessionStorage.removeItem(SESSION_REQUEST_KEY);
    }
  }, [selectedRequest]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_TYPE_KEY, testType);
  }, [testType]);

  const getVariables = useCallback(() => {
    const env = activeEnv();
    if (!env) return [];
    return env.variables
      .filter((v) => v.enabled)
      .map((v) => ({ key: v.key, value: v.value }));
  }, [activeEnv]);

  const handleRun = useCallback(async () => {
    if (!selectedRequest) return;
    const variables = getVariables();

    let config: AssertionConfig | LoadConfig | RateLimitConfig | UptimeConfig;
    switch (testType) {
      case "assertion":
        config = assertionConfig;
        break;
      case "load":
        config = loadConfig;
        break;
      case "rate-limit":
        config = rateLimitConfig;
        break;
      case "uptime":
        config = uptimeConfig;
        break;
    }

    try {
      const run = await runTest(
        testType,
        selectedRequest,
        variables,
        config,
        testType === "uptime"
          ? (results) => setUptimeResults(results)
          : undefined
      );

      // Set results
      switch (testType) {
        case "assertion":
          setAssertionResults(run.results as AssertionResults);
          break;
        case "load":
          setLoadResults(run.results as LoadResults);
          break;
        case "rate-limit":
          setRateLimitResults(run.results as RateLimitResults);
          break;
        case "uptime":
          setUptimeResults(run.results as UptimeResults);
          break;
      }

      toast.success("Test completed", {
        description: `${testType} test ${run.status === "pass" ? "passed" : run.status === "fail" ? "failed" : "completed"}`,
      });
    } catch (err) {
      toast.error("Test failed", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    }
  }, [
    selectedRequest,
    testType,
    assertionConfig,
    loadConfig,
    rateLimitConfig,
    uptimeConfig,
    getVariables,
    runTest,
  ]);

  const noRequest = !selectedRequest;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">API Testing</h1>
          <p className="text-xs text-foreground-subtle mt-1">
            Run assertions, load tests, rate limit detection, and uptime
            monitoring
          </p>
        </div>

        {/* Top tabs */}
        <div className="flex bg-panel border border-border rounded-md p-0.5 w-fit">
          {(["run", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1 text-xs rounded-sm transition-colors capitalize",
                activeTab === tab
                  ? "bg-tab-active text-foreground"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              {tab === "run" ? "Run Tests" : "History"}
            </button>
          ))}
        </div>

        {activeTab === "run" && (
          <div className="space-y-6">
            {/* Request selector */}
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-2">
                Select Request
              </label>
              <RequestSelector
                requests={savedRequests}
                selected={selectedRequest}
                onSelect={setSelectedRequest}
              />
            </div>

            {/* Test type selector */}
            <div>
              <label className="text-xs font-medium text-foreground-muted block mb-2">
                Test Type
              </label>
              <TestTypeSelector
                selected={testType}
                onSelect={setTestType}
                disabled={noRequest}
              />
            </div>

            {/* Config + Results */}
            {noRequest ? (
              <div className="text-center py-8">
                <p className="text-sm text-foreground-subtle">
                  Select a request to begin testing
                </p>
              </div>
            ) : (
              <div className="bg-panel border border-border rounded-lg p-4">
                {testType === "assertion" && (
                  <AssertionTest
                    config={assertionConfig}
                    onConfigChange={setAssertionConfig}
                    results={assertionResults}
                    onRun={handleRun}
                    running={running}
                  />
                )}
                {testType === "load" && (
                  <LoadTest
                    config={loadConfig}
                    onConfigChange={setLoadConfig}
                    results={loadResults}
                    onRun={handleRun}
                    running={running}
                    progress={progress}
                    request={selectedRequest}
                  />
                )}
                {testType === "rate-limit" && (
                  <RateLimitTest
                    config={rateLimitConfig}
                    onConfigChange={setRateLimitConfig}
                    results={rateLimitResults}
                    onRun={handleRun}
                    onStop={abort}
                    running={running}
                    progress={progress}
                  />
                )}
                {testType === "uptime" && (
                  <UptimeTest
                    config={uptimeConfig}
                    onConfigChange={setUptimeConfig}
                    results={uptimeResults}
                    onRun={handleRun}
                    onStop={abort}
                    running={running}
                    progress={progress}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <TestHistory
            history={history}
            onDelete={removeTestRun}
            onClearAll={clearHistory}
          />
        )}
      </div>
    </div>
  );
}
