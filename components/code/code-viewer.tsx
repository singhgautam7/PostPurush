"use client";

import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { json } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";

const languageExtensions: Record<string, () => ReturnType<typeof json>> = {
  json: () => json(),
  javascript: () => javascript(),
  typescript: () => javascript({ typescript: true }),
  python: () => python(),
};

interface CodeViewerProps {
  code: string;
  language: string;
  className?: string;
  editable?: boolean;
  onChange?: (value: string) => void;
}

export function CodeViewer({ code, language, className, editable = false, onChange }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const extensions = useMemo(() => {
    const exts = [];
    const langExt = languageExtensions[language];
    if (langExt) exts.push(langExt());
    if (!editable) exts.push(EditorView.editable.of(false));
    exts.push(EditorView.lineWrapping);
    return exts;
  }, [language, editable]);

  return (
    <div className={cn("relative group w-full flex flex-col", className)}>
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-2 right-3 h-7 gap-1 text-xs z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/80 backdrop-blur-sm shadow-sm"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-400" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
      <div className="flex-1 w-full rounded-lg border border-border/30 overflow-auto [&_.cm-editor]:bg-transparent [&_.cm-gutters]:bg-transparent [&_.cm-gutters]:border-none">
        <CodeMirror
          value={code}
          theme={vscodeDark}
          extensions={extensions}
          onChange={onChange}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: editable,
            highlightActiveLineGutter: editable,
          }}
          style={{
            fontSize: "13px",
            minHeight: "100%",
          }}
        />
      </div>
    </div>
  );
}
