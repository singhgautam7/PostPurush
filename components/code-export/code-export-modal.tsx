"use client";

import { useState } from "react";
import { useRequestStore } from "@/store/request-store";
import {
  generateCode,
  supportedLanguages,
  CodeLanguage,
} from "@/lib/codegen/generate-code";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CodeViewer } from "@/components/code/code-viewer";
import { cn } from "@/lib/utils";

interface CodeExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CodeExportModal({ open, onOpenChange }: CodeExportModalProps) {
  const activeRequest = useRequestStore((s) => s.activeRequest);
  const [language, setLanguage] = useState<CodeLanguage>("curl");
  const [copied, setCopied] = useState(false);

  let code = "";
  try {
    code = generateCode(activeRequest, language);
  } catch {
    code = "// Error generating code";
  }

  const syntaxLang = language === "curl" ? "bash" : language;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-zinc-900 border-zinc-800 rounded-xl shadow-2xl shadow-black/50 p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-zinc-100">Export Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-hidden w-full max-w-full">
          {/* Level 2 — Underline tabs for language selector */}
          <div className="flex items-center gap-1 border-b border-zinc-800">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => {
                  setLanguage(lang.value);
                  setCopied(false);
                }}
                className={cn(
                  "px-3 py-2 text-xs font-medium transition-all border-b-2 -mb-px",
                  language === lang.value
                    ? "text-zinc-100 border-zinc-400"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <div className="min-w-0 w-full overflow-hidden rounded-lg border border-zinc-800">
            <CodeViewer code={code} language={syntaxLang} className="h-[400px]" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
