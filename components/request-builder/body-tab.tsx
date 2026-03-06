"use client";

import { useRequestStore } from "@/store/request-store";
import { BodyType } from "@/types/request";
import { cn } from "@/lib/utils";
import { BodyKeyValue } from "./body-keyvalue";
import { CodeViewer } from "@/components/code/code-viewer";

export function BodyTab() {
  const body = useRequestStore((s) => s.activeRequest.body);
  const method = useRequestStore((s) => s.activeRequest.method);
  const setBody = useRequestStore((s) => s.setBody);

  if (method === "GET") {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-zinc-600">
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
      {/* Level 2 — Underline/ghost tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800 shrink-0">
        {bodyTypes.map((bt) => (
          <button
            key={bt.value}
            onClick={() => setBody({ ...body, type: bt.value })}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-all border-b-2 -mb-px",
              body.type === bt.value
                ? "text-zinc-100 border-zinc-400"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            )}
          >
            {bt.label}
          </button>
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
