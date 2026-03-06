"use client";

import {
  Folder,
  FlaskConical,
  BookText,
  Activity,
  BarChart3,
  Globe,
  HelpCircle,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigationStore, NavigationSection } from "@/store/navigation-store";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5",
        "px-3 py-2",
        "rounded-none",
        "text-sm transition-colors duration-100",
        isActive
          ? "bg-raised text-foreground font-medium border-l-2 border-accent"
          : "text-foreground-muted hover:bg-raised hover:text-foreground border-l-2 border-transparent"
      )}
    >
      <span className="flex-shrink-0 text-foreground-subtle">
        {icon}
      </span>
      <span className="flex-1 text-left truncate">{label}</span>
    </button>
  );
}

const navItems: { id: NavigationSection; label: string; icon: React.ReactNode }[] = [
  { id: "collections", label: "Collections", icon: <Folder size={15} /> },
  { id: "testing", label: "Testing", icon: <FlaskConical size={15} /> },
  { id: "docs", label: "API Docs", icon: <BookText size={15} /> },
  { id: "stress", label: "Stress Testing", icon: <Activity size={15} /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 size={15} /> },
  { id: "env", label: "Environments", icon: <Globe size={15} /> },
];

export function NavigationSidebar() {
  const activeSection = useNavigationStore((s) => s.activeSection);
  const setActiveSection = useNavigationStore((s) => s.setActiveSection);

  return (
    <aside className="w-[210px] flex-shrink-0 flex flex-col h-full bg-background border-r border-border">
      {/* Top: Collapse toggle */}
      <div className="h-12 flex items-center px-4 border-b border-border">
        <button className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors">
          <PanelLeftClose size={15} />
          <span>Collapse</span>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col py-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeSection === item.id}
            onClick={() => setActiveSection(item.id)}
          />
        ))}

        {/* Separator before Support section */}
        <div className="mx-3 my-2 border-t border-border" />
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
          Support
        </p>
        <NavItem
          icon={<HelpCircle size={15} />}
          label="Help"
          isActive={activeSection === "help"}
          onClick={() => setActiveSection("help")}
        />
      </nav>
    </aside>
  );
}
