"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Workspace } from "@/components/layout/workspace";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { useTabStore } from "@/store/tab-store";
import { useRequestStore } from "@/store/request-store";
import {
  cacheCurrentResponse,
  restoreResponseFromCache,
} from "@/store/response-store";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

export function CollectionsView() {
  const openTab = useTabStore((s) => s.openTab);
  const savedRequests = useRequestStore((s) => s.savedRequests);
  const loadRequest = useRequestStore((s) => s.loadRequest);
  const activeRequest = useRequestStore((s) => s.activeRequest);
  const [missingRequestWarning, setMissingRequestWarning] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const { requestId } = (e as CustomEvent).detail;
      const request = savedRequests.find((r) => r.id === requestId);
      if (!request) {
        setMissingRequestWarning(true);
        return;
      }
      cacheCurrentResponse(activeRequest.id);
      openTab(requestId, request.name);
      loadRequest(request);
      restoreResponseFromCache(requestId);
    };
    window.addEventListener("postpurush:open-request", handler);
    return () => window.removeEventListener("postpurush:open-request", handler);
  }, [savedRequests, openTab, loadRequest, activeRequest.id]);

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <AlertDialog open={missingRequestWarning} onOpenChange={setMissingRequestWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              Request not found
            </AlertDialogTitle>
            <AlertDialogDescription>
              This request may have been moved to a different folder, or deleted.
              You can still find it manually in your collections, or view its details in Analytics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setMissingRequestWarning(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
