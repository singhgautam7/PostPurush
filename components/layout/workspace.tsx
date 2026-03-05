"use client";

import { RequestBuilder } from "@/components/request-builder/request-builder";
import { ResponsePanel } from "@/components/response/response-panel";
import { Separator } from "@/components/ui/separator";

export function Workspace() {
  return (
    <div className="flex flex-col h-full">
      {/* Request Builder */}
      <div className="shrink-0">
        <RequestBuilder />
      </div>

      <Separator className="opacity-30" />

      {/* Response Panel */}
      <div className="flex-1 overflow-hidden min-h-[200px]">
        <ResponsePanel />
      </div>
    </div>
  );
}
