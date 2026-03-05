import { KeyValuePair } from "@/types/request";

export function buildUrl(baseUrl: string, params: KeyValuePair[]): string {
    if (!baseUrl) return baseUrl;

    const enabledParams = params.filter(
        (p) => p.key && (p.enabled === undefined || p.enabled)
    );

    if (enabledParams.length === 0) return baseUrl;

    const url = new URL(baseUrl.includes("://") ? baseUrl : `https://${baseUrl}`);

    for (const { key, value } of enabledParams) {
        url.searchParams.append(key, value);
    }

    return url.toString();
}
