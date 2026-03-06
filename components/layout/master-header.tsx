"use client";

import { Zap, Sun, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function MasterHeader() {
  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-border/50 bg-card/80 backdrop-blur-sm">
      {/* Left — Branding */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-sm shadow-indigo-500/20">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight">PostPurush</span>
      </div>

      {/* Right — Global controls */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Sun className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Theme</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Help</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
