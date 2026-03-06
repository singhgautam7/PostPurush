"use client";

import { useRequestStore } from "@/store/request-store";
import { KeyValuePair } from "@/types/request";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function BodyKeyValue() {
  const body = useRequestStore((s) => s.activeRequest.body);
  const setBody = useRequestStore((s) => s.setBody);

  const formData = body.formData || [{ key: "", value: "" }];

  const updateFormData = (index: number, field: keyof KeyValuePair, value: string) => {
    const newFormData = [...formData];
    newFormData[index] = { ...newFormData[index], [field]: value };
    setBody({ ...body, formData: newFormData });
  };

  const removeFormData = (index: number) => {
    if (formData.length <= 1) return;
    const newFormData = formData.filter((_, i) => i !== index);
    setBody({ ...body, formData: newFormData });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && index === formData.length - 1) {
      e.preventDefault();
      setBody({ ...body, formData: [...formData, { key: "", value: "" }] });
    }
  };

  return (
    <div className="space-y-2 mt-4">
      <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-xs font-medium text-muted-foreground mb-1">
        <span>Key</span>
        <span>Value</span>
        <span></span>
      </div>
      {formData.map((param, index) => (
        <div key={index} className="group grid grid-cols-[1fr_1fr_40px] gap-2">
          <Input
            value={param.key}
            onChange={(e) => updateFormData(index, "key", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="key"
            className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
          />
          <Input
            value={param.value}
            onChange={(e) => updateFormData(index, "value", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="value"
            className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFormData(index)}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            disabled={formData.length <= 1}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBody({ ...body, formData: [...formData, { key: "", value: "" }] })}
        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
      >
        <Plus className="h-3 w-3" />
        Add Item
      </Button>
    </div>
  );
}
