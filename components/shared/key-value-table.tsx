"use client";

import { useRef, useCallback } from "react";
import { KeyValuePair } from "@/types/request";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { VariableInput } from "@/components/shared/variable-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, MoreHorizontal, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

function guessType(value: string): KeyValuePair["type"] {
  if (value === "true" || value === "false") return "boolean";
  if (value !== "" && !isNaN(Number(value))) {
    return value.includes(".") ? "float" : "number";
  }
  return "string";
}

interface KeyValueTableProps {
  rows: KeyValuePair[];
  onChange: (rows: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  showDescription?: boolean;
  showActions?: boolean;
  addLabel?: string;
  autoGuessType?: boolean;
  sensitiveByDefault?: string[];
  extraActions?: React.ReactNode;
}

export function KeyValueTable({
  rows,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  showDescription = true,
  showActions = true,
  addLabel = "+ Add",
  autoGuessType = true,
  sensitiveByDefault,
  extraActions,
}: KeyValueTableProps) {
  const keyRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const updateRow = useCallback(
    (index: number, updates: Partial<KeyValuePair>) => {
      const updated = [...rows];
      updated[index] = { ...updated[index], ...updates };
      onChange(updated);
    },
    [rows, onChange]
  );

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([...rows, { key: "", value: "" }]);
    setTimeout(() => {
      keyRefs.current[rows.length]?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && index === rows.length - 1) {
      e.preventDefault();
      addRow();
    }
  };

  const handleValueBlur = (index: number) => {
    const row = rows[index];
    if (autoGuessType && !row.type && row.value) {
      updateRow(index, { type: guessType(row.value) });
    }
  };

  const handleKeyBlur = (index: number) => {
    const row = rows[index];
    if (
      sensitiveByDefault &&
      row.key &&
      sensitiveByDefault.some(
        (k) => k.toLowerCase() === row.key.toLowerCase()
      )
    ) {
      updateRow(index, { sensitive: true });
    }
  };

  // Fixed grid columns — no layout shift regardless of metadata state
  const gridCols = showDescription
    ? showActions
      ? `1fr 1.2fr 1fr 28px 28px`
      : `1fr 1.2fr 1fr 28px`
    : showActions
      ? `1fr 1fr 28px 28px`
      : `1fr 1fr 28px`;

  return (
    <div className="space-y-1.5">
      {/* Header */}
      {rows.length > 0 && (
        <div
          className="grid gap-2 text-[10px] font-medium text-muted-foreground mb-0.5 px-0.5"
          style={{ gridTemplateColumns: gridCols }}
        >
          <span>Key</span>
          <span>Value</span>
          {showDescription && <span>Description</span>}
          {showActions && <span></span>}
          <span></span>
        </div>
      )}

      {rows.length === 0 && (
        <div className="text-xs text-muted-foreground italic px-1 py-1">
          No items added
        </div>
      )}

      {/* Rows */}
      {rows.map((row, index) => (
        <div
          key={index}
          className="group grid gap-2 items-center"
          style={{ gridTemplateColumns: gridCols }}
        >
          {/* Key input */}
          <VariableInput
            ref={(el) => {
              keyRefs.current[index] = el;
            }}
            value={row.key}
            onChange={(val) => updateRow(index, { key: val })}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onBlur={() => handleKeyBlur(index)}
            placeholder={keyPlaceholder}
            className={cn(
              "h-8 bg-muted/30 border-border/30 text-sm font-mono",
              row.deprecated && "line-through opacity-60"
            )}
          />

          {/* Value input with eye toggle for sensitive */}
          <div className="relative flex-1">
            {row.sensitive && !row._revealed ? (
              <Input
                type="password"
                value={row.value}
                onChange={(e) => updateRow(index, { value: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onBlur={() => handleValueBlur(index)}
                placeholder={valuePlaceholder}
                className={cn("h-8 bg-muted/30 border-border/30 text-sm font-mono", row.sensitive && "pr-7")}
              />
            ) : (
              <VariableInput
                value={row.value}
                onChange={(val) => updateRow(index, { value: val })}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onBlur={() => handleValueBlur(index)}
                placeholder={valuePlaceholder}
                className={cn("h-8 bg-muted/30 border-border/30 text-sm font-mono", row.sensitive && "pr-7")}
              />
            )}
            {row.sensitive && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateRow(index, { _revealed: !row._revealed })}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {row._revealed ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            )}
          </div>

          {/* Description input */}
          {showDescription && (
            <Input
              value={row.description ?? ""}
              onChange={(e) =>
                updateRow(index, { description: e.target.value })
              }
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder="Description"
              className="h-8 bg-muted/30 border-border/30 text-sm font-mono"
            />
          )}

          {/* Actions: three-dot popover with dot indicator */}
          {showActions && (
            <div className="relative shrink-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-foreground-subtle hover:text-foreground"
                  >
                    <MoreHorizontal size={13} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="left"
                  align="start"
                  className="w-64 p-3 space-y-3"
                >
                  {/* Type selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-foreground-subtle">
                      Type
                    </label>
                    <Select
                      value={row.type ?? "string"}
                      onValueChange={(v) =>
                        updateRow(index, {
                          type: v as KeyValuePair["type"],
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="float">Float</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2 pt-1">
                    {(
                      [
                        {
                          key: "required",
                          label: "Required",
                          desc: "Mark this field as required",
                        },
                        {
                          key: "deprecated",
                          label: "Deprecated",
                          desc: "Mark this field as deprecated",
                        },
                        {
                          key: "sensitive",
                          label: "Sensitive",
                          desc: "Mask value with \u25cf\u25cf\u25cf\u25cf\u25cf",
                        },
                      ] as const
                    ).map((toggle) => (
                      <div
                        key={toggle.key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {toggle.label}
                          </p>
                          <p className="text-[10px] text-foreground-subtle">
                            {toggle.desc}
                          </p>
                        </div>
                        <Switch
                          checked={!!row[toggle.key]}
                          onCheckedChange={(v) =>
                            updateRow(index, { [toggle.key]: v })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {(row.required || row.deprecated || row.sensitive || (row.type && row.type !== "string")) && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary-action pointer-events-none" />
              )}
            </div>
          )}

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeRow(index)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      {/* Add button + extra actions */}
      <div className="flex items-center gap-2 mt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={addRow}
          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <Plus className="h-3 w-3" />
          {addLabel}
        </Button>
        {extraActions}
      </div>
    </div>
  );
}
