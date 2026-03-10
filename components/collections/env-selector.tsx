"use client";

import { useState } from "react";
import { useEnvironmentStore } from "@/store/environment-store";
import { useRouter } from "next/navigation";
import { EnvVariable } from "@/types/environment";
import { KeyValueTable } from "@/components/shared/key-value-table";
import { KeyValuePair } from "@/types/request";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Settings, Globe } from "lucide-react";
import { EnvIcon } from "@/components/environment/env-icon";
import { getEnvColor } from "@/lib/env-presets";

export function EnvSelector() {
  const environments = useEnvironmentStore((s) => s.environments);
  const activeEnvId = useEnvironmentStore((s) => s.activeEnvId);
  const setActiveEnvId = useEnvironmentStore((s) => s.setActiveEnvId);
  const activeEnv = useEnvironmentStore((s) => s.activeEnv);
  const updateEnvironment = useEnvironmentStore((s) => s.updateEnvironment);
  const router = useRouter();

  const [manageOpen, setManageOpen] = useState(false);

  const currentEnv = activeEnv();
  const hasEnvs = environments.length > 0;

  const handleVariablesChange = (rows: KeyValuePair[]) => {
    if (!activeEnvId || !currentEnv) return;
    const variables: EnvVariable[] = rows.map((r, i) => ({
      id: currentEnv.variables[i]?.id ?? crypto.randomUUID(),
      key: r.key,
      value: r.value,
      enabled: r.enabled !== false,
      description: r.description,
      type: r.type,
      required: r.required,
      deprecated: r.deprecated,
      sensitive: r.sensitive,
    }));
    updateEnvironment(activeEnvId, { variables });
  };

  const envRows: KeyValuePair[] = currentEnv
    ? currentEnv.variables.map((v) => ({
        key: v.key,
        value: v.value,
        enabled: v.enabled,
        description: v.description,
        type: v.type,
        required: v.required,
        deprecated: v.deprecated,
        sensitive: v.sensitive,
      }))
    : [];

  return (
    <div className="px-3 py-2 border-b border-border flex items-center gap-1.5">
      <Select
        value={activeEnvId ?? "__none__"}
        onValueChange={(val) => {
          setActiveEnvId(val === "__none__" ? null : val);
          setTimeout(() => {
            const urlTextarea = document.querySelector<HTMLTextAreaElement>(
              'textarea[placeholder*="example.com"]'
            );
            urlTextarea?.focus();
          }, 50);
        }}
      >
        <SelectTrigger className="flex-1 h-7 text-xs bg-panel border-border/50">
          <SelectValue>
            {currentEnv ? (
              <div className="flex items-center gap-1.5">
                <div className={cn("w-3.5 h-3.5 rounded flex items-center justify-center shrink-0", getEnvColor(currentEnv.color).bg)}>
                  <EnvIcon name={currentEnv.icon} className={cn(getEnvColor(currentEnv.color).text, "w-2 h-2")} size={8} />
                </div>
                <span>{currentEnv.name}</span>
              </div>
            ) : (
              <span className="text-foreground-subtle">No env selected</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {!hasEnvs ? (
            <SelectItem
              value="__none__"
              disabled
              className="cursor-default focus:bg-transparent"
            >
              <div className="flex items-start gap-2 py-1 max-w-[220px] whitespace-normal">
                <Globe
                  size={13}
                  className="text-foreground-subtle mt-0.5 flex-shrink-0"
                />
                <span className="text-xs text-foreground-muted leading-snug">
                  No environments created yet.{" "}
                  <button
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      router.push("/environments");
                    }}
                    className="text-primary underline underline-offset-2 hover:opacity-80"
                  >
                    Visit Environments
                  </button>{" "}
                  to create one.
                </span>
              </div>
            </SelectItem>
          ) : (
            <>
              <SelectItem value="__none__">— No environment —</SelectItem>
              {environments.map((env) => {
                const tokens = getEnvColor(env.color);
                return (
                  <SelectItem key={env.id} value={env.id}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-4 h-4 rounded flex items-center justify-center shrink-0", tokens.bg)}>
                        <EnvIcon name={env.icon} className={cn(tokens.text, "w-2.5 h-2.5")} size={10} />
                      </div>
                      <span>{env.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </>
          )}
        </SelectContent>
      </Select>

      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 text-foreground-subtle hover:text-foreground shrink-0",
                !activeEnvId && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
              disabled={!activeEnvId}
              onClick={() => setManageOpen(true)}
            >
              <Settings size={13} />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {activeEnvId ? "Manage this environment" : "Select an environment first"}
        </TooltipContent>
      </Tooltip>

      {/* Quick edit modal */}
      {currentEnv && (
        <Dialog open={manageOpen} onOpenChange={setManageOpen}>
          <DialogContent className="sm:max-w-[580px] bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>Manage — {currentEnv.name}</DialogTitle>
              <DialogDescription>
                Edit variables for this environment. Changes are reflected everywhere immediately.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[400px] overflow-y-auto px-4">
              <KeyValueTable
                rows={envRows}
                onChange={handleVariablesChange}
                keyPlaceholder="variable_name"
                valuePlaceholder="value"
                addLabel="Add Variable"
                autoGuessType={true}
                showDescription={true}
              />
            </div>

            <DialogFooter className="flex items-center justify-end sm:justify-end">
              <Button
                size="sm"
                onClick={() => setManageOpen(false)}
                className="h-7 bg-primary-action text-primary-action-fg hover:bg-primary-action/85"
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
