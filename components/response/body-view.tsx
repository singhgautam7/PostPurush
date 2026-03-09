"use client";

import { useResponseStore } from "@/store/response-store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectResponseType } from "@/lib/utils/detect-response-type";
import { CodeViewer } from "@/components/code/code-viewer";

export function BodyView() {
  const response = useResponseStore((s) => s.response);
  const [viewMode, setViewMode] = useState<"pretty" | "raw">("pretty");
  const [copied, setCopied] = useState(false);

  if (!response) return null;

  if (response.error) {
    return (
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="rounded-lg border border-red-800 bg-red-950 p-4">
          <p className="text-sm text-red-400">{response.error}</p>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    const text = viewMode === "pretty" ? response.body : response.raw;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const responseType = detectResponseType(response.headers);
  let jsonParsed: object | null = null;

  if (viewMode === "pretty" && responseType === "json") {
    try {
      jsonParsed = JSON.parse(response.raw);
    } catch {
      // Not valid JSON
    }
  }

  const displayBody = viewMode === "pretty" ? response.body : response.raw;

  return (
    <div className="flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0 bg-background sticky top-0 z-10">
        {/* Level 2 — Underline tabs for Pretty/Raw */}
        <div className="flex items-center gap-1 border-b border-transparent -mb-px">
          {(["pretty", "raw"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium capitalize transition-all border-b-2 -mb-px",
                viewMode === mode
                  ? "text-foreground border-foreground-muted"
                  : "text-foreground-subtle border-transparent hover:text-foreground-muted"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-foreground-subtle hover:text-foreground-muted"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <div>
        {!displayBody ? (
          <div className="p-4">
            <span className="text-foreground-subtle italic text-sm">Empty response</span>
          </div>
        ) : viewMode === "pretty" && responseType === "json" ? (
          <CodeViewer
            code={jsonParsed ? JSON.stringify(jsonParsed, null, 2) : displayBody}
            language="json"
            showCopy={false}
            className="border-none rounded-none"
          />
        ) : viewMode === "pretty" && responseType === "html" ? (
          <CodeViewer code={displayBody} language="html" showCopy={false} className="border-none rounded-none" />
        ) : (
          <div className="p-4 font-mono text-sm leading-relaxed text-foreground-muted">
            <pre className="whitespace-pre font-mono">
              {displayBody}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
