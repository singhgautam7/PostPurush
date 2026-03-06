"use client";

import { useState } from "react";
import {
  Folder,
  FlaskConical,
  BookText,
  Activity,
  BarChart3,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useNavigationStore, NavigationSection } from "@/store/navigation-store";

const navItems: { id: NavigationSection; label: string; icon: React.ElementType }[] = [
  { id: "collections", label: "Collections", icon: Folder },
  { id: "testing", label: "Testing", icon: FlaskConical },
  { id: "docs", label: "API Docs", icon: BookText },
  { id: "stress", label: "Stress Testing", icon: Activity },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "env", label: "Environments", icon: Globe },
];

export function NavigationSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const activeSection = useNavigationStore((s) => s.activeSection);
  const setActiveSection = useNavigationStore((s) => s.setActiveSection);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r border-border transition-all duration-200 shrink-0",
        collapsed ? "w-14" : "w-[220px]"
      )}
    >
      {/* Collapse toggle — top */}
      <div className="p-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "h-8 text-foreground-subtle hover:text-foreground hover:bg-panel",
                collapsed ? "w-10 px-0 justify-center" : "w-full justify-start gap-2 px-3"
              )}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4 shrink-0" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 shrink-0" />
                  <span className="text-xs">Collapse</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator className="bg-border" />

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 p-2 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          const button = (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "justify-start gap-3 h-9 text-sm font-medium transition-all",
                collapsed ? "w-10 px-0 justify-center" : "w-full px-3",
                isActive
                  ? "bg-panel text-foreground hover:bg-raised"
                  : "text-foreground-subtle hover:text-foreground hover:bg-panel"
              )}
            >
              <Icon className={cn("shrink-0", isActive ? "text-foreground-muted" : "text-foreground-subtle", collapsed ? "h-4.5 w-4.5" : "h-4 w-4")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}
      </nav>
    </div>
  );
}
