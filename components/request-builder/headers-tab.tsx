"use client";

import { useRef } from "react";
import { useRequestStore } from "@/store/request-store";
import { KeyValuePair } from "@/types/request";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Key, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthPresets } from "@/lib/request/header-presets";

export function HeadersTab() {
  const headers = useRequestStore((s) => s.activeRequest.headers);
  const setHeaders = useRequestStore((s) => s.setHeaders);

  const keyRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const updateHeader = (index: number, field: keyof KeyValuePair, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && index === headers.length - 1) {
      e.preventDefault();
      setHeaders([...headers, { key: "", value: "" }]);
      setTimeout(() => { keyRefs.current[index + 1]?.focus(); }, 0);
    }
  };

  return (
    <div className="space-y-2 p-4">
      <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-xs font-medium text-muted-foreground mb-1">
        <span>Key</span>
        <span>Value</span>
        <span></span>
      </div>

      {headers.length === 0 && (
        <div className="text-xs text-muted-foreground italic mb-2 px-1">
          No headers added
        </div>
      )}

      {headers.map((header, index) => (
        <div key={index} className="group grid grid-cols-[1fr_1fr_40px] gap-2">
          <Input
            ref={(el) => { keyRefs.current[index] = el; }}
            value={header.key}
            onChange={(e) => updateHeader(index, "key", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="header name"
            className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
          />
          <Input
            value={header.value}
            onChange={(e) => updateHeader(index, "value", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="value"
            className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeHeader(index)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setHeaders([...headers, { key: "", value: "" }]);
            setTimeout(() => { keyRefs.current[headers.length]?.focus(); }, 0);
          }}
          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <Plus className="h-3 w-3" />
          Add Header
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary font-medium gap-1 bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-colors"
            >
              <Key className="h-3 w-3" />
              Add Auth
              <ChevronDown className="h-3 w-3 text-primary opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px]">
            {Object.entries(AuthPresets).map(([name, preset]) => (
              <DropdownMenuItem
                key={name}
                onClick={() => {
                  if (headers.length === 1 && !headers[0].key && !headers[0].value) {
                    setHeaders([preset]);
                  } else {
                    setHeaders([...headers, preset]);
                  }
                }}
                className="text-xs flex flex-col items-start px-3 py-1.5"
              >
                <span className="font-medium">{name}</span>
                <span className="text-[10px] text-muted-foreground font-mono mt-0.5 opacity-70">
                  {preset.key}: {preset.value.split(" ")[0]}...
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
