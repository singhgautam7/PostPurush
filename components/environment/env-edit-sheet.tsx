"use client";

import { useEnvironmentStore } from "@/store/environment-store";
import { EnvVariable } from "@/types/environment";
import { EnvVariableRow } from "./env-variable-row";
import { ColorPicker } from "./color-picker";
import { IconPicker } from "./icon-picker";
import { EnvIcon } from "./env-icon";
import { getEnvColor } from "@/lib/env-presets";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EnvEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  envId: string;
}

export function EnvEditSheet({ open, onOpenChange, envId }: EnvEditSheetProps) {
  const env = useEnvironmentStore((s) =>
    s.environments.find((e) => e.id === envId)
  );
  const upsertVariable = useEnvironmentStore((s) => s.upsertVariable);
  const deleteVariable = useEnvironmentStore((s) => s.deleteVariable);
  const updateEnvironment = useEnvironmentStore((s) => s.updateEnvironment);

  if (!env) return null;

  const tokens = getEnvColor(env.color);

  const handleAdd = () => {
    const newVar: EnvVariable = {
      id: crypto.randomUUID(),
      key: "",
      value: "",
      enabled: true,
    };
    upsertVariable(envId, newVar);
    setTimeout(() => document.getElementById(`var-key-${newVar.id}`)?.focus(), 50);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[520px] bg-card border-border/50 flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit — {env.name}</SheetTitle>
          <SheetDescription>Changes are saved automatically</SheetDescription>
        </SheetHeader>

        {/* Icon + Color pickers */}
        <div className="flex items-start gap-4 px-6 py-4 border-b border-border">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", tokens.bg)}>
            <EnvIcon name={env.icon} className={cn(tokens.text)} size={24} />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-xs text-foreground-muted mb-1.5 block">Color</label>
              <ColorPicker
                value={env.color ?? null}
                onChange={(c) => updateEnvironment(envId, { color: c })}
              />
            </div>
            <div>
              <label className="text-xs text-foreground-muted mb-1.5 block">Icon</label>
              <IconPicker
                value={env.icon ?? null}
                color={env.color ?? null}
                onChange={(i) => updateEnvironment(envId, { icon: i })}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-2">
          <Input
            value={env.description ?? ""}
            onChange={(e) => updateEnvironment(envId, { description: e.target.value })}
            placeholder="Add a description..."
            className="text-sm text-foreground-muted border-0 bg-transparent px-0 h-auto focus-visible:ring-0"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mt-2 px-4">
          {env.variables.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No variables yet. Add one below.
            </p>
          )}

          {env.variables.length > 0 && (
            <div className="grid grid-cols-[1fr_1fr_32px] gap-2 text-xs font-medium text-muted-foreground mb-1">
              <span>Key</span>
              <span>Value</span>
              <span></span>
            </div>
          )}

          {env.variables.map((v) => (
            <EnvVariableRow
              key={v.id}
              variable={v}
              onChange={(updated) => upsertVariable(envId, updated)}
              onDelete={() => deleteVariable(envId, v.id)}
              onAddNew={handleAdd}
            />
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleAdd}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 mt-1"
          >
            <Plus className="h-3 w-3" />
            Add Variable
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
