"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Workspace } from "@/components/layout/workspace";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { useTabStore } from "@/store/tab-store";
import { useRequestStore } from "@/store/request-store";
import { useResponseStore } from "@/store/response-store";

export function CollectionsView() {
  const openTab = useTabStore((s) => s.openTab);
  const savedRequests = useRequestStore((s) => s.savedRequests);
  const loadRequest = useRequestStore((s) => s.loadRequest);
  const clearResponse = useResponseStore((s) => s.clearResponse);

  useEffect(() => {
    const handler = (e: Event) => {
      const { requestId } = (e as CustomEvent).detail;
      const request = savedRequests.find((r) => r.id === requestId);
      if (request) {
        openTab(requestId, request.name);
        loadRequest(request);
        clearResponse();
      }
    };
    window.addEventListener("postpurush:open-request", handler);
    return () => window.removeEventListener("postpurush:open-request", handler);
  }, [savedRequests, openTab, loadRequest, clearResponse]);

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <PanelGroup orientation="horizontal">
        {/* Collections Sidebar */}
        <Panel
          defaultSize={210}
          minSize={140}
          maxSize="50vw"
          className="bg-background overflow-hidden"
        >
          <Sidebar />
        </Panel>

        <PanelResizeHandle className="w-[3px] bg-border hover:bg-raised transition-colors cursor-col-resize" />

        {/* Main Workspace */}
        <Panel minSize={300} className="bg-background relative">
          <Workspace />
        </Panel>
      </PanelGroup>
    </div>
  );
}
