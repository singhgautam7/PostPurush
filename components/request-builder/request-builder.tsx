"use client";

import { useState } from "react";
import { UrlInput } from "./url-input";
import { RequestTabs } from "./request-tabs";
import { CodeExportModal } from "@/components/code-export/code-export-modal";

export function RequestBuilder() {
  const [codeExportOpen, setCodeExportOpen] = useState(false);

  return (
    <>
      <div className="space-y-0">
        <div className="p-4 pb-3">
          <UrlInput onCodeExport={() => setCodeExportOpen(true)} />
        </div>
        <RequestTabs />
      </div>
      <CodeExportModal
        open={codeExportOpen}
        onOpenChange={setCodeExportOpen}
      />
    </>
  );
}
