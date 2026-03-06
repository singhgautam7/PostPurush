"use client";

import { RequestBuilder } from "@/components/request-builder/request-builder";
import { ResponsePanel } from "@/components/response/response-panel";
import { RequestTabsContainer } from "@/components/tabs/request-tabs-container";
import { Separator } from "@/components/ui/separator";
import { useTabStore } from "@/store/tab-store";
import { EmptyState } from "@/components/workspace/empty-state";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";

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
          <PanelGroup orientation="vertical">
            {/* Request Builder */}
            <Panel defaultSize={45} minSize={20}>
              <div className="h-full overflow-y-auto">
                <RequestBuilder />
              </div>
            </Panel>

            <PanelResizeHandle className="h-[4px] bg-border/50 hover:bg-indigo-500/50 transition-all cursor-row-resize" />

            {/* Response Panel */}
            <Panel defaultSize={55} minSize={20}>
              <div className="flex flex-col h-full p-4 pt-2">
                <div className="flex-1 rounded-xl border border-border/50 overflow-hidden shadow-sm bg-background">
                  <ResponsePanel />
                </div>
              </div>
            </Panel>
          </PanelGroup>
          </>
        )}
      </div>
    </div>
  );
}
