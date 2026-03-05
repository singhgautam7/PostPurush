import { KeyValuePair } from "@/types/request";

export function extractQueryParams(urlStr: string): KeyValuePair[] {
    const queryIndex = urlStr.indexOf("?");
    if (queryIndex === -1) return [{ key: "", value: "" }];

    const queryParams = urlStr.substring(queryIndex + 1).split("&");
    const params: KeyValuePair[] = [];

    for (const param of queryParams) {
        // We parse everything even if empty, as in Postman
        const [key, ...valueParts] = param.split("=");
        const value = valueParts.join("=");
        params.push({
            key: decodeURIComponent(key || ""),
            value: decodeURIComponent(value || ""),
        });
    }

    // Ensure there's at least one empty row at the end for UI convenience
    // Actually, we'll let the UI handle the trailing empty row to avoid
    // duplicating logic, or we just push one if it's completely empty.
    if (params.length === 0 || (params[params.length - 1].key !== "" && params[params.length - 1].value !== "")) {
        params.push({ key: "", value: "" });
    }

    return params;
}

export function applyQueryParamsToUrl(urlStr: string, params: KeyValuePair[]): string {
    const baseUrl = urlStr.split("?")[0];
    const queryParts: string[] = [];

    for (const param of params) {
        if (param.key && (param.enabled === undefined || param.enabled)) {
            queryParts.push(
                `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`
            );
        }
    }

    // if the original URL ends with ?, and we have no params, we drop it.
    // if the user typed ?, we might want to keep it, but standard behavior cleans it.
    if (queryParts.length === 0) return baseUrl;

    return `${baseUrl}?${queryParts.join("&")}`;
}
