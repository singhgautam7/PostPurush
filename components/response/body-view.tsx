"use client";

import { useResponseStore } from "@/store/response-store";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function BodyView() {
  const response = useResponseStore((s) => s.response);
  const [viewMode, setViewMode] = useState<"pretty" | "raw">("pretty");
  const [copied, setCopied] = useState(false);

  if (!response) return null;

  if (response.error) {
    return (
      <div className="p-4">
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

  const displayBody = viewMode === "pretty" ? response.body : response.raw;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
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
      <ScrollArea className="flex-1">
        <pre className="p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap break-all text-foreground/90">
          {displayBody || <span className="text-muted-foreground italic">Empty response</span>}
        </pre>
      </ScrollArea>
    </div>
  );
}
