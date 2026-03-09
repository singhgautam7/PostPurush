import { SavedRequest } from "@/types/request";
import { ApiResponse } from "@/types/response";
import { EnvironmentVariable } from "@/types/environment";
import { replaceVariables } from "./replace-variables";
import { buildUrl } from "./build-url";
import { getResponseSize } from "@/utils/get-response-size";

export interface SendResult {
    response: ApiResponse;
    resolvedUrl: string;
    startTime: number;
    endTime: number;
}

export async function sendRequest(
    request: SavedRequest,
    variables: EnvironmentVariable[]
): Promise<SendResult> {
    // Replace variables in URL
    const processedUrl = replaceVariables(request.url, variables);

    // Replace variables in params
    const processedParams = request.params.map((p) => ({
        ...p,
        key: replaceVariables(p.key, variables),
        value: replaceVariables(p.value, variables),
    }));

    // Build final URL with query params
    let finalUrl: string;
    try {
        finalUrl = buildUrl(processedUrl, processedParams);
    } catch {
        const now = Date.now();
        return {
            response: {
                status: 0,
                statusText: "Error",
                time: 0,
                size: 0,
                headers: {},
                body: "",
                raw: "",
                error: "Invalid URL. Please check the URL and try again.",
            },
            resolvedUrl: processedUrl,
            startTime: now,
            endTime: now,
        };
    }

    // Build headers
    const headers: Record<string, string> = {};
    for (const h of request.headers) {
        if (h.key && (h.enabled === undefined || h.enabled)) {
            headers[replaceVariables(h.key, variables)] = replaceVariables(
                h.value,
                variables
            );
        }
    }

    // Build body
    let body: any = undefined;
    if (request.method !== "GET") {
        if (request.body.type === "form") {
            const formData = new URLSearchParams();
            for (const item of request.body.formData || []) {
                if (item.key && (item.enabled === undefined || item.enabled)) {
                    formData.append(
                        replaceVariables(item.key, variables),
                        replaceVariables(item.value, variables)
                    );
                }
            }
            body = formData;
        } else if (request.body.content) {
            body = replaceVariables(request.body.content, variables);

            if (request.body.type === "json" && !headers["Content-Type"]) {
                headers["Content-Type"] = "application/json";
            }
        }
    }

    // Validate JSON body
    if (request.body.type === "json" && body) {
        try {
            JSON.parse(body as string);
        } catch {
            const now = Date.now();
            return {
                response: {
                    status: 0,
                    statusText: "Error",
                    time: 0,
                    size: 0,
                    headers: {},
                    body: "",
                    raw: "",
                    error: "Invalid JSON body. Please check syntax and try again.",
                },
                resolvedUrl: finalUrl,
                startTime: now,
                endTime: now,
            };
        }
    }

    const wallStart = Date.now();
    const perfStart = performance.now();

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(finalUrl, {
            method: request.method,
            headers,
            body,
            signal: controller.signal,
        });

        clearTimeout(timeout);
        const perfEnd = performance.now();
        const wallEnd = Date.now();
        const time = Math.round(perfEnd - perfStart);

        const raw = await response.text();
        const size = getResponseSize(raw);

        // Extract response headers
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        // Try to pretty-print JSON
        let formattedBody = raw;
        try {
            const parsed = JSON.parse(raw);
            formattedBody = JSON.stringify(parsed, null, 2);
        } catch {
            // Not JSON, use raw text
        }

        return {
            response: {
                status: response.status,
                statusText: response.statusText,
                time,
                size,
                headers: responseHeaders,
                body: formattedBody,
                raw,
            },
            resolvedUrl: finalUrl,
            startTime: wallStart,
            endTime: wallEnd,
        };
    } catch (err) {
        const perfEnd = performance.now();
        const wallEnd = Date.now();
        const time = Math.round(perfEnd - perfStart);

        let errorMessage = "An unknown error occurred.";
        if (err instanceof DOMException && err.name === "AbortError") {
            errorMessage = "Request timed out after 30 seconds.";
        } else if (err instanceof TypeError) {
            errorMessage = `Network error: ${err.message}. Check the URL and your connection.`;
        } else if (err instanceof Error) {
            errorMessage = err.message;
        }

        return {
            response: {
                status: 0,
                statusText: "Error",
                time,
                size: 0,
                headers: {},
                body: "",
                raw: "",
                error: errorMessage,
            },
            resolvedUrl: finalUrl,
            startTime: wallStart,
            endTime: wallEnd,
        };
    }
}
