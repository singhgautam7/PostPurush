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
    <div className="flex flex-col h-full bg-zinc-950 relative overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 shrink-0 bg-zinc-950 z-10">
        {/* Level 2 — Underline tabs for Pretty/Raw */}
        <div className="flex items-center gap-1 border-b border-transparent -mb-px">
          {(["pretty", "raw"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium capitalize transition-all border-b-2 -mb-px",
                viewMode === mode
                  ? "text-zinc-100 border-zinc-400"
                  : "text-zinc-500 border-transparent hover:text-zinc-300"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-zinc-600 hover:text-zinc-300"
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

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 max-h-[90vh] overflow-auto w-full">
          {!displayBody ? (
            <div className="p-4">
              <span className="text-zinc-600 italic text-sm">Empty response</span>
            </div>
          ) : viewMode === "pretty" && responseType === "json" ? (
            <div className="min-w-max h-full">
              <CodeViewer
                code={jsonParsed ? JSON.stringify(jsonParsed, null, 2) : displayBody}
                language="json"
                className="h-full border-none rounded-none"
              />
            </div>
          ) : viewMode === "pretty" && responseType === "html" ? (
            <div className="min-w-max h-full">
              <CodeViewer code={displayBody} language="html" className="h-full border-none rounded-none" />
            </div>
          ) : (
            <div className="p-4 font-mono text-sm leading-relaxed text-zinc-300 min-w-max">
              <pre className="whitespace-pre font-mono">
                {displayBody}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
