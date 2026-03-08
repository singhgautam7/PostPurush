"use client";

import { useRef } from "react";
import { useRequestStore } from "@/store/request-store";
import { KeyValuePair } from "@/types/request";
import { Input } from "@/components/ui/input";
import { VariableInput } from "@/components/shared/variable-input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function BodyKeyValue() {
  const body = useRequestStore((s) => s.activeRequest.body);
  const setBody = useRequestStore((s) => s.setBody);

  const formData = body.formData || [];
  const keyRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const updateFormData = (index: number, field: keyof KeyValuePair, value: string) => {
    const newFormData = [...formData];
    newFormData[index] = { ...newFormData[index], [field]: value };
    setBody({ ...body, formData: newFormData });
  };

  const removeFormData = (index: number) => {
    const newFormData = formData.filter((_, i) => i !== index);
    setBody({ ...body, formData: newFormData });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && index === formData.length - 1) {
      e.preventDefault();
      setBody({ ...body, formData: [...formData, { key: "", value: "" }] });
      setTimeout(() => { keyRefs.current[index + 1]?.focus(); }, 0);
    }
  };

  return (
    <div className="space-y-2 mt-4">
      <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-xs font-medium text-muted-foreground mb-1">
        <span>Key</span>
        <span>Value</span>
        <span></span>
      </div>

      {formData.length === 0 && (
        <div className="text-xs text-muted-foreground italic mb-2 px-1">No form data added</div>
      )}

      {formData.map((param, index) => (
        <div key={index} className="group grid grid-cols-[1fr_1fr_40px] gap-2">
          <VariableInput
            ref={(el) => { keyRefs.current[index] = el; }}
            value={param.key}
            onChange={(val) => updateFormData(index, "key", val)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="key"
            className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
          />
          <VariableInput
            value={param.value}
            onChange={(val) => updateFormData(index, "value", val)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="value"
            className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFormData(index)}
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
          setBody({ ...body, formData: [...formData, { key: "", value: "" }] });
          setTimeout(() => { keyRefs.current[formData.length]?.focus(); }, 0);
        }}
        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 mt-2"
      >
        <Plus className="h-3 w-3" />
        Add Item
      </Button>
    </div>
  );
}
