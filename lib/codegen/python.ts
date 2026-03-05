import { SavedRequest } from "@/types/request";
import { buildUrl } from "@/lib/request/build-url";

export function generatePython(request: SavedRequest): string {
    const url = buildUrl(request.url, request.params.filter((p) => p.key));
    const lines: string[] = ["import requests", ""];

    const activeHeaders = request.headers.filter((h) => h.key);
    if (activeHeaders.length > 0) {
        lines.push("headers = {");
        for (const h of activeHeaders) {
            lines.push(`    "${h.key}": "${h.value}",`);
        }
        lines.push("}", "");
    }

    if (request.method !== "GET" && request.body.content) {
        if (request.body.type === "json") {
            lines.push("import json", "");
            lines.push(`payload = json.loads('''${request.body.content}''')`);
            lines.push("");
        } else {
            lines.push(`payload = """${request.body.content}"""`);
            lines.push("");
        }
    }

    const method = request.method.toLowerCase();
    const args: string[] = [`"${url}"`];

    if (activeHeaders.length > 0) {
        args.push("headers=headers");
    }

    if (request.method !== "GET" && request.body.content) {
        if (request.body.type === "json") {
            args.push("json=payload");
        } else {
            args.push("data=payload");
        }
    }

    lines.push(`response = requests.${method}(`);
    lines.push(`    ${args.join(",\n    ")}`);
    lines.push(")");
    lines.push("");
    lines.push("print(response.status_code)");
    lines.push("print(response.text)");

    return lines.join("\n");
}
