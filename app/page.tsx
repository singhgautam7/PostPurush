"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Workspace } from "@/components/layout/workspace";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <PanelGroup orientation="horizontal">
        {/* Sidebar */}
        <Panel
          defaultSize={210}
          minSize={140}
          maxSize="50vw"
          className="bg-card/50 overflow-hidden"
        >
          <Sidebar />
        </Panel>

        <PanelResizeHandle className="w-[4px] bg-border/50 hover:bg-indigo-500/50 transition-all cursor-col-resize" />

        {/* Main Workspace */}
        <Panel minSize={300} className="bg-background relative">
          <Workspace />
        </Panel>
      </PanelGroup>
    </div>
  );
}
