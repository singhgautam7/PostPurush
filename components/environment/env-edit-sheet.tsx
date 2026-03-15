"use client";

import { useEnvironmentStore } from "@/store/environment-store";
import { EnvVariable } from "@/types/environment";
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
import { KeyValueTable } from "@/components/shared/key-value-table";
import { KeyValuePair } from "@/types/request";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface EnvEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  envId: string;
}

export function EnvEditSheet({ open, onOpenChange, envId }: EnvEditSheetProps) {
  const isMobile = useIsMobile();
  const env = useEnvironmentStore((s) =>
    s.environments.find((e) => e.id === envId)
  );
  const updateEnvironment = useEnvironmentStore((s) => s.updateEnvironment);

  if (!env) return null;

  const tokens = getEnvColor(env.color);

  const handleVariablesChange = (rows: KeyValuePair[]) => {
    const variables: EnvVariable[] = rows.map((r, i) => ({
      id: env.variables[i]?.id ?? crypto.randomUUID(),
      key: r.key,
      value: r.value,
      enabled: r.enabled !== false,
      description: r.description,
      type: r.type,
      required: r.required,
      deprecated: r.deprecated,
      sensitive: r.sensitive,
    }));
    updateEnvironment(envId, { variables });
  };

  const rows: KeyValuePair[] = env.variables.map((v) => ({
    key: v.key,
    value: v.value,
    enabled: v.enabled,
    description: v.description,
    type: v.type,
    required: v.required,
    deprecated: v.deprecated,
    sensitive: v.sensitive,
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"} className={cn("bg-card border-border/50 flex flex-col", isMobile ? "max-h-[85vh]" : "sm:max-w-[580px]")}>
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
            className="text-sm text-foreground-muted border-0 bg-transparent px-2 h-auto focus-visible:ring-0"
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-2 px-4 overflow-x-auto">
          <KeyValueTable
            rows={rows}
            onChange={handleVariablesChange}
            keyPlaceholder="variable_name"
            valuePlaceholder="value"
            addLabel="Add Variable"
            autoGuessType={true}
            showDescription={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
