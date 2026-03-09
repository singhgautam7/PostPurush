"use client";

import { useRequestStore } from "@/store/request-store";
import { KeyValueTable } from "@/components/shared/key-value-table";
import { Button } from "@/components/ui/button";
import { Key, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthPresets } from "@/lib/request/header-presets";

const SENSITIVE_HEADER_KEYS = [
  "Authorization",
  "x-api-key",
  "x-auth-token",
  "api-key",
  "token",
  "x-access-token",
];

export function HeadersTab() {
  const headers = useRequestStore((s) => s.activeRequest.headers);
  const setHeaders = useRequestStore((s) => s.setHeaders);

  const authDropdown = (
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
              if (
                headers.length === 1 &&
                !headers[0].key &&
                !headers[0].value
              ) {
                setHeaders([{ ...preset, sensitive: true }]);
              } else {
                setHeaders([...headers, { ...preset, sensitive: true }]);
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
  );

  return (
    <div className="p-4">
      <KeyValueTable
        rows={headers}
        onChange={setHeaders}
        keyPlaceholder="header name"
        valuePlaceholder="value"
        addLabel="Add Header"
        autoGuessType={false}
        sensitiveByDefault={SENSITIVE_HEADER_KEYS}
        extraActions={authDropdown}
      />
    </div>
  );
}
