"use client";

import { useState, useEffect } from "react";
import { useEnvironmentStore } from "@/store/environment-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface EnvCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, dialog is in "rename" mode */
  renameId?: string;
  initialName?: string;
}

export function EnvCreateDialog({
  open,
  onOpenChange,
  renameId,
  initialName = "",
}: EnvCreateDialogProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const environments = useEnvironmentStore((s) => s.environments);
  const createEnvironment = useEnvironmentStore((s) => s.createEnvironment);
  const updateEnvironment = useEnvironmentStore((s) => s.updateEnvironment);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription("");
      setError("");
    }
  }, [open, initialName]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    const isDuplicate = environments.some(
      (e) =>
        e.name.toLowerCase() === trimmed.toLowerCase() &&
        e.id !== renameId
    );
    if (isDuplicate) {
      setError("An environment with this name already exists");
      return;
    }

    if (renameId) {
      await updateEnvironment(renameId, { name: trimmed });
    } else {
      await createEnvironment(trimmed, description.trim() || undefined);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle>{renameId ? "Rename Environment" : "New Environment"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-foreground-muted">Name *</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="e.g. Production"
              autoFocus
              className="bg-muted/30 border-border/30"
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
          {!renameId && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-foreground-muted">
                Description <span className="text-foreground-subtle">(optional)</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this environment for?"
                rows={2}
                className="resize-none text-sm bg-muted/30 border-border/30"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            className="bg-primary-action text-primary-action-fg hover:bg-primary-action/85"
          >
            {renameId ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
