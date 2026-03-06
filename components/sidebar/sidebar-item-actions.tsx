"use client";

import { useState } from "react";
import { MoreHorizontal, Edit2, Trash2, FolderPlus, PlusSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
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
                <PlusSquare className="mr-2 h-4 w-4 text-zinc-300" />
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
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {type === "folder" ? "Delete Folder?" : "Delete Request?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {type === "folder"
                ? "This will delete the folder and all requests inside it. This action cannot be undone."
                : "This action cannot be undone. This will permanently delete the request."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
