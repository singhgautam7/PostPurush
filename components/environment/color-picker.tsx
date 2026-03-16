"use client";

import { PRESET_COLORS } from "@/lib/env-presets";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string | null;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto p-1 sm:grid sm:grid-cols-5 sm:overflow-x-visible">
      {Object.entries(PRESET_COLORS).map(([key, tokens]) => (
        <button
          key={key}
          type="button"
          title={tokens.label}
          onClick={() => onChange(key)}
          className={cn(
            "w-8 h-8 rounded-full transition-all shrink-0",
            tokens.swatch,
            (value ?? "gray") === key && `ring-2 ring-offset-2 ring-offset-background ${tokens.ring}`
          )}
        />
      ))}
    </div>
  );
}
