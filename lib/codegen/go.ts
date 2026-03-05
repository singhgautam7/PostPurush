import { SavedRequest } from "@/types/request";
import { buildUrl } from "@/lib/request/build-url";

export function generateGo(request: SavedRequest): string {
    const url = buildUrl(request.url, request.params.filter((p) => p.key));
    const activeHeaders = request.headers.filter((h) => h.key);
    const hasBody = request.method !== "GET" && request.body.content;

    const lines: string[] = [];
    lines.push("package main");
    lines.push("");
    lines.push("import (");
    lines.push('	"fmt"');
    lines.push('	"io"');
    lines.push('	"net/http"');
    if (hasBody) {
        lines.push('	"strings"');
    }
    lines.push(")");
    lines.push("");
    lines.push("func main() {");

    if (hasBody) {
        const escaped = request.body.content.replace(/`/g, "` + \"`\" + `");
        lines.push(`	body := strings.NewReader(\`${escaped}\`)`);
        lines.push(
            `	req, err := http.NewRequest("${request.method}", "${url}", body)`
        );
    } else {
        lines.push(
            `	req, err := http.NewRequest("${request.method}", "${url}", nil)`
        );
    }

    lines.push("	if err != nil {");
    lines.push("		panic(err)");
    lines.push("	}");
    lines.push("");

    for (const h of activeHeaders) {
        lines.push(`	req.Header.Set("${h.key}", "${h.value}")`);
    }

    if (hasBody && request.body.type === "json") {
        const hasContentType = activeHeaders.some(
            (h) => h.key.toLowerCase() === "content-type"
        );
        if (!hasContentType) {
            lines.push('	req.Header.Set("Content-Type", "application/json")');
        }
    }

    lines.push("");
    lines.push("	client := &http.Client{}");
    lines.push("	resp, err := client.Do(req)");
    lines.push("	if err != nil {");
    lines.push("		panic(err)");
    lines.push("	}");
    lines.push("	defer resp.Body.Close()");
    lines.push("");
    lines.push("	respBody, err := io.ReadAll(resp.Body)");
    lines.push("	if err != nil {");
    lines.push("		panic(err)");
    lines.push("	}");
    lines.push("");
    lines.push('	fmt.Println("Status:", resp.StatusCode)');
    lines.push('	fmt.Println("Body:", string(respBody))');
    lines.push("}");

    return lines.join("\n");
}
