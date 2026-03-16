"use client";

import { useState } from "react";
import { useEnvironmentStore } from "@/store/environment-store";
import { Environment } from "@/types/environment";
import { EnvCreateDialog } from "./env-create-dialog";
import { EnvDeleteDialog } from "./env-delete-dialog";
import { EnvEditSheet } from "./env-edit-sheet";
import { EnvIcon } from "./env-icon";
import { getEnvColor } from "@/lib/env-presets";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Copy, Trash2, Globe } from "lucide-react";

function EnvCard({
  env,
  isActive,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  env: Environment;
  isActive: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const tokens = getEnvColor(env.color);
  const varCount = env.variables?.length ?? 0;

  return (
    <div
      onClick={onEdit}
      className={cn(
        "relative flex flex-col gap-3 p-4 rounded-xl border cursor-pointer",
        "bg-panel hover:bg-raised transition-colors group",
        isActive
          ? "border-accent/50 ring-1 ring-accent/20"
          : "border-border hover:border-border-subtle"
      )}
    >
      {isActive && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent" title="Active environment" />
      )}

      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", tokens.bg)}>
        <EnvIcon name={env.icon} className={cn(tokens.text, "w-5 h-5")} size={20} />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{env.name}</p>
        {env.description ? (
          <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">{env.description}</p>
        ) : (
          <p className="text-xs text-foreground-subtle italic">No description</p>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-[11px] text-foreground-subtle font-mono">
          {varCount} {varCount === 1 ? "variable" : "variables"}
        </span>
        <div
          className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                <Pencil size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate}>
                <Copy size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Duplicate</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-400" onClick={onDelete}>
                <Trash2 size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export function EnvList() {
  const environments = useEnvironmentStore((s) => s.environments);
  const activeEnvId = useEnvironmentStore((s) => s.activeEnvId);
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
      <div className="p-6">
        {/* Header */}
        {environments.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-foreground">Environments</h1>
              <Button
                size="icon"
                onClick={() => setCreateOpen(true)}
                className="h-8 w-8 md:h-9 md:w-auto md:px-4 bg-primary-action text-primary-action-fg hover:bg-primary-action/85"
              >
                <Plus size={14} /> <span className="hidden md:inline">New Environment</span>
              </Button>
            </div>
            <p className="text-sm text-foreground-muted hidden md:block">
              Manage variable sets for different stages of your workflow
            </p>
          </div>
        )}

        {/* Empty state */}
        {environments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-raised/60 flex items-center justify-center">
              <Globe size={24} className="text-foreground-subtle" />
            </div>
            <p className="text-base font-medium text-foreground">No environments yet</p>
            <p className="text-sm text-foreground-muted max-w-xs text-center">
              Create an environment to store variables you can use across requests.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="mt-2 gap-1.5 bg-primary-action text-primary-action-fg hover:bg-primary-action/85"
            >
              <Plus size={14} /> Create Environment
            </Button>
          </div>
        )}

        {/* Card grid */}
        {environments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {environments.map((env) => (
              <EnvCard
                key={env.id}
                env={env}
                isActive={env.id === activeEnvId}
                onEdit={() => setEditId(env.id)}
                onDuplicate={() => duplicateEnvironment(env.id)}
                onDelete={() => setDeleteTarget({ id: env.id, name: env.name })}
              />
            ))}
          </div>
        )}
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
