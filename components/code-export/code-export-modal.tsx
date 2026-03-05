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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check } from "lucide-react";
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-lg">Export Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {supportedLanguages.map((lang) => (
              <Badge
                key={lang.value}
                variant={language === lang.value ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all",
                  language === lang.value
                    ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30"
                    : "hover:bg-muted/60"
                )}
                onClick={() => {
                  setLanguage(lang.value);
                  setCopied(false);
                }}
              >
                {lang.label}
              </Badge>
            ))}
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-7 gap-1 text-xs text-muted-foreground z-10"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <ScrollArea className="h-[350px] rounded-lg border border-border/30 bg-muted/30">
              <pre className="p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap">
                {code}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
