"use client";

import { SavedRequest } from "@/types/request";
import { useRequestStore } from "@/store/request-store";
import { useResponseStore } from "@/store/response-store";
import { deleteRequest } from "@/lib/storage/storage-helpers";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const methodColors: Record<string, string> = {
  GET: "text-emerald-400",
  POST: "text-amber-400",
  PUT: "text-blue-400",
  PATCH: "text-purple-400",
  DELETE: "text-red-400",
};

interface RequestItemProps {
  request: SavedRequest;
}

export function RequestItem({ request }: RequestItemProps) {
  const activeRequest = useRequestStore((s) => s.activeRequest);
  const loadRequest = useRequestStore((s) => s.loadRequest);
  const removeSavedRequest = useRequestStore((s) => s.removeSavedRequest);
  const clearResponse = useResponseStore((s) => s.clearResponse);

  const isActive = activeRequest.id === request.id;

  const handleSelect = () => {
    loadRequest(request);
    clearResponse();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteRequest(request.id);
    removeSavedRequest(request.id);
  };

  return (
    <button
      onClick={handleSelect}
      className={cn(
        "group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150",
        isActive
          ? "bg-indigo-500/10 border border-indigo-500/20"
          : "hover:bg-muted/50 border border-transparent"
      )}
    >
      <span
        className={cn(
          "text-[10px] font-mono font-bold w-12 shrink-0",
          methodColors[request.method] || "text-muted-foreground"
        )}
      >
        {request.method}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{request.name}</p>
        <p className="text-[11px] text-muted-foreground/70 truncate font-mono mt-0.5">
          {request.url || "No URL"}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </button>
  );
}
