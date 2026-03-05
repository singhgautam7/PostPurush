import { SavedRequest } from "@/types/request";
import { buildUrl } from "@/lib/request/build-url";

export function generateCurl(request: SavedRequest): string {
    const url = buildUrl(request.url, request.params.filter((p) => p.key));
    const lines: string[] = [`curl -X ${request.method} '${url}'`];

    for (const h of request.headers) {
        if (h.key) {
            lines.push(`  -H '${h.key}: ${h.value}'`);
        }
    }

    if (request.method !== "GET" && request.body.content) {
        const escaped = request.body.content.replace(/'/g, "'\\''");
        lines.push(`  -d '${escaped}'`);
    }

    return lines.join(" \\\n");
}
