"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRequestStore } from "@/store/request-store";
import { getAllRequestIdsInFolder } from "@/lib/docs-builder";
import { SelectionTree } from "@/components/api-docs/selection-tree";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Info, ChevronRight, BookOpen } from "lucide-react";

export default function ApiDocsPage() {
  const router = useRouter();
  const savedRequests = useRequestStore((s) => s.savedRequests);
  const folders = useRequestStore((s) => s.folders);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const totalRequestCount = savedRequests.length;

  const toggleRequest = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const getFolderState = useCallback(
    (folderId: string): "checked" | "indeterminate" | "unchecked" => {
      const allIds = getAllRequestIdsInFolder(
        folderId,
        savedRequests,
        folders
      );
      if (allIds.length === 0) return "unchecked";
      const selectedCount = allIds.filter((id) => selectedIds.has(id)).length;
      if (selectedCount === 0) return "unchecked";
      if (selectedCount === allIds.length) return "checked";
      return "indeterminate";
    },
    [savedRequests, folders, selectedIds]
  );

  const toggleFolder = useCallback(
    (folderId: string) => {
      const allIds = getAllRequestIdsInFolder(
        folderId,
        savedRequests,
        folders
      );
      const state = getFolderState(folderId);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (state === "checked") {
          allIds.forEach((id) => next.delete(id));
        } else {
          allIds.forEach((id) => next.add(id));
        }
        return next;
      });
    },
    [savedRequests, folders, getFolderState]
  );

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(savedRequests.map((r) => r.id)));
  }, [savedRequests]);

  const handleNext = () => {
    sessionStorage.setItem(
      "postpurush-docs-selection",
      JSON.stringify([...selectedIds])
    );
    router.push("/api-docs/preview");
  };

  // Empty state
  if (totalRequestCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <BookOpen size={32} className="text-foreground-subtle" />
        <p className="text-sm font-medium text-foreground">
          No requests in your collection
        </p>
        <p className="text-xs text-foreground-muted">
          Add requests to your collections first, then come back to generate
          docs.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/")}
        >
          Go to Collections
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 md:px-8 py-6 border-b border-border shrink-0">
        <h1 className="text-2xl font-semibold text-foreground">
          Create API Documentation
        </h1>
        <p className="text-sm text-foreground-muted mt-1 leading-relaxed max-w-2xl">
          Select the requests you want to include in your documentation.
          Folders, request names, descriptions, params, headers, and body
          schemas will all be included automatically.
        </p>
        <div className="flex items-start gap-2 mt-3 p-3 bg-accent/8 border border-accent/20 rounded-lg text-xs text-foreground-muted max-w-2xl">
          <Info size={13} className="text-accent mt-0.5 shrink-0" />
          <span>
            APIs will be sorted by{" "}
            <strong className="text-foreground">folder</strong>, then by{" "}
            <strong className="text-foreground">URL</strong>, then by{" "}
            <strong className="text-foreground">method</strong> in the
            generated docs. Select a folder to automatically include all
            requests inside it.
          </span>
        </div>
      </div>

      {/* Select all bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-panel shrink-0">
        <Checkbox
          checked={selectedIds.size === totalRequestCount}
          onCheckedChange={(v) =>
            v ? selectAll() : setSelectedIds(new Set())
          }
        />
        <span className="text-xs text-foreground-muted">
          Select all ({totalRequestCount} request
          {totalRequestCount !== 1 ? "s" : ""})
        </span>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto min-h-0 pb-14 md:pb-0">
        <SelectionTree
          requests={savedRequests}
          folders={folders}
          selectedIds={selectedIds}
          onToggleRequest={toggleRequest}
          onToggleFolder={toggleFolder}
          getFolderState={getFolderState}
        />
      </div>

      {/* Sticky bottom bar */}
      <div className="shrink-0 sticky bottom-0 border-t border-border bg-background px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-muted">
            {selectedIds.size > 0
              ? `${selectedIds.size} request${selectedIds.size !== 1 ? "s" : ""} will be included`
              : "Select at least one request to continue"}
          </span>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-foreground-muted hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <Button
          disabled={selectedIds.size === 0}
          onClick={handleNext}
          className="gap-1.5 cursor-pointer"
        >
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
