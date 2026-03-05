"use client";

import { useState } from "react";
import { Folder, SavedRequest } from "@/types/request";
import { useRequestStore } from "@/store/request-store";
import { useTabStore } from "@/store/tab-store";
import { useResponseStore } from "@/store/response-store";
import { deleteRequest, deleteFolder, saveFolder, saveRequest } from "@/lib/storage/storage-helpers";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ChevronRight, ChevronDown, Folder as FolderIcon, FolderOpen, FileCode, Trash2, Edit2, Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useDraggable, useDroppable } from "@dnd-kit/core";

const methodColors: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-amber-400",
  PUT: "text-blue-400",
  PATCH: "text-purple-400",
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

  const updateSavedRequest = useRequestStore((s) => s.updateSavedRequest);
  const removeSavedRequest = useRequestStore((s) => s.removeSavedRequest);
  const updateDBFolder = useRequestStore((s) => s.updateFolder);
  const removeDBFolder = useRequestStore((s) => s.removeFolder);
  const activeRequest = useRequestStore((s) => s.activeRequest);
  const openTab = useTabStore((s) => s.openTab);

  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: item.id,
    data: { type: item.type }
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: item.id,
    disabled: item.type !== "folder", // Only folders can be dropped into
  });

  const setNodeRef = (element: HTMLElement | null) => {
    setDraggableRef(element);
    if (item.type === "folder") {
      setDroppableRef(element);
    }
  };

  const isActive = item.type === "request" && activeRequest.id === item.id;

  const loadRequest = useRequestStore((s) => s.loadRequest);
  const clearResponse = useResponseStore((s) => s.clearResponse);

  const handleOpen = () => {
    if (item.type === "request" && item.request) {
      openTab(item.request.id, item.request.name);
      loadRequest(item.request);
      clearResponse();
    } else if (item.type === "folder" && onToggle) {
      onToggle();
    }
  };

  const handleDelete = async () => {
    if (item.type === "request") {
      await deleteRequest(item.id);
      removeSavedRequest(item.id);
    } else {
      await deleteFolder(item.id);
      removeDBFolder(item.id);
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
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={cn(
            "group flex items-center h-7 cursor-pointer hover:bg-muted/50 rounded-sm text-sm transition-colors pe-2 select-none",
            isActive && "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/15",
            isDragging && "opacity-50",
            isOver && "bg-indigo-500/20 ring-1 ring-inset ring-indigo-500/50"
          )}
        >
          {/* Caret for folders */}
          <div className="w-4 flex items-center justify-center shrink-0">
            {item.type === "folder" && (
              <span className="text-muted-foreground">
                {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </span>
            )}
          </div>

          {/* Icon */}
          <div className="w-5 flex items-center justify-center shrink-0 me-1">
            {item.type === "folder" ? (
              isOpen ? <FolderOpen className="h-4 w-4 text-indigo-400" /> : <FolderIcon className="h-4 w-4 text-indigo-400" />
            ) : (
              <span className={cn("text-[9px] font-mono font-bold", item.request ? methodColors[item.request.method] : "")}>
                {item.request?.method.substring(0, 3)}
              </span>
            )}
          </div>

          {/* Name */}
          <div className="flex-1 truncate text-muted-foreground group-hover:text-foreground transition-colors overflow-hidden">
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
                className="h-6 text-xs px-1.5 py-0 bg-background border-indigo-500"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={cn("truncate block", isActive && "text-indigo-400 font-medium")}>{item.name}</span>
            )}
          </div>
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
        <ContextMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
