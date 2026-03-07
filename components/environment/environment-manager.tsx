"use client";

import { useEnvironmentStore } from "@/store/environment-store";
import { saveEnvironment } from "@/lib/storage/storage-helpers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import { useState } from "react";

interface EnvironmentManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnvironmentManager({ open, onOpenChange }: EnvironmentManagerProps) {
  const variables = useEnvironmentStore((s) => s.variables);
  const updateVariable = useEnvironmentStore((s) => s.updateVariable);
  const addVariable = useEnvironmentStore((s) => s.addVariable);
  const removeVariable = useEnvironmentStore((s) => s.removeVariable);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveEnvironment(variables);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-lg">Environment Variables</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Variables can be used in URLs, headers, and body using{" "}
            <code className="bg-raised px-1 py-0.5 rounded text-blue-400">
              {"{{variable_name}}"}
            </code>{" "}
            syntax.
          </p>

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-xs font-medium text-muted-foreground">
              <span>Variable</span>
              <span>Value</span>
              <span></span>
            </div>
            {variables.map((v, index) => (
              <div key={index} className="group grid grid-cols-[1fr_1fr_40px] gap-2">
                <Input
                  value={v.key}
                  onChange={(e) => updateVariable(index, { ...v, key: e.target.value })}
                  placeholder="variable_name"
                  className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
                />
                <Input
                  value={v.value}
                  onChange={(e) => updateVariable(index, { ...v, value: e.target.value })}
                  placeholder="value"
                  className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariable(index)}
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  disabled={variables.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={addVariable}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Variable
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="h-7 gap-1 bg-primary-action text-primary-action-fg hover:bg-primary-action/85 font-medium"
            >
              <Save className="h-3 w-3" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
