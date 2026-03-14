export type TestType = "assertion" | "load" | "rate-limit" | "uptime";
export type TestStatus = "pass" | "fail" | "error" | "complete";

// --- Assertion ---
export interface AssertionConfig {
  assertions: { id: string; expression: string }[];
}

export interface AssertionResults {
  results: {
    id: string;
    expression: string;
    passed: boolean;
    error?: string;
    actual?: string;
  }[];
  responseSnapshot: { status: number; time: number; size: number };
}

// --- Load ---
export interface LoadConfig {
  requestCount: number;
  mode: "sequential" | "concurrent";
}

export interface LoadResults {
  total: number;
  success: number;
  failed: number;
  avgTime: number;
  p95: number;
  reqPerSec: number;
  responses: { index: number; time: number; status: number; error?: string }[];
}

// --- Rate Limit ---
export interface RateLimitConfig {
  maxRequests: number;
  delayMs: number;
}

export interface RateLimitResults {
  requestsSent: number;
  limitHitAt?: number;
  estimatedRPM?: number;
  retryAfter?: string;
  responses: { index: number; time: number; status: number }[];
}

// --- Uptime ---
export interface UptimeConfig {
  intervalSec: number;
  durationMin: number;
}

export interface UptimeResults {
  checks: { timestamp: number; status: number; time: number; success: boolean }[];
  uptimePercent: number;
  avgResponseTime: number;
}

// --- Test Run ---
export interface TestRun {
  id: string;
  requestId: string;
  requestName: string;
  requestMethod: string;
  requestUrl: string;
  testType: TestType;
  config: AssertionConfig | LoadConfig | RateLimitConfig | UptimeConfig;
  results: AssertionResults | LoadResults | RateLimitResults | UptimeResults;
  status: TestStatus;
  startTime: number;
  endTime: number;
}
