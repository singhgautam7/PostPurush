"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FolderPlus, Plus, FoldVertical, UnfoldVertical } from "lucide-react";

interface SidebarContextMenuProps {
  children: React.ReactNode;
}

export function SidebarContextMenu({ children }: SidebarContextMenuProps) {
  const handleNewRequest = () => {
    window.dispatchEvent(new CustomEvent("trigger-new-request", { detail: "root" }));
  };

  const handleNewFolder = () => {
    window.dispatchEvent(new CustomEvent("trigger-new-folder", { detail: "root" }));
  };

  const handleCollapseAll = () => {
    window.dispatchEvent(new CustomEvent("trigger-collapse-all"));
  };

  const handleExpandAll = () => {
    window.dispatchEvent(new CustomEvent("trigger-expand-all"));
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="h-full w-full">{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 text-xs">
        <ContextMenuItem onClick={handleNewRequest}>
          <Plus className="mr-2 h-3.5 w-3.5" />
          New Request
        </ContextMenuItem>
        <ContextMenuItem onClick={handleNewFolder}>
          <FolderPlus className="mr-2 h-3.5 w-3.5" />
          New Folder
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleExpandAll}>
          <UnfoldVertical className="mr-2 h-3.5 w-3.5" />
          Expand All
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCollapseAll}>
          <FoldVertical className="mr-2 h-3.5 w-3.5" />
          Collapse All
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
