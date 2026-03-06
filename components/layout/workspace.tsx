"use client";

import { RequestBuilder } from "@/components/request-builder/request-builder";
import { ResponsePanel } from "@/components/response/response-panel";
import { RequestTabsContainer } from "@/components/tabs/request-tabs-container";
import { useTabStore } from "@/store/tab-store";
import { EmptyState } from "@/components/workspace/empty-state";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";

export function Workspace() {
  const tabs = useTabStore((s) => s.tabs);

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      <RequestTabsContainer />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        {tabs.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
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

            <PanelResizeHandle className="h-[3px] bg-zinc-800 hover:bg-zinc-600 transition-colors cursor-row-resize" />

            {/* Response Panel */}
            <Panel defaultSize={55} minSize={20}>
              <div className="flex flex-col h-full p-3 pt-2">
                <div className="flex-1 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950">
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
