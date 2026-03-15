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
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { AlertTriangle, GripVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";

export function CollectionsView() {
  const openTab = useTabStore((s) => s.openTab);
  const savedRequests = useRequestStore((s) => s.savedRequests);
  const loadRequest = useRequestStore((s) => s.loadRequest);
  const activeRequest = useRequestStore((s) => s.activeRequest);
  const [missingRequestWarning, setMissingRequestWarning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const toggleHandler = () => setSidebarOpen((v) => !v);
    window.addEventListener("postpurush:toggle-sidebar", toggleHandler);
    return () => window.removeEventListener("postpurush:toggle-sidebar", toggleHandler);
  }, []);

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
      setSidebarOpen(false);
    };
    window.addEventListener("postpurush:open-request", handler);
    return () => window.removeEventListener("postpurush:open-request", handler);
  }, [savedRequests, openTab, loadRequest, activeRequest.id]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
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

      {/* Mobile sidebar sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[80vw] max-w-[320px] p-0 overflow-y-auto" showCloseButton={false}>
            <VisuallyHidden><SheetTitle>Collections</SheetTitle></VisuallyHidden>
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop: PanelGroup layout */}
      {!isMobile && (
        <div className="flex flex-1 overflow-hidden">
          <PanelGroup orientation="horizontal">
            <Panel
              defaultSize={210}
              minSize={140}
              maxSize="50vw"
              className="bg-background overflow-hidden"
            >
              <Sidebar />
            </Panel>
            <PanelResizeHandle className="w-[6px] bg-border hover:bg-primary-action/50 data-[separator=active]:bg-primary-action transition-colors cursor-col-resize flex items-center justify-center group">
              <GripVertical size={12} className="text-foreground-subtle group-hover:text-foreground-muted group-data-[separator=active]:text-primary-action-fg" />
            </PanelResizeHandle>
            <Panel minSize={300} className="bg-background relative">
              <Workspace />
            </Panel>
          </PanelGroup>
        </div>
      )}

      {/* Mobile: workspace takes full width */}
      {isMobile && (
        <div className="flex-1 overflow-hidden">
          <Workspace />
        </div>
      )}
    </div>
  );
}
