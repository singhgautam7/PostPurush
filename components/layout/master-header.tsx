"use client";

import { Menu, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemePicker } from "@/components/theme/theme-picker";
import { useIsMobile } from "@/hooks/use-is-mobile";

export function MasterHeader() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const showHamburger = isMobile && pathname === "/";

  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-border bg-background">
      {/* Left — Branding */}
      <div className="flex items-center gap-2">
        {showHamburger && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("postpurush:toggle-sidebar"))}
            className="p-1.5 -ml-1.5 text-foreground-muted hover:text-foreground rounded-md transition-colors cursor-pointer"
          >
            <Menu size={18} />
          </button>
        )}
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
