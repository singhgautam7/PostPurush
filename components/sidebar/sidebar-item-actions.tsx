"use client";

import { MoreHorizontal, Edit2, Trash2, FolderPlus, PlusSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarItemActionsProps {
  type: "folder" | "request";
  onRename: () => void;
  onDelete: () => void;
  onNewFolder?: () => void;
  onNewRequest?: () => void;
}

export function SidebarItemActions({
  type,
  onRename,
  onDelete,
  onNewFolder,
  onNewRequest,
}: SidebarItemActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted focus-visible:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 text-sm">
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
          <Edit2 className="mr-2 h-4 w-4 text-muted-foreground" />
          Rename
        </DropdownMenuItem>

        {type === "folder" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onNewRequest?.(); }}>
              <PlusSquare className="mr-2 h-4 w-4 text-indigo-400" />
              New Request
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onNewFolder?.(); }}>
              <FolderPlus className="mr-2 h-4 w-4 text-emerald-400" />
              New Folder
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
