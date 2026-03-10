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
  ChevronLeft,
  ChevronDown,
  Download,
  Folder,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function ApiDocsPreviewPage() {
  const router = useRouter();
  const savedRequests = useRequestStore((s) => s.savedRequests);
  const folders = useRequestStore((s) => s.folders);

  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-between px-8 py-4 border-b border-border sticky top-0 bg-background z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5"
          >
            <ChevronLeft size={14} /> Back
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-base font-semibold text-foreground">
            API Documentation Preview
          </h1>
          <span className="text-xs text-foreground-subtle">
            {totalEndpoints} endpoint{totalEndpoints !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled
          >
            <Download size={13} /> Export PDF
            <span className="text-[10px] text-foreground-subtle ml-1">
              (coming soon)
            </span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <Collapsible
            key={group.folderId ?? "ungrouped"}
            defaultOpen
            className="group/collapsible"
          >
            <CollapsibleTrigger className="w-full flex items-center gap-3 px-8 py-4 border-b border-border hover:bg-raised/30 sticky top-0 z-[5] bg-background transition-colors cursor-pointer">
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
                <EndpointCard key={request.id} request={request} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
