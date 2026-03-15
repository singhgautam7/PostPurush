"use client";

import { RequestBuilder } from "@/components/request-builder/request-builder";
import { ResponsePanel } from "@/components/response/response-panel";
import { RequestTabsContainer } from "@/components/tabs/request-tabs-container";
import { useTabStore } from "@/store/tab-store";
import { EmptyState } from "@/components/workspace/empty-state";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { GripHorizontal } from "lucide-react";

export function Workspace() {
  const tabs = useTabStore((s) => s.tabs);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <RequestTabsContainer />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        {tabs.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <EmptyState />
          </div>
        ) : (
          <PanelGroup orientation="vertical">
            {/* Request Builder */}
            <Panel defaultSize={45} minSize={20}>
              <div className="h-full overflow-y-auto">
                <RequestBuilder />
              </div>
            </Panel>

            <PanelResizeHandle className="h-[6px] bg-border hover:bg-primary-action/50 data-[separator=active]:bg-primary-action transition-colors cursor-row-resize flex items-center justify-center group">
              <GripHorizontal size={12} className="text-foreground-subtle group-hover:text-foreground-muted group-data-[separator=active]:text-primary-action-fg" />
            </PanelResizeHandle>

            {/* Response Panel — no inner card border */}
            <Panel defaultSize={55} minSize={20}>
              <div className="h-full overflow-hidden">
                <ResponsePanel />
              </div>
            </Panel>
          </PanelGroup>
        )}
      </div>
    </div>
  );
}
