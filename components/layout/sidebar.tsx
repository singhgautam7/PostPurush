"use client";

import { useEffect, useState } from "react";
import { useRequestStore } from "@/store/request-store";
import { useEnvironmentStore } from "@/store/environment-store";
import { useResponseStore } from "@/store/response-store";
import { loadRequests, loadEnvironment, loadFolders } from "@/lib/storage/storage-helpers";
import { TreeView } from "@/components/sidebar/tree-view";
import { EnvironmentManager } from "@/components/environment/environment-manager";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarContextMenu } from "@/components/sidebar/sidebar-context-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Settings, Zap } from "lucide-react";

export function Sidebar() {
  const setSavedRequests = useRequestStore((s) => s.setSavedRequests);
  const setFolders = useRequestStore((s) => s.setFolders);
  const setVariables = useEnvironmentStore((s) => s.setVariables);
  const activeRequest = useRequestStore((s) => s.activeRequest);
  const setName = useRequestStore((s) => s.setName);
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
      <div className="flex flex-col h-full bg-card/50">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-base font-bold tracking-tight">PostPurush</h1>
          </div>

          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleNewRequest}
                  className="flex-1 h-8 gap-1.5 text-xs bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-sm shadow-indigo-500/20"
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
                  className="h-8 w-8 border-border/50"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Manage Environments</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator className="opacity-50" />

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
