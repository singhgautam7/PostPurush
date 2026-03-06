"use client";

import { useTabStore } from "@/store/tab-store";
import { useRequestStore } from "@/store/request-store";
import { useResponseStore } from "@/store/response-store";
import { loadRequests } from "@/lib/storage/storage-helpers";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

import { useState } from "react";
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

  const reorderTabs = useTabStore((s) => s.reorderTabs);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTabs(active.id as string, over.id as string);
    }
  };

  if (tabs.length === 0) {
    return (
      <div className="flex h-9 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-2 leading-none">
        <div className="text-xs text-muted-foreground/70 px-2">No open tabs</div>
        <button
          onClick={handleNewTab}
          className="p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900 rounded-md transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-9 items-center border-b border-zinc-800 bg-zinc-950 pl-2 leading-none">
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
      <div className="flex h-full items-center px-2 z-10 bg-zinc-950">
        <button
          onClick={handleNewTab}
          className="p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900 rounded-md transition-colors"
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
              <Button onClick={handleSaveAndClose} className="bg-white text-zinc-900 hover:bg-zinc-100">
                Save
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
