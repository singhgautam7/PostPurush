"use client";

import { useTabStore } from "@/store/tab-store";
import { useRequestStore } from "@/store/request-store";
import {
  useResponseStore,
  cacheCurrentResponse,
  restoreResponseFromCache,
  removeResponseFromCache,
} from "@/store/response-store";
import { loadRequests } from "@/lib/storage/storage-helpers";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTab } from "./sortable-tab";
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
  const hydrate = useTabStore((s) => s.hydrate);
  const openTab = useTabStore((s) => s.openTab);
  const closeTab = useTabStore((s) => s.closeTab);
  const setActiveTab = useTabStore((s) => s.setActiveTab);

  const loadRequest = useRequestStore((s) => s.loadRequest);
  const resetRequest = useRequestStore((s) => s.resetRequest);
  const clearResponse = useResponseStore((s) => s.clearResponse);

  const [tabToClose, setTabToClose] = useState<string | null>(null);

  // Restore persisted tabs from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    hydrate();
    // After hydration, load the active tab's request
    const { tabs: restoredTabs, activeTabId: restoredActiveId } = useTabStore.getState();
    if (restoredActiveId) {
      const activeTab = restoredTabs.find((t) => t.id === restoredActiveId);
      if (activeTab && !activeTab.requestId.startsWith("new-")) {
        loadRequests().then((allRequests) => {
          const req = allRequests.find((r) => r.id === activeTab.requestId);
          if (req) loadRequest(req);
        });
      }
    }
  }, [hydrate, loadRequest]);

  const performClose = (id: string) => {
    const closingTab = tabs.find((t) => t.id === id);
    if (closingTab) removeResponseFromCache(closingTab.requestId);
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
    if (tabToClose) {
      if (activeTabId !== tabToClose) {
        const tab = tabs.find(t => t.id === tabToClose);
        if (tab) handleTabClick(tab.id, tab.requestId);
      }
      setTimeout(() => {
        document.getElementById("save-btn-trigger")?.click();
        performClose(tabToClose);
      }, 50);
    }
  };

  const handleTabClick = async (tabId: string, requestId: string) => {
    // Cache the response for the tab we're leaving
    const currentTab = tabs.find((t) => t.id === activeTabId);
    if (currentTab) cacheCurrentResponse(currentTab.requestId);

    setActiveTab(tabId);
    if (requestId.startsWith("new-")) {
      resetRequest();
    } else {
      const allRequests = await loadRequests();
      const req = allRequests.find(r => r.id === requestId);
      if (req) loadRequest(req);
    }
    // Restore cached response for the tab we're switching to, or clear
    restoreResponseFromCache(requestId);
  };

  const handleNewTab = () => {
    const newId = `new-${crypto.randomUUID()}`;
    openTab(newId, "Untitled Request");
    handleTabClick(useTabStore.getState().activeTabId!, newId);
  };

  const reorderTabs = useTabStore((s) => s.reorderTabs);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTabs(active.id as string, over.id as string);
    }
  };

  if (tabs.length === 0) {
    return (
      <div className="flex h-9 items-center justify-between border-b border-border bg-background px-2 leading-none">
        <div className="text-xs text-foreground-subtle px-2">No open tabs</div>
        <button
          onClick={handleNewTab}
          className="p-1.5 text-foreground-subtle hover:text-foreground-muted hover:bg-panel rounded-md transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-9 items-center border-b border-border bg-background pl-2 leading-none">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full flex-1 overflow-x-auto no-scrollbar items-end">
          <SortableContext
            items={tabs.map((t) => t.id)}
            strategy={horizontalListSortingStrategy}
          >
            {tabs.map((tab) => (
              <SortableTab
                key={tab.id}
                id={tab.id}
                requestId={tab.requestId}
                title={tab.title}
                isActive={tab.id === activeTabId}
                isDirty={tab.isDirty}
                onClick={() => handleTabClick(tab.id, tab.requestId)}
                onClose={(e) => {
                  e.stopPropagation();
                  handleTabCloseClick(tab.id, !!tab.isDirty);
                }}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
      <div className="flex h-full items-center px-2 z-10 bg-background">
        <button
          onClick={handleNewTab}
          className="p-1.5 text-foreground-subtle hover:text-foreground-muted hover:bg-panel rounded-md transition-colors"
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
              <Button onClick={handleSaveAndClose} className="bg-primary-action text-primary-action-fg hover:bg-primary-action/85">
                Save
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
