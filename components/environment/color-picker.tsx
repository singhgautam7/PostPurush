"use client";

import { PRESET_COLORS } from "@/lib/env-presets";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string | null;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(PRESET_COLORS).map(([key, tokens]) => (
        <button
          key={key}
          type="button"
          title={tokens.label}
          onClick={() => onChange(key)}
          className={cn(
            "w-6 h-6 rounded-full transition-all",
            tokens.swatch,
            (value ?? "gray") === key && `ring-2 ring-offset-2 ring-offset-background ${tokens.ring}`
          )}
        />
      ))}
    </div>
  );
}
