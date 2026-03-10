"use client";

import { useState } from "react";
import {
  supportedLanguages,
  type CodeLanguage,
} from "@/lib/codegen/generate-code";
import type { DocsGroup } from "@/lib/docs-builder";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportPdfButtonProps {
  groups: DocsGroup[];
  docTitle: string;
  docSummary: string | null;
}

export function ExportPdfButton({
  groups,
  docTitle,
  docSummary,
}: ExportPdfButtonProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState<Set<CodeLanguage>>(
    new Set(["curl"])
  );

  const toggleLang = (lang: CodeLanguage) => {
    setSelectedLangs((prev) => {
      const next = new Set(prev);
      next.has(lang) ? next.delete(lang) : next.add(lang);
      return next;
    });
  };

  const totalEndpoints = groups.reduce(
    (acc, g) => acc + g.requests.length,
    0
  );
  const estimatedPages =
    2 +
    groups.length +
    Math.ceil(selectedLangs.size * totalEndpoints * 0.5);

  const handleExport = async () => {
    setExporting(true);
    setOpen(false);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { ApiDocsPdf } = await import("@/lib/pdf/api-docs-pdf");
      const { getAccentColorForPdf, safeAccentForPdf } = await import(
        "@/lib/pdf/get-accent-color"
      );
      const accent = safeAccentForPdf(getAccentColorForPdf());
      const blob = await pdf(
        <ApiDocsPdf
          groups={groups}
          accent={accent}
          title={docTitle}
          summary={docSummary}
          includedLanguages={[...selectedLangs]}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docTitle.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed", err);
      toast.error("PDF export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 cursor-pointer"
          disabled={exporting}
        >
          {exporting ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Download size={13} /> Export PDF
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" className="w-72 p-4">
        <div className="mb-3">
          <p className="text-sm font-semibold text-foreground">
            Export as PDF
          </p>
          <p className="text-xs text-foreground-muted mt-0.5">
            Choose which code snippets to include
          </p>
        </div>

        <div className="space-y-1 mb-4">
          {supportedLanguages.map((lang) => (
            <label
              key={lang.value}
              className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-raised cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selectedLangs.has(lang.value)}
                onCheckedChange={() => toggleLang(lang.value)}
                className="shrink-0"
              />
              <span className="text-sm text-foreground">{lang.label}</span>
              {lang.value === "curl" && (
                <span className="ml-auto text-[10px] text-foreground-subtle">
                  default
                </span>
              )}
            </label>
          ))}
        </div>

        <p className="text-[11px] text-foreground-subtle mb-3">
          ~{estimatedPages} pages
          {selectedLangs.size === 0 && " · No code snippets included"}
        </p>

        <Separator className="mb-3" />

        <Button
          className="w-full gap-1.5 cursor-pointer"
          size="sm"
          onClick={handleExport}
        >
          <Download size={13} /> Generate PDF
        </Button>
      </PopoverContent>
    </Popover>
  );
}
