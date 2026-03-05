"use client";

import { RequestBuilder } from "@/components/request-builder/request-builder";
import { ResponsePanel } from "@/components/response/response-panel";
import { RequestTabsContainer } from "@/components/tabs/request-tabs-container";
import { Separator } from "@/components/ui/separator";
import { useTabStore } from "@/store/tab-store";
import { EmptyState } from "@/components/workspace/empty-state";

export function Workspace() {
  const tabs = useTabStore((s) => s.tabs);

  return (
    <div className="flex flex-col h-full bg-background rounded-tl-xl border-l border-t border-border/50 shadow-sm overflow-hidden">
      <RequestTabsContainer />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        {tabs.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/5">
            <EmptyState />
          </div>
        ) : (
          <>
            {/* Request Builder */}
            <div className="shrink-0">
              <RequestBuilder />
            </div>

            <Separator className="opacity-30" />

            {/* Response Panel */}
            <div className="flex-1 overflow-y-auto min-h-[200px] p-4 pt-2">
              <div className="h-full rounded-xl border border-border/50 overflow-hidden shadow-sm bg-background">
                <ResponsePanel />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
