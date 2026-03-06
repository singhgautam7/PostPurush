"use client";

import { useRequestStore } from "@/store/request-store";
import { BodyType } from "@/types/request";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BodyKeyValue } from "./body-keyvalue";
import { CodeViewer } from "@/components/code/code-viewer";

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
    { value: "form", label: "Form Data" },
    { value: "raw", label: "Raw" },
  ];

  return (
    <div className="p-4 space-y-3 flex flex-col h-full">
      <div className="flex items-center gap-2 shrink-0">
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

      <div className="flex-1 overflow-hidden min-h-0">
        {body.type === "form" ? (
          <BodyKeyValue />
        ) : (
          <CodeViewer
            code={body.content}
            language={body.type === "json" ? "json" : "javascript"}
            editable={true}
            onChange={(value) => setBody({ ...body, content: value })}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
}

