"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Workspace } from "@/components/layout/workspace";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";

export function CollectionsView() {
  return (
    <div className="flex h-full overflow-hidden bg-zinc-950">
      <PanelGroup orientation="horizontal">
        {/* Collections Sidebar */}
        <Panel
          defaultSize={210}
          minSize={140}
          maxSize="50vw"
          className="bg-zinc-950 overflow-hidden"
        >
          <Sidebar />
        </Panel>

        <PanelResizeHandle className="w-[3px] bg-zinc-800 hover:bg-zinc-600 transition-colors cursor-col-resize" />

        {/* Main Workspace */}
        <Panel minSize={300} className="bg-zinc-950 relative">
          <Workspace />
        </Panel>
      </PanelGroup>
    </div>
  );
}
