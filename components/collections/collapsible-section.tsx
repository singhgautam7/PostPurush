"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  storageKey?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
  headerRight,
  storageKey,
  onOpenChange,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) setIsOpen(stored === "true");
    }
  }, [storageKey]);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (storageKey) localStorage.setItem(storageKey, String(next));
    onOpenChange?.(next);
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={toggle}
        className={cn(
          "w-full flex items-center gap-1.5 px-3 py-2",
          "text-left select-none cursor-pointer",
          "hover:bg-raised/50 transition-colors duration-100",
          "group"
        )}
      >
        <ChevronRight
          size={13}
          className={cn(
            "text-foreground-subtle flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
          {title}
        </span>
        {headerRight && (
          <span onClick={(e) => e.stopPropagation()}>{headerRight}</span>
        )}
      </button>

      {isOpen && <div className="flex flex-col">{children}</div>}
    </div>
  );
}
