"use client";

import { useRequestStore } from "@/store/request-store";
import { KeyValuePair } from "@/types/request";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function HeadersTab() {
  const headers = useRequestStore((s) => s.activeRequest.headers);
  const setHeaders = useRequestStore((s) => s.setHeaders);

  const updateHeader = (index: number, field: keyof KeyValuePair, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };

    if (
      index === newHeaders.length - 1 &&
      (newHeaders[index].key || newHeaders[index].value)
    ) {
      newHeaders.push({ key: "", value: "" });
    }

    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    if (headers.length <= 1) return;
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  return (
    <div className="space-y-2 p-4">
      <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-xs font-medium text-muted-foreground mb-1">
        <span>Key</span>
        <span>Value</span>
        <span></span>
      </div>
      {headers.map((header, index) => (
        <div key={index} className="group grid grid-cols-[1fr_1fr_40px] gap-2">
          <Input
            value={header.key}
            onChange={(e) => updateHeader(index, "key", e.target.value)}
            placeholder="header name"
            className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
          />
          <Input
            value={header.value}
            onChange={(e) => updateHeader(index, "value", e.target.value)}
            placeholder="value"
            className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeHeader(index)}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            disabled={headers.length <= 1}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setHeaders([...headers, { key: "", value: "" }])}
        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
      >
        <Plus className="h-3 w-3" />
        Add Header
      </Button>
    </div>
  );
}
