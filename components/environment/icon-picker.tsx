"use client";

import { PRESET_ICONS, getEnvColor } from "@/lib/env-presets";
import { EnvIcon } from "./env-icon";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string | null;
  color: string | null;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, color, onChange }: IconPickerProps) {
  const tokens = getEnvColor(color);
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {PRESET_ICONS.map((iconName) => {
        const selected = (value ?? "Globe") === iconName;
        return (
          <button
            key={iconName}
            type="button"
            title={iconName}
            onClick={() => onChange(iconName)}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg transition-all",
              selected
                ? `${tokens.bg} ${tokens.text} ring-1 ${tokens.ring}`
                : "hover:bg-raised text-foreground-muted"
            )}
          >
            <EnvIcon name={iconName} />
          </button>
        );
      })}
    </div>
  );
}
