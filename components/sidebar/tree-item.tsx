"use client";

import { useState } from "react";
import { Folder, SavedRequest } from "@/types/request";
import { useRequestStore } from "@/store/request-store";
import { useTabStore } from "@/store/tab-store";
import {
  cacheCurrentResponse,
  restoreResponseFromCache,
} from "@/store/response-store";
import { deleteRequest, deleteFolder, saveFolder, saveRequest } from "@/lib/storage/storage-helpers";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronRight, ChevronDown, Folder as FolderIcon, FolderOpen, Trash2, Edit2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarItemActions } from "./sidebar-item-actions";
import { Input } from "@/components/ui/input";
import { useDraggable, useDroppable } from "@dnd-kit/core";

const methodColors: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-blue-400",
  PUT: "text-amber-400",
  PATCH: "text-violet-400",
  DELETE: "text-red-400",
};

interface TreeItemProps {
  item: { id: string; name: string; type: "folder" | "request"; request?: SavedRequest; folder?: Folder; parentId?: string };
  depth: number;
  isOpen?: boolean;
  onToggle?: () => void;
  onNewFolder?: (parentId: string) => void;
  onNewRequest?: (parentId: string) => void;
}

export function TreeItem({ item, depth, isOpen, onToggle, onNewFolder, onNewRequest }: TreeItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateSavedRequest = useRequestStore((s) => s.updateSavedRequest);
  const removeSavedRequest = useRequestStore((s) => s.removeSavedRequest);
  const updateDBFolder = useRequestStore((s) => s.updateFolder);
  const removeDBFolder = useRequestStore((s) => s.removeFolder);
  const activeRequest = useRequestStore((s) => s.activeRequest);
  const savedRequests = useRequestStore((s) => s.savedRequests);
  const folders = useRequestStore((s) => s.folders);
  const openTab = useTabStore((s) => s.openTab);
  const tabs = useTabStore((s) => s.tabs);
  const closeTab = useTabStore((s) => s.closeTab);
  const resetRequest = useRequestStore((s) => s.resetRequest);

  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: item.id,
    data: { type: item.type }
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: item.id,
    disabled: item.type !== "folder",
  });

  const setNodeRef = (element: HTMLElement | null) => {
    setDraggableRef(element);
    if (item.type === "folder") setDroppableRef(element);
  };

  const isActive = item.type === "request" && activeRequest.id === item.id;

  const loadRequest = useRequestStore((s) => s.loadRequest);

  const handleOpen = () => {
    if (item.type === "request" && item.request) {
      cacheCurrentResponse(activeRequest.id);
      openTab(item.request.id, item.request.name);
      loadRequest(item.request);
      restoreResponseFromCache(item.request.id);
    } else if (item.type === "folder" && onToggle) {
      onToggle();
    }
  };

  const handleDelete = async () => {
    if (item.type === "request") {
      // Delete from DB and store
      await deleteRequest(item.id);
      removeSavedRequest(item.id);
      // Close any open tab for this request
      const tab = tabs.find((t) => t.requestId === item.id);
      if (tab) {
        closeTab(tab.id);
        if (activeRequest.id === item.id) resetRequest();
      }
    } else {
      // Cascade: collect all descendant folder IDs and request IDs
      const folderIdsToDelete = new Set<string>();
      const requestIdsToDelete = new Set<string>();

      const collectDescendants = (parentId: string) => {
        folderIdsToDelete.add(parentId);
        // Find child folders
        for (const f of folders) {
          if (f.parentId === parentId && !folderIdsToDelete.has(f.id)) {
            collectDescendants(f.id);
          }
        }
        // Find child requests
        for (const r of savedRequests) {
          if (r.parentId === parentId) {
            requestIdsToDelete.add(r.id);
          }
        }
      };

      collectDescendants(item.id);

      // Delete all from IndexedDB
      for (const reqId of requestIdsToDelete) {
        await deleteRequest(reqId);
      }
      for (const folderId of folderIdsToDelete) {
        await deleteFolder(folderId);
      }

      // Remove from store
      for (const reqId of requestIdsToDelete) {
        removeSavedRequest(reqId);
      }
      for (const folderId of folderIdsToDelete) {
        removeDBFolder(folderId);
      }

      // Close tabs for deleted requests
      for (const reqId of requestIdsToDelete) {
        const tab = tabs.find((t) => t.requestId === reqId);
        if (tab) {
          closeTab(tab.id);
        }
      }

      // Reset active request if it was inside the deleted folder
      if (requestIdsToDelete.has(activeRequest.id)) {
        resetRequest();
      }
    }
  };

  const handleRename = async () => {
    if (!editName.trim()) {
      setIsEditing(false);
      setEditName(item.name);
      return;
    }
    if (item.type === "request" && item.request) {
      const updated = { ...item.request, name: editName.trim(), updatedAt: Date.now() };
      await saveRequest(updated);
      updateSavedRequest(updated);
    } else if (item.type === "folder" && item.folder) {
      const updated = { ...item.folder, name: editName.trim(), updatedAt: Date.now() };
      await saveFolder(updated);
      updateDBFolder(updated);
    }
    setIsEditing(false);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          {...(isEditing ? {} : { ...attributes, ...listeners })}
          onClick={handleOpen}
          style={{ paddingLeft: `${depth * 10 + 6}px` }}
          className={cn(
            "group flex items-center h-6 cursor-pointer hover:bg-panel/50 rounded-sm text-xs transition-colors pe-1 select-none",
            isActive && "bg-raised text-foreground hover:bg-raised",
            isDragging && "opacity-50",
            isOver && "bg-raised/60 ring-1 ring-inset ring-border-subtle"
          )}
        >
          {/* Caret for folders */}
          <div className="w-4 flex items-center justify-center shrink-0">
            {item.type === "folder" && (
              <span className="text-foreground-subtle">
                {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </span>
            )}
          </div>

          {/* Icon */}
          <div className="w-5 flex items-center justify-center shrink-0 me-1">
            {item.type === "folder" ? (
              isOpen
                ? <FolderOpen className="h-4 w-4 text-foreground-muted" />
                : <FolderIcon className="h-4 w-4 text-foreground-muted" />
            ) : (
              <span className={cn("text-[8px] font-mono font-bold", item.request ? methodColors[item.request.method] : "")}>
                {item.request?.method.substring(0, 3)}
              </span>
            )}
          </div>

          {/* Name */}
          <div className="flex-1 truncate text-foreground-nav group-hover:text-foreground transition-colors overflow-hidden">
            {isEditing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") { setIsEditing(false); setEditName(item.name); }
                }}
                autoFocus
                className="h-6 text-xs px-1.5 py-0 bg-panel border-border-subtle"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={cn("truncate block", isActive && "text-foreground font-medium")}>{item.name}</span>
            )}
          </div>

          {!isEditing && (
            <div className="shrink-0 flex items-center pr-1 transition-opacity">
              <SidebarItemActions
                type={item.type}
                onRename={() => { setEditName(item.name); setIsEditing(true); }}
                onDelete={handleDelete}
                onNewFolder={item.type === "folder" ? () => onNewFolder?.(item.id) : undefined}
                onNewRequest={item.type === "folder" ? () => onNewRequest?.(item.id) : undefined}
              />
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48 text-xs">
        {item.type === "folder" && (
          <>
            <ContextMenuItem onClick={() => onNewRequest?.(item.id)}>
              <Plus className="h-3.5 w-3.5 mr-2" /> New Request
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onNewFolder?.(item.id)}>
              <FolderIcon className="h-3.5 w-3.5 mr-2" /> New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={() => setIsEditing(true)}>
          <Edit2 className="h-3.5 w-3.5 mr-2" /> Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {item.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {item.type === "folder"
                ? "This folder and all its contents will be permanently deleted."
                : "This request will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContextMenu>
  );
}
