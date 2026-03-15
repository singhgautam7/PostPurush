"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRequestStore } from "@/store/request-store";
import { buildDocsGroups, DocsGroup } from "@/lib/docs-builder";
import { EndpointCard } from "@/components/api-docs/endpoint-card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Folder,
  AlertTriangle,
  Loader2,
  ChevronsDownUp,
  ChevronsUpDown,
  PanelLeft,
  X,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { ExportPdfButton } from "@/components/api-docs/export-pdf-button";
import { useIsMobile } from "@/hooks/use-is-mobile";

/* ------------------------------------------------------------------ */
/*  Method badge colors (shared with sidebar navigator)                */
/* ------------------------------------------------------------------ */
const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400",
  POST: "bg-blue-500/15 text-blue-400",
  PUT: "bg-amber-500/15 text-amber-400",
  PATCH: "bg-violet-500/15 text-violet-400",
  DELETE: "bg-red-500/15 text-red-400",
};

/* ------------------------------------------------------------------ */
/*  Sidebar Navigator                                                  */
/* ------------------------------------------------------------------ */
function SidebarNavigator({
  groups,
  openGroups,
  onNavigate,
  onClose,
}: {
  groups: DocsGroup[];
  openGroups: Record<string, boolean>;
  onNavigate: (folderId: string, requestId?: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
          Contents
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-foreground-muted hover:text-foreground cursor-pointer"
          onClick={onClose}
        >
          <X size={13} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {groups.map((group) => {
          const key = group.folderId ?? "ungrouped";
          const isOpen = openGroups[key];
          return (
            <div key={key} className="mb-1">
              <button
                onClick={() => onNavigate(key)}
                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-raised/50 transition-colors cursor-pointer"
              >
                <Folder size={13} className="text-accent shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate flex-1">
                  {group.folderName}
                </span>
                <span className="text-[10px] text-foreground-subtle shrink-0">
                  {group.requests.length}
                </span>
              </button>

              {isOpen && (
                <div className="pb-1">
                  {group.requests.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => onNavigate(key, req.id)}
                      className="w-full flex items-center gap-2 pl-8 pr-4 py-1.5 text-left hover:bg-raised/50 transition-colors cursor-pointer"
                    >
                      <span
                        className={cn(
                          "text-[9px] font-mono font-bold px-1 py-0.5 rounded shrink-0",
                          methodColors[req.method] ?? "text-foreground-muted"
                        )}
                      >
                        {req.method}
                      </span>
                      <span className="text-xs text-foreground-muted truncate">
                        {req.name || "Untitled"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function ApiDocsPreviewPage() {
  const router = useRouter();
  const savedRequests = useRequestStore((s) => s.savedRequests);
  const folders = useRequestStore((s) => s.folders);

  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("postpurush-docs-selection");
      const ids: string[] = raw ? JSON.parse(raw) : [];
      setSelectedIds(ids);
    } catch {
      setSelectedIds([]);
    }
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const groups: DocsGroup[] = useMemo(() => {
    if (!selectedIds || selectedIds.length === 0) return [];
    const idSet = new Set(selectedIds);
    const filteredRequests = savedRequests.filter((r) => idSet.has(r.id));
    return buildDocsGroups(filteredRequests, folders);
  }, [selectedIds, savedRequests, folders]);

  const totalEndpoints = groups.reduce(
    (sum, g) => sum + g.requests.length,
    0
  );

  // Controlled collapsible state — all open by default
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Sync openGroups when groups change (initial load or data change)
  useEffect(() => {
    if (groups.length > 0) {
      setOpenGroups((prev) => {
        const next: Record<string, boolean> = {};
        for (const g of groups) {
          const key = g.folderId ?? "ungrouped";
          next[key] = prev[key] ?? true; // default open
        }
        return next;
      });
    }
  }, [groups]);

  const expandAll = () =>
    setOpenGroups(
      Object.fromEntries(
        groups.map((g) => [g.folderId ?? "ungrouped", true])
      )
    );

  const collapseAll = () =>
    setOpenGroups(
      Object.fromEntries(
        groups.map((g) => [g.folderId ?? "ungrouped", false])
      )
    );

  const handleSidebarNavigate = (folderId: string, requestId?: string) => {
    const targetId = requestId
      ? `endpoint-${requestId}`
      : `folder-${folderId}`;
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 size={20} className="animate-spin text-accent" />
        <p className="text-sm text-foreground-muted">
          Generating documentation...
        </p>
      </div>
    );
  }

  if (!selectedIds || selectedIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertTriangle size={24} className="text-amber-400" />
        <p className="text-sm font-medium text-foreground">
          No requests selected
        </p>
        <p className="text-xs text-foreground-muted">
          Please go back and select at least one request.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/api-docs")}
        >
          Back to Selection
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="hidden md:flex items-center justify-between px-4 md:px-8 py-4 border-b border-border sticky top-0 bg-background z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground-muted hover:text-foreground cursor-pointer"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <PanelLeft size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Contents
            </TooltipContent>
          </Tooltip>
          <h1 className="text-base font-semibold text-foreground">
            API Documentation Preview
          </h1>
          <span className="text-xs text-foreground-subtle">
            {totalEndpoints} endpoint{totalEndpoints !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-foreground-muted hover:text-foreground cursor-pointer"
                  onClick={expandAll}
                >
                  <ChevronsDownUp size={15} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Expand all
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-foreground-muted hover:text-foreground cursor-pointer"
                  onClick={collapseAll}
                >
                  <ChevronsUpDown size={15} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Collapse all
              </TooltipContent>
            </Tooltip>
          </div>
          <ExportPdfButton
            groups={groups}
            docTitle="API Documentation"
            docSummary={null}
          />
        </div>
      </div>

      {/* Mobile: info banner + PDF export only */}
      {isMobile && (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <div className="flex items-start gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg text-xs text-foreground-muted">
            <Info size={14} className="text-accent mt-0.5 shrink-0" />
            <span>
              The interactive preview is optimized for desktop. You can still export your documentation as a PDF.
            </span>
          </div>
          <div className="flex justify-center">
            <ExportPdfButton
              groups={groups}
              docTitle="API Documentation"
              docSummary={null}
            />
          </div>
        </div>
      )}

      {/* Desktop: Body with sidebar overlay */}
      {!isMobile && (
        <div className="relative flex-1 overflow-hidden">
          {/* Sidebar drawer */}
          {sidebarOpen && (
            <>
              <div
                className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="absolute left-0 top-0 h-full w-64 z-20 bg-panel border-r border-border flex flex-col shadow-xl animate-in slide-in-from-left duration-200">
                <SidebarNavigator
                  groups={groups}
                  openGroups={openGroups}
                  onNavigate={handleSidebarNavigate}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            </>
          )}

          {/* Main scrollable content */}
          <div className="h-full overflow-y-auto">
            {groups.map((group) => {
              const key = group.folderId ?? "ungrouped";
              return (
                <Collapsible
                  key={key}
                  open={openGroups[key]}
                  onOpenChange={(v) =>
                    setOpenGroups((prev) => ({ ...prev, [key]: v }))
                  }
                  className="group/collapsible"
                >
                  <CollapsibleTrigger
                    id={`folder-${key}`}
                    className="w-full flex items-center gap-3 px-4 md:px-8 py-4 border-b border-border hover:bg-raised/30 sticky top-0 z-[5] bg-background transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Folder size={15} className="text-accent" />
                      <h2 className="text-sm font-semibold text-foreground">
                        {group.folderName}
                      </h2>
                      <span className="text-xs text-foreground-subtle">
                        {group.requests.length} endpoint
                        {group.requests.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <ChevronDown
                      size={13}
                      className="text-foreground-subtle group-data-[state=open]/collapsible:rotate-180 transition-transform"
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    {group.requests.map((request) => (
                      <div key={request.id} id={`endpoint-${request.id}`}>
                        <EndpointCard request={request} />
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
