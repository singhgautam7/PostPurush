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
import { ColorPicker } from "./color-picker";
import { IconPicker } from "./icon-picker";
import { EnvIcon } from "./env-icon";
import { getEnvColor } from "@/lib/env-presets";
import { cn } from "@/lib/utils";

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
  const [icon, setIcon] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [error, setError] = useState("");
  const environments = useEnvironmentStore((s) => s.environments);
  const createEnvironment = useEnvironmentStore((s) => s.createEnvironment);
  const updateEnvironment = useEnvironmentStore((s) => s.updateEnvironment);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription("");
      setIcon(null);
      setColor(null);
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
      await createEnvironment(trimmed, description.trim() || undefined, icon, color);
    }
    onOpenChange(false);
  };

  const tokens = getEnvColor(color);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle>{renameId ? "Rename Environment" : "New Environment"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
            <>
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

              <div className="flex gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-foreground-muted">Color</label>
                  <ColorPicker value={color} onChange={setColor} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-foreground-muted">Icon</label>
                  <IconPicker value={icon} color={color} onChange={setIcon} />
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-2 p-3 bg-raised rounded-lg border border-border">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", tokens.bg)}>
                  <EnvIcon name={icon} className={tokens.text} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{name || "Environment Name"}</p>
                  <p className="text-xs text-foreground-subtle truncate max-w-[220px]">{description || "No description"}</p>
                </div>
              </div>
            </>
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
