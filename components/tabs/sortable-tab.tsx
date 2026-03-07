"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SortableTabProps {
  id: string;
  requestId: string;
  title: string;
  isActive: boolean;
  isDirty?: boolean;
  onClick: () => void;
  onClose: (e: React.MouseEvent) => void;
}

export function SortableTab({
  id,
  requestId,
  title,
  isActive,
  isDirty,
  onClick,
  onClose,
}: SortableTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: {
      type: "tab",
      requestId,
      title,
      isDirty,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group relative flex h-full min-w-[140px] max-w-[200px] shrink-0 cursor-pointer items-center justify-between gap-2 border-r border-border px-3 transition-colors",
        isActive
          ? "bg-panel border-t-2 border-t-primary-action font-medium text-foreground"
          : "bg-transparent border-t-2 border-t-transparent font-normal text-foreground-subtle hover:bg-panel/50 hover:text-foreground-muted",
        isDragging && "opacity-50 ring-2 ring-border-subtle ring-inset bg-panel/50"
      )}
    >
      <div className="flex items-center gap-2 truncate">
        <span className={cn("truncate text-xs select-none", isDirty && "italic")}>
          {title}
        </span>
        {isDirty && (
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
        )}
      </div>
      <button
        onClick={onClose}
        className={cn(
          "rounded-md p-1 opacity-0 group-hover:opacity-100 transition-all z-10",
          isActive
            ? "opacity-100 text-foreground-subtle hover:bg-raised hover:text-foreground-muted"
            : "text-foreground-subtle hover:bg-raised hover:text-foreground-muted"
        )}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
