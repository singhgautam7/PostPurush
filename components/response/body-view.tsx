"use client";

import { useResponseStore } from "@/store/response-store";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
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
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 shrink-0 bg-background z-10">
        <div className="flex items-center gap-1">
          {(["pretty", "raw"] as const).map((mode) => (
            <Badge
              key={mode}
              variant={viewMode === mode ? "default" : "outline"}
              className={cn(
                "cursor-pointer capitalize transition-all text-xs",
                viewMode === mode
                  ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                  : "hover:bg-muted/60"
              )}
              onClick={() => setViewMode(mode)}
            >
              {mode}
            </Badge>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground"
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
              <span className="text-muted-foreground italic text-sm">Empty response</span>
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
            <div className="p-4 font-mono text-sm leading-relaxed text-foreground/90 min-w-max">
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
