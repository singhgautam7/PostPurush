"use client";

import { useRequestStore } from "@/store/request-store";
import { BodyType } from "@/types/request";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function BodyTab() {
  const body = useRequestStore((s) => s.activeRequest.body);
  const method = useRequestStore((s) => s.activeRequest.method);
  const setBody = useRequestStore((s) => s.setBody);

  if (method === "GET") {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        GET requests do not have a body.
      </div>
    );
  }

  const bodyTypes: { value: BodyType; label: string }[] = [
    { value: "json", label: "JSON" },
    { value: "raw", label: "Raw" },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        {bodyTypes.map((bt) => (
          <Badge
            key={bt.value}
            variant={body.type === bt.value ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all duration-200",
              body.type === bt.value
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30"
                : "hover:bg-muted/80"
            )}
            onClick={() => setBody({ ...body, type: bt.value })}
          >
            {bt.label}
          </Badge>
        ))}
      </div>
      <Textarea
        value={body.content}
        onChange={(e) => setBody({ ...body, content: e.target.value })}
        placeholder={
          body.type === "json"
            ? '{\n  "key": "value"\n}'
            : "Enter request body..."
        }
        className="min-h-[200px] bg-muted/30 border-border/30 font-mono text-sm resize-none"
      />
    </div>
  );
}
