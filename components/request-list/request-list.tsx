"use client";

import { useRequestStore } from "@/store/request-store";
import { RequestItem } from "./request-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileJson } from "lucide-react";

export function RequestList() {
  const savedRequests = useRequestStore((s) => s.savedRequests);

  if (savedRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted/50 p-3 mb-3">
          <FileJson className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <p className="text-xs text-muted-foreground/70">
          No saved requests yet.
        </p>
        <p className="text-xs text-muted-foreground/50 mt-1">
          Create & save a request to see it here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-1 px-2">
        {savedRequests.map((request) => (
          <RequestItem key={request.id} request={request} />
        ))}
      </div>
    </ScrollArea>
  );
}
