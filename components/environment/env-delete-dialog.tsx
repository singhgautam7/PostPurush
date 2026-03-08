"use client";

import { useEnvironmentStore } from "@/store/environment-store";
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

interface EnvDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  envId: string;
  envName: string;
}

export function EnvDeleteDialog({
  open,
  onOpenChange,
  envId,
  envName,
}: EnvDeleteDialogProps) {
  const deleteEnvironment = useEnvironmentStore((s) => s.deleteEnvironment);

  const handleDelete = async () => {
    await deleteEnvironment(envId);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border/50">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {envName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This environment will be permanently deleted. Any requests using{" "}
            <code className="bg-raised px-1 py-0.5 rounded text-xs">{"{{variables}}"}</code>{" "}
            from this environment will display their variable references unresolved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
