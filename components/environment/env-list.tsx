"use client";

import { useState } from "react";
import { useEnvironmentStore } from "@/store/environment-store";
import { EnvCreateDialog } from "./env-create-dialog";
import { EnvDeleteDialog } from "./env-delete-dialog";
import { EnvEditSheet } from "./env-edit-sheet";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Copy, Trash2, Globe } from "lucide-react";

export function EnvList() {
  const environments = useEnvironmentStore((s) => s.environments);
  const activeEnvId = useEnvironmentStore((s) => s.activeEnvId);
  const setActiveEnvId = useEnvironmentStore((s) => s.setActiveEnvId);
  const duplicateEnvironment = useEnvironmentStore((s) => s.duplicateEnvironment);
  const initEnv = useEnvironmentStore((s) => s.init);

  const [createOpen, setCreateOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Ensure store is initialized
  useState(() => { initEnv(); });

  const renameEnv = renameId
    ? environments.find((e) => e.id === renameId)
    : null;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Environments</h2>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="h-7 gap-1 bg-primary-action text-primary-action-fg hover:bg-primary-action/85 text-xs"
        >
          <Plus className="h-3 w-3" />
          New Env
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {environments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <Globe size={24} className="text-foreground-subtle" />
            <div className="space-y-1">
              <p className="text-sm text-foreground-muted font-medium">No environments yet</p>
              <p className="text-xs text-foreground-subtle leading-relaxed max-w-[240px]">
                Create one to use variables in your requests
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="h-7 gap-1 bg-primary-action text-primary-action-fg hover:bg-primary-action/85 text-xs mt-1"
            >
              <Plus className="h-3 w-3" />
              Create Environment
            </Button>
          </div>
        )}

        {environments.map((env) => {
          const isActive = env.id === activeEnvId;
          return (
            <div
              key={env.id}
              className="group flex items-center gap-2 px-3 py-2 rounded-md hover:bg-raised/50 transition-colors cursor-pointer"
              onClick={() => setEditId(env.id)}
            >
              <span
                className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  isActive ? "bg-primary" : "bg-foreground-subtle/40"
                }`}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-foreground truncate block">
                  {env.name}
                </span>
                {env.description && (
                  <p className="text-xs text-foreground-subtle truncate max-w-[280px]">
                    {env.description}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-foreground-subtle">
                {env.variables.length} var{env.variables.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-foreground-subtle hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditId(env.id);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-foreground-subtle hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateEnvironment(env.id);
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-foreground-subtle hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({ id: env.id, name: env.name });
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialogs */}
      <EnvCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EnvCreateDialog
        open={!!renameId}
        onOpenChange={(o) => { if (!o) setRenameId(null); }}
        renameId={renameId ?? undefined}
        initialName={renameEnv?.name ?? ""}
      />
      {deleteTarget && (
        <EnvDeleteDialog
          open={!!deleteTarget}
          onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
          envId={deleteTarget.id}
          envName={deleteTarget.name}
        />
      )}
      {editId && (
        <EnvEditSheet
          open={!!editId}
          onOpenChange={(o) => { if (!o) setEditId(null); }}
          envId={editId}
        />
      )}
    </div>
  );
}
