"use client";

import { useEffect, useState } from "react";
import { useRequestStore } from "@/store/request-store";
import { useEnvironmentStore } from "@/store/environment-store";
import { useResponseStore } from "@/store/response-store";
import { loadRequests, loadEnvironment } from "@/lib/storage/storage-helpers";
import { RequestList } from "@/components/request-list/request-list";
import { EnvironmentManager } from "@/components/environment/environment-manager";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Plus, Settings, Zap } from "lucide-react";

export function Sidebar() {
  const resetRequest = useRequestStore((s) => s.resetRequest);
  const setSavedRequests = useRequestStore((s) => s.setSavedRequests);
  const setVariables = useEnvironmentStore((s) => s.setVariables);
  const clearResponse = useResponseStore((s) => s.clearResponse);
  const activeRequest = useRequestStore((s) => s.activeRequest);
  const setName = useRequestStore((s) => s.setName);
  const [envOpen, setEnvOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const requests = await loadRequests();
      setSavedRequests(requests);
      const vars = await loadEnvironment();
      setVariables(vars);
    };
    init();
  }, [setSavedRequests, setVariables]);

  const handleNewRequest = () => {
    resetRequest();
    clearResponse();
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

          {/* Request Name */}
          <Input
            value={activeRequest.name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Request name"
            className="h-8 mb-3 bg-muted/30 border-border/30 text-sm"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleNewRequest}
              className="flex-1 h-8 gap-1.5 text-xs bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-sm shadow-indigo-500/20"
            >
              <Plus className="h-3.5 w-3.5" />
              New Request
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setEnvOpen(true)}
              className="h-8 w-8 border-border/50"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Saved Requests */}
        <div className="flex-1 overflow-hidden py-2">
          <div className="px-4 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Saved Requests
            </p>
          </div>
          <RequestList />
        </div>
      </div>

      <EnvironmentManager open={envOpen} onOpenChange={setEnvOpen} />
    </>
  );
}
