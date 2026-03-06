"use client";

import { Zap, Sun, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function MasterHeader() {
  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950">
      {/* Left — Branding */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white">
          <Zap className="h-4 w-4 text-zinc-900" />
        </div>
        <span className="text-sm font-bold tracking-tight text-zinc-100">PostPurush</span>
      </div>

      {/* Right — Global controls */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900">
              <Sun className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Theme</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Help</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
