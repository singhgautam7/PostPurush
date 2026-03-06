"use client";

import { Zap } from "lucide-react";
import { ThemePicker } from "@/components/theme/theme-picker";

export function MasterHeader() {
  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-border bg-background">
      {/* Left — Branding */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-action">
          <Zap className="h-4 w-4 text-primary-action-fg" />
        </div>
        <span className="text-sm font-bold tracking-tight text-foreground">PostPurush</span>
      </div>

      {/* Right — Global controls */}
      <div className="flex items-center gap-1">
        <ThemePicker />
      </div>
    </header>
  );
}
