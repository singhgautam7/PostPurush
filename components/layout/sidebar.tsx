"use client";

import { useEffect, useState } from "react";
import { useRequestStore } from "@/store/request-store";
import { useEnvironmentStore } from "@/store/environment-store";
import { loadRequests, loadEnvironment, loadFolders } from "@/lib/storage/storage-helpers";
import { TreeView } from "@/components/sidebar/tree-view";
import { EnvironmentManager } from "@/components/environment/environment-manager";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarContextMenu } from "@/components/sidebar/sidebar-context-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Settings } from "lucide-react";

export function Sidebar() {
  const setSavedRequests = useRequestStore((s) => s.setSavedRequests);
  const setFolders = useRequestStore((s) => s.setFolders);
  const setVariables = useEnvironmentStore((s) => s.setVariables);
  const [envOpen, setEnvOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const folders = await loadFolders();
      setFolders(folders);
      const requests = await loadRequests();
      setSavedRequests(requests);
      const vars = await loadEnvironment();
      setVariables(vars);
    };
    init();
  }, [setSavedRequests, setFolders, setVariables]);

  const handleNewRequest = () => {
    window.dispatchEvent(new CustomEvent("trigger-new-request", { detail: "root" }));
  };

  return (
    <>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="p-3 pb-2">
          <p className="text-[10px] font-medium tracking-widest text-foreground-subtle uppercase mb-2">Requests</p>

          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleNewRequest}
                  className="flex-1 h-7 gap-1.5 text-xs bg-primary-action text-primary-action-fg hover:bg-primary-action/85 font-medium"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Request
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a new request tab</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEnvOpen(true)}
                  className="h-8 w-8 border-border text-foreground-subtle hover:text-foreground hover:bg-panel"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Manage Environments</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator className="bg-border" />

        <SidebarContextMenu>
          <div className="flex-1 overflow-hidden py-2 h-full w-full">
            <TreeView />
          </div>
        </SidebarContextMenu>
      </div>

      <EnvironmentManager open={envOpen} onOpenChange={setEnvOpen} />
    </>
  );
}
