"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder,
  FlaskConical,
  BookText,
  BarChart3,
  Globe,
  HelpCircle,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  collapsed?: boolean;
}

function NavItem({ icon, label, href, isActive, collapsed }: NavItemProps) {
  const link = (
    <Link
      href={href}
      className={cn(
        "w-full flex items-center cursor-pointer",
        "rounded-none text-sm transition-colors duration-100",
        collapsed ? "justify-center py-2.5" : "gap-2.5 px-3 py-2",
        isActive
          ? "bg-raised text-foreground font-medium border-l-2 border-accent"
          : "text-foreground-nav hover:bg-raised hover:text-foreground border-l-2 border-transparent"
      )}
    >
      <span className={cn("flex-shrink-0", isActive ? "text-foreground-subtle" : "text-foreground-nav")}>{icon}</span>
      {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

const exploreItems = [
  { href: "/", label: "Collections", icon: <Folder size={15} /> },
  { href: "/environments", label: "Environments", icon: <Globe size={15} /> },
  { href: "/analytics", label: "Analytics", icon: <BarChart3 size={15} /> },
  { href: "/api-docs", label: "Create API Docs", icon: <BookText size={15} /> },
  { href: "/testing", label: "Test your APIs", icon: <FlaskConical size={15} /> },
];

const supportItems = [
  { href: "/help", label: "Help", icon: <HelpCircle size={15} /> },
  { href: "/settings", label: "Settings", icon: <Settings size={15} /> },
];

export function NavigationSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "flex-shrink-0 flex flex-col h-full bg-sidebar-bg border-r border-border transition-all duration-200",
        collapsed ? "w-14" : "w-[210px]"
      )}
    >
      {/* Top: Collapse toggle */}
      <div className={cn("h-12 flex items-center border-b border-border", collapsed ? "justify-center" : "px-4")}>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
            >
              {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
              {!collapsed && <span>Collapse</span>}
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" sideOffset={8}>
              Expand sidebar
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Explore section */}
      <nav className="flex-1 flex flex-col py-2 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
            Explore
          </p>
        )}
        {exploreItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}

        {/* Support section — pushed to bottom */}
        <div className="mt-auto">
          <div className={cn("my-2 border-t border-border", collapsed ? "mx-2" : "mx-3")} />
          {!collapsed && (
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
              Support
            </p>
          )}
          {supportItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}
