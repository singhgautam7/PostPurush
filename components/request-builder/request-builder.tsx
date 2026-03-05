"use client";

import { useState } from "react";
import { UrlInput } from "./url-input";
import { RequestTabs } from "./request-tabs";
import { CodeExportModal } from "@/components/code-export/code-export-modal";
import { RequestMeta } from "./request-meta";

export function RequestBuilder() {
  const [codeExportOpen, setCodeExportOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col h-full bg-background border-b border-border/50">
        <RequestMeta />
        <div className="p-4 pt-1">
          <UrlInput onCodeExport={() => setCodeExportOpen(true)} />
        </div>
        <div className="flex-1 px-4 pb-2">
          <RequestTabs />
        </div>
      </div>
      <CodeExportModal
        open={codeExportOpen}
        onOpenChange={setCodeExportOpen}
      />
    </>
  );
}
