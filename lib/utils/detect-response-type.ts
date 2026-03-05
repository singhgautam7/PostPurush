export function detectResponseType(headers: Record<string, string>): "json" | "html" | "text" | "string" {
    const contentTypeKey = Object.keys(headers).find(k => k.toLowerCase() === "content-type");
    const contentType = contentTypeKey ? headers[contentTypeKey] : "";
    const normalized = contentType.toLowerCase();

    if (normalized.includes("application/json")) return "json";
    if (normalized.includes("text/html")) return "html";
    if (normalized.includes("text/plain")) return "text";

    return "string";
}
