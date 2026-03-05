"use client";

import { useRequestStore } from "@/store/request-store";
import { KeyValuePair } from "@/types/request";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function ParamsTab() {
  const params = useRequestStore((s) => s.activeRequest.params);
  const setParams = useRequestStore((s) => s.setParams);

  const updateParam = (index: number, field: keyof KeyValuePair, value: string) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };

    // Auto-add empty row at end
    if (
      index === newParams.length - 1 &&
      (newParams[index].key || newParams[index].value)
    ) {
      newParams.push({ key: "", value: "" });
    }

    setParams(newParams);
  };

  const removeParam = (index: number) => {
    if (params.length <= 1) return;
    const newParams = params.filter((_, i) => i !== index);
    setParams(newParams);
  };

  return (
    <div className="space-y-2 p-4">
      <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-xs font-medium text-muted-foreground mb-1">
        <span>Key</span>
        <span>Value</span>
        <span></span>
      </div>
      {params.map((param, index) => (
        <div key={index} className="group grid grid-cols-[1fr_1fr_40px] gap-2">
          <Input
            value={param.key}
            onChange={(e) => updateParam(index, "key", e.target.value)}
            placeholder="parameter"
            className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
          />
          <Input
            value={param.value}
            onChange={(e) => updateParam(index, "value", e.target.value)}
            placeholder="value"
            className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeParam(index)}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            disabled={params.length <= 1}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setParams([...params, { key: "", value: "" }])}
        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
      >
        <Plus className="h-3 w-3" />
        Add Parameter
      </Button>
    </div>
  );
}
