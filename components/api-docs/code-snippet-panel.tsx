"use client";

import { useState, useMemo } from "react";
import { SavedRequest } from "@/types/request";
import {
  generateCode,
  supportedLanguages,
  CodeLanguage,
} from "@/lib/codegen/generate-code";
import { CodeViewer } from "@/components/code/code-viewer";
import { cn } from "@/lib/utils";

interface CodeSnippetPanelProps {
  request: SavedRequest;
}

const syntaxMap: Record<CodeLanguage, string> = {
  curl: "bash",
  javascript: "javascript",
  python: "python",
  go: "go",
};

export function CodeSnippetPanel({ request }: CodeSnippetPanelProps) {
  const [language, setLanguage] = useState<CodeLanguage>("curl");

  const code = useMemo(() => {
    try {
      return generateCode(request, language);
    } catch {
      return "// Error generating code";
    }
  }, [request, language]);

  return (
    <div className="flex flex-col h-full">
      {/* Language tabs */}
      <div className="flex items-center gap-0 border-b border-border/50 px-2 pt-2 flex-wrap">
        {supportedLanguages.map((lang) => (
          <button
            key={lang.value}
            onClick={() => setLanguage(lang.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-t transition-colors",
              language === lang.value
                ? "text-foreground bg-raised border-b-2 border-accent"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="flex-1 overflow-auto">
        <CodeViewer
          code={code}
          language={syntaxMap[language]}
          editable={false}
          showCopy={true}
          minHeight="0"
          className="[&_.cm-editor]:rounded-none [&>div:last-child]:border-none [&>div:last-child]:rounded-none"
        />
      </div>
    </div>
  );
}
