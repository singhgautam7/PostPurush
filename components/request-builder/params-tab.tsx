"use client";

import { useRef } from "react";
import { useRequestStore } from "@/store/request-store";
import { KeyValuePair } from "@/types/request";
import { Input } from "@/components/ui/input";
import { VariableInput } from "@/components/shared/variable-input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function ParamsTab() {
  const params = useRequestStore((s) => s.activeRequest.params);
  const setParams = useRequestStore((s) => s.setParams);

  // Refs for auto-focusing the new key input
  const keyRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const updateParam = (index: number, field: keyof KeyValuePair, value: string) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };
    setParams(newParams);
  };

  const removeParam = (index: number) => {
    const newParams = params.filter((_, i) => i !== index);
    setParams(newParams);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && index === params.length - 1) {
      e.preventDefault();
      setParams([...params, { key: "", value: "" }]);

      // Focus the newly added row
      setTimeout(() => {
        keyRefs.current[index + 1]?.focus();
      }, 0);
    }
  };

  return (
    <div className="space-y-2 p-4">
      <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-xs font-medium text-muted-foreground mb-1">
        <span>Key</span>
        <span>Value</span>
        <span></span>
      </div>

      {params.length === 0 && (
        <div className="text-xs text-muted-foreground italic mb-2 px-1">
          No parameters added
        </div>
      )}

      {/* Render actual params */}
      {params.map((param, index) => (
        <div key={index} className="group grid grid-cols-[1fr_1fr_40px] gap-2">
          <VariableInput
            ref={(el) => {
              keyRefs.current[index] = el;
            }}
            value={param.key}
            onChange={(val) => updateParam(index, "key", val)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="parameter"
            className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
          />
          <VariableInput
            value={param.value}
            onChange={(val) => updateParam(index, "value", val)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="value"
            className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeParam(index)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}



      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setParams([...params, { key: "", value: "" }]);
          setTimeout(() => {
            keyRefs.current[params.length]?.focus();
          }, 0);
        }}
        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 mt-2"
      >
        <Plus className="h-3 w-3" />
        Add Parameter
      </Button>
    </div>
  );
}
