"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { clearAllResponseMetadata } from "@/lib/storage/storage-helpers";

interface ClearHistoryButtonProps {
  onCleared: () => void;
}

export function ClearHistoryButton({ onCleared }: ClearHistoryButtonProps) {
  const [open, setOpen] = useState(false);

  const handleClear = async () => {
    await clearAllResponseMetadata();
    setOpen(false);
    onCleared();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs gap-1.5 text-foreground-muted hover:text-red-400"
        onClick={() => setOpen(true)}
      >
        <Trash2 size={12} /> Clear History
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all analytics history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all recorded request history from this
              device. Your saved collections and environments will not be
              affected. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete All History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
