"use client";

import { SavedRequest, Folder } from "@/types/request";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronDown, Folder as FolderIcon } from "lucide-react";
import { getAllRequestIdsInFolder } from "@/lib/docs-builder";

const methodColors: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-blue-400",
  PUT: "text-amber-400",
  PATCH: "text-violet-400",
  DELETE: "text-red-400",
};

interface SelectionTreeProps {
  requests: SavedRequest[];
  folders: Folder[];
  selectedIds: Set<string>;
  onToggleRequest: (id: string) => void;
  onToggleFolder: (folderId: string) => void;
  getFolderState: (
    folderId: string
  ) => "checked" | "indeterminate" | "unchecked";
}

export function SelectionTree({
  requests,
  folders,
  selectedIds,
  onToggleRequest,
  onToggleFolder,
  getFolderState,
}: SelectionTreeProps) {
  // Build tree structure
  const topLevelFolders = folders.filter((f) => !f.parentId);
  const ungroupedRequests = requests.filter((r) => !r.parentId);

  function renderFolder(folder: Folder, depth: number) {
    const state = getFolderState(folder.id);
    const childFolders = folders.filter((f) => f.parentId === folder.id);
    const childRequests = requests.filter((r) => r.parentId === folder.id);
    const totalInFolder = getAllRequestIdsInFolder(
      folder.id,
      requests,
      folders
    ).length;

    return (
      <div key={folder.id}>
        <div
          className="flex items-center gap-2 px-4 py-1.5 hover:bg-raised/50 cursor-pointer"
          style={{ paddingLeft: `${depth * 20 + 16}px` }}
          onClick={() => onToggleFolder(folder.id)}
        >
          <Checkbox
            checked={state === "checked"}
            className={cn(state === "indeterminate" && "opacity-60")}
            data-state={
              state === "indeterminate" ? "indeterminate" : undefined
            }
            onCheckedChange={() => onToggleFolder(folder.id)}
            onClick={(e) => e.stopPropagation()}
          />
          <ChevronDown size={12} className="text-foreground-subtle" />
          <FolderIcon size={14} className="text-foreground-muted shrink-0" />
          <span className="text-sm text-foreground truncate">
            {folder.name}
          </span>
          <span className="text-xs text-foreground-subtle ml-1">
            ({totalInFolder} request{totalInFolder !== 1 ? "s" : ""})
          </span>
        </div>
        {childFolders.map((cf) => renderFolder(cf, depth + 1))}
        {childRequests.map((cr) => renderRequest(cr, depth + 1))}
      </div>
    );
  }

  function renderRequest(request: SavedRequest, depth: number) {
    return (
      <div
        key={request.id}
        className="flex items-center gap-2 px-4 py-1.5 hover:bg-raised/50 cursor-pointer"
        style={{ paddingLeft: `${depth * 20 + 40}px` }}
        onClick={() => onToggleRequest(request.id)}
      >
        <Checkbox
          checked={selectedIds.has(request.id)}
          onCheckedChange={() => onToggleRequest(request.id)}
          onClick={(e) => e.stopPropagation()}
        />
        <span
          className={cn(
            "text-[10px] font-mono font-bold px-1.5 py-0.5 shrink-0 rounded",
            methodColors[request.method] ?? "text-foreground-muted"
          )}
        >
          {request.method}
        </span>
        <span className="text-sm text-foreground truncate">
          {request.name || "Untitled"}
        </span>
        {request.description && (
          <span className="text-xs text-foreground-subtle truncate max-w-[300px]">
            — {request.description}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {topLevelFolders.map((f) => renderFolder(f, 0))}
      {ungroupedRequests.length > 0 && (
        <div>
          {topLevelFolders.length > 0 && (
            <div className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-foreground-subtle">
              Ungrouped
            </div>
          )}
          {ungroupedRequests.map((r) => renderRequest(r, 0))}
        </div>
      )}
    </div>
  );
}
