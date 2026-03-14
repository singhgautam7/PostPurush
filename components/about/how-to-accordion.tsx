"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronDown,
  FolderOpen,
  Globe,
  BarChart2,
  FileText,
  FlaskConical,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  FolderOpen,
  Globe,
  BarChart2,
  FileText,
  FlaskConical,
  Settings,
};

interface HowToSection {
  file: string;
  title: string;
  icon: string;
  markdown: string;
}

export function HowToAccordion({ sections }: { sections: HowToSection[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
      {sections.map((section) => {
        const isOpen = openId === section.file;
        const Icon = ICON_MAP[section.icon] ?? FileText;

        return (
          <div key={section.file}>
            <button
              onClick={() => setOpenId(isOpen ? null : section.file)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left
                         hover:bg-raised/50 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md bg-primary-action/10 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-primary-action" />
              </div>
              <span className="text-sm font-semibold text-foreground flex-1">
                {section.title}
              </span>
              <ChevronDown
                size={14}
                className={cn(
                  "text-foreground-subtle transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && (
              <div className="bg-panel border-t border-border px-4 py-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold text-foreground mt-4 mb-2 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-semibold text-foreground mt-4 mb-2 first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold text-foreground mt-3 mb-1.5">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-sm text-foreground-muted leading-relaxed mb-2">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-1 ml-4 list-disc marker:text-foreground-subtle mb-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="space-y-1 ml-4 list-decimal marker:text-foreground-subtle mb-2">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm text-foreground-muted leading-relaxed">
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-foreground font-semibold">
                        {children}
                      </strong>
                    ),
                    code: ({ children, className }) => {
                      const isBlock = className?.includes("language-");
                      if (isBlock) {
                        return (
                          <code className={className}>{children}</code>
                        );
                      }
                      return (
                        <code className="text-xs bg-code-bg px-1 py-0.5 rounded font-mono text-foreground">
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-code-bg rounded-md px-3 py-2 text-xs font-mono text-foreground overflow-x-auto mb-2">
                        {children}
                      </pre>
                    ),
                    hr: () => (
                      <hr className="border-border my-3" />
                    ),
                    img: ({ src, alt }) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={alt ?? ""}
                        className="rounded-lg border border-border my-3 max-w-full"
                      />
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-action hover:underline"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {section.markdown}
                </ReactMarkdown>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
