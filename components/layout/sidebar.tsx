"use client";

import { useEffect } from "react";
import { useRequestStore } from "@/store/request-store";
import { useEnvironmentStore } from "@/store/environment-store";
import { loadRequests, loadFolders } from "@/lib/storage/storage-helpers";
import { TreeView } from "@/components/sidebar/tree-view";
import { EnvSelector } from "@/components/collections/env-selector";
import { CollapsibleSection } from "@/components/collections/collapsible-section";
import { ExtrasPanel } from "@/components/collections/extras-panel";
import { SidebarContextMenu } from "@/components/sidebar/sidebar-context-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, FolderPlus } from "lucide-react";

export function Sidebar() {
  const setSavedRequests = useRequestStore((s) => s.setSavedRequests);
  const setFolders = useRequestStore((s) => s.setFolders);
  const initEnv = useEnvironmentStore((s) => s.init);

  useEffect(() => {
    const init = async () => {
      const folders = await loadFolders();
      setFolders(folders);
      const requests = await loadRequests();
      setSavedRequests(requests);
      await initEnv();
    };
    init();
  }, [setSavedRequests, setFolders, initEnv]);

  const handleNewRequest = () => {
    window.dispatchEvent(new CustomEvent("trigger-new-request", { detail: "root" }));
  };

  const handleNewFolder = () => {
    window.dispatchEvent(new CustomEvent("trigger-new-folder", { detail: "root" }));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Environment selector */}
      <EnvSelector />

      {/* Requests header */}
      <div className="px-3 py-2 flex items-center gap-1.5">
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
          Requests
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleNewRequest}
              className="p-1 rounded text-foreground-subtle hover:text-foreground hover:bg-raised transition-colors cursor-pointer"
            >
              <Plus size={13} />
            </button>
          </TooltipTrigger>
          <TooltipContent>New Request</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleNewFolder}
              className="p-1 rounded text-foreground-subtle hover:text-foreground hover:bg-raised transition-colors cursor-pointer"
            >
              <FolderPlus size={13} />
            </button>
          </TooltipTrigger>
          <TooltipContent>New Folder</TooltipContent>
        </Tooltip>
      </div>

      {/* Tree view — scrollable */}
      <SidebarContextMenu>
        <div className="flex-1 overflow-y-auto min-h-0">
          <TreeView />
        </div>
      </SidebarContextMenu>

      {/* Extras — pinned to bottom */}
      <div className="flex-shrink-0 border-t border-border">
        <CollapsibleSection
          title="Extras"
          defaultOpen={false}
          storageKey="postpurush-extras-section-open"
        >
          <ExtrasPanel />
        </CollapsibleSection>
      </div>
    </div>
  );
}
