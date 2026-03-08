"use client";

import { EnvVariable } from "@/types/environment";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface EnvVariableRowProps {
  variable: EnvVariable;
  onChange: (variable: EnvVariable) => void;
  onDelete: () => void;
}

export function EnvVariableRow({ variable, onChange, onDelete }: EnvVariableRowProps) {
  return (
    <div className="group grid grid-cols-[1fr_1fr_32px] gap-2 items-center">
      <Input
        value={variable.key}
        onChange={(e) => onChange({ ...variable, key: e.target.value })}
        placeholder="variable_name"
        className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
      />
      <Input
        value={variable.value}
        onChange={(e) => onChange({ ...variable, value: e.target.value })}
        placeholder="value"
        className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
