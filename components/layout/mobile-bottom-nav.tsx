"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder,
  Globe,
  BarChart3,
  FlaskConical,
  MoreHorizontal,
  BookText,
  Info,
  Settings,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Collections", icon: Folder },
  { href: "/environments", label: "Environments", icon: Globe },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/testing", label: "Testing", icon: FlaskConical },
];

const MORE_ITEMS = [
  { href: "/api-docs", label: "Create API Docs", icon: BookText },
  { href: "/about", label: "About", icon: Info },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const isMoreActive = MORE_ITEMS.some((item) => isActive(item.href));

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around h-14 bg-background border-t border-border">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] transition-colors",
                active ? "text-primary-action bg-raised rounded-lg" : "text-foreground-muted"
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] transition-colors cursor-pointer",
            isMoreActive ? "text-primary-action bg-raised rounded-lg" : "text-foreground-muted"
          )}
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 mt-4">
            {MORE_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-raised text-foreground font-medium"
                      : "text-foreground-muted hover:bg-raised hover:text-foreground"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
