"use client";

import { useTabStore } from "@/store/tab-store";
import { useRequestStore } from "@/store/request-store";
import { useResponseStore } from "@/store/response-store";
import { loadRequests } from "@/lib/storage/storage-helpers";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function RequestTabsContainer() {
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const openTab = useTabStore((s) => s.openTab);
  const closeTab = useTabStore((s) => s.closeTab);
  const setActiveTab = useTabStore((s) => s.setActiveTab);

  const loadRequest = useRequestStore((s) => s.loadRequest);
  const resetRequest = useRequestStore((s) => s.resetRequest);
  const clearResponse = useResponseStore((s) => s.clearResponse);

  const [tabToClose, setTabToClose] = useState<string | null>(null);

  const performClose = (id: string) => {
    closeTab(id);
    setTabToClose(null);
    const active = useTabStore.getState().activeTabId;
    if (active) {
      const activeTab = useTabStore.getState().tabs.find(t => t.id === active);
      if (activeTab) handleTabClick(active, activeTab.requestId);
    } else {
      resetRequest();
      clearResponse();
    }
  };

  const handleTabCloseClick = (id: string, isDirty: boolean) => {
    if (isDirty) {
      setTabToClose(id);
    } else {
      performClose(id);
    }
  };

  const handleDiscardAndClose = () => {
    if (tabToClose) performClose(tabToClose);
  };

  const handleSaveAndClose = () => {
    // If the tab is currently active, we can just trigger the main save logic.
    // If it's a background tab, it's safer to switch to it first so the states sync up.
    if (tabToClose) {
      if (activeTabId !== tabToClose) {
        const tab = tabs.find(t => t.id === tabToClose);
        if (tab) handleTabClick(tab.id, tab.requestId);
      }

      // We will trigger the save button click that resides in the URL bar
      // Give React a tick to sync state if we just switched tabs
      setTimeout(() => {
        document.getElementById("save-btn-trigger")?.click();
        performClose(tabToClose);
      }, 50);
    }
  };

  const handleTabClick = async (tabId: string, requestId: string) => {
    setActiveTab(tabId);

    // Load the request content
    if (requestId.startsWith("new-")) {
      resetRequest();
    } else {
      const allRequests = await loadRequests();
      const req = allRequests.find(r => r.id === requestId);
      if (req) {
        loadRequest(req);
      }
    }
    clearResponse();
  };

  const handleNewTab = () => {
    const newId = `new-${crypto.randomUUID()}`;
    openTab(newId, "Untitled Request");
    handleTabClick(useTabStore.getState().activeTabId!, newId);
  };

  if (tabs.length === 0) {
    return (
      <div className="flex h-10 items-center justify-between border-b border-border/50 bg-muted/20 px-2">
        <div className="text-xs text-muted-foreground/70 px-2">No open tabs</div>
        <button
          onClick={handleNewTab}
          className="p-1.5 text-muted-foreground hover:bg-muted/50 rounded-md transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-10 items-center border-b border-border/50 bg-muted/20 pl-2">
      <div className="flex h-full flex-1 overflow-x-auto no-scrollbar items-end">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.requestId)}
              className={cn(
                "group relative flex h-full min-w-[140px] max-w-[200px] shrink-0 cursor-pointer items-center justify-between gap-2 border-r border-border/50 px-3 transition-colors",
                isActive
                  ? "bg-background border-t-[3px] border-t-indigo-500 font-medium text-foreground"
                  : "bg-transparent border-t-[3px] border-t-transparent font-normal text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <span className={cn("truncate text-xs", tab.isDirty && "italic")}>
                  {tab.title}
                </span>
                {tab.isDirty && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabCloseClick(tab.id, !!tab.isDirty);
                }}
                className={cn(
                  "rounded-md p-1 opacity-0 group-hover:opacity-100 transition-all",
                  isActive ? "opacity-100 text-muted-foreground hover:bg-muted/50" : "text-muted-foreground/50 hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex h-full items-center px-2 z-10 bg-muted/20 shadow-[-4px_0_4px_-4px_rgba(0,0,0,0.1)]">
        <button
          onClick={handleNewTab}
          className="p-1.5 text-muted-foreground hover:bg-muted/50 rounded-md transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {tabToClose && (
        <AlertDialog open={!!tabToClose} onOpenChange={(open) => !open && setTabToClose(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
              <AlertDialogDescription>
                Do you want to save the changes you made to this request? Your changes will be lost if you don't save them.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTabToClose(null)}>Cancel</AlertDialogCancel>
              <Button variant="destructive" onClick={handleDiscardAndClose}>
                Don't Save
              </Button>
              <Button onClick={handleSaveAndClose} className="bg-indigo-500 hover:bg-indigo-600">
                Save
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
