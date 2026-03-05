import { SavedRequest } from "@/types/request";
import { buildUrl } from "@/lib/request/build-url";

export function generateJavascript(request: SavedRequest): string {
    const url = buildUrl(request.url, request.params.filter((p) => p.key));
    const activeHeaders = request.headers.filter((h) => h.key);

    const options: string[] = [];
    options.push(`  method: "${request.method}"`);

    if (activeHeaders.length > 0) {
        const headerEntries = activeHeaders
            .map((h) => `    "${h.key}": "${h.value}"`)
            .join(",\n");
        options.push(`  headers: {\n${headerEntries}\n  }`);
    }

    if (request.method !== "GET" && request.body.content) {
        if (request.body.type === "json") {
            options.push(`  body: JSON.stringify(${request.body.content})`);
        } else {
            options.push(`  body: \`${request.body.content}\``);
        }
    }

    const lines: string[] = [];
    lines.push(`const response = await fetch("${url}", {`);
    lines.push(options.join(",\n"));
    lines.push("});");
    lines.push("");
    lines.push("const data = await response.json();");
    lines.push("console.log(data);");

    return lines.join("\n");
}
