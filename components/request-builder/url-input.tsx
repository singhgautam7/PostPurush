"use client";

import { useRequestStore } from "@/store/request-store";
import { useResponseStore } from "@/store/response-store";
import { useEnvironmentStore } from "@/store/environment-store";
import { sendRequest } from "@/lib/request/send-request";
import { saveRequest } from "@/lib/storage/storage-helpers";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MethodSelector } from "./method-selector";
import { Send, Save, Code } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useTabStore } from "@/store/tab-store";

interface UrlInputProps {
  onCodeExport: () => void;
}

export function UrlInput({ onCodeExport }: UrlInputProps) {
  const activeRequest = useRequestStore((s) => s.activeRequest);
  const isDirty = useRequestStore((s) => s.isDirty);
  const setDirty = useRequestStore((s) => s.setDirty);
  const setUrl = useRequestStore((s) => s.setUrl);
  const addSavedRequest = useRequestStore((s) => s.addSavedRequest);
  const updateSavedRequest = useRequestStore((s) => s.updateSavedRequest);
  const savedRequests = useRequestStore((s) => s.savedRequests);
  const variables = useEnvironmentStore((s) => s.variables);
  const setResponse = useResponseStore((s) => s.setResponse);
  const setLoading = useResponseStore((s) => s.setLoading);
  const loading = useResponseStore((s) => s.loading);
  const [saving, setSaving] = useState(false);

  // Tab sync for dirty state or title update (handled via tabStore directly)
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const updateTab = useTabStore((s) => s.updateTab);

  const openTab = useTabStore((s) => s.openTab);
  const setActiveTab = useTabStore((s) => s.setActiveTab);
  const resetRequest = useRequestStore((s) => s.resetRequest);
  const clearResponse = useResponseStore((s) => s.clearResponse);

  // Sync tab isDirty when it changes
  useEffect(() => {
    if (activeTabId) {
      const activeTab = tabs.find((t) => t.id === activeTabId);
      if (activeTab && activeTab.isDirty !== isDirty) {
        updateTab(activeTabId, { isDirty });
      }
    }
  }, [isDirty, activeTabId, tabs, updateTab]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        // Since handleSave runs async and depends on state, we can use the dom button if cleaner,
        // but calling the function directly works as long as it handles the current closure correctly.
        document.getElementById("save-btn-trigger")?.click();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        const newId = `new-${crypto.randomUUID()}`;
        openTab(newId, "Untitled Request");
        setActiveTab(newId);
        resetRequest();
        clearResponse();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openTab, setActiveTab, resetRequest, clearResponse]);

  const handleSend = async () => {
    setLoading(true);
    const response = await sendRequest(activeRequest, variables);
    setResponse(response);
  };

  const handleSave = async () => {
    setSaving(true);
    const isNew = activeRequest.id.startsWith("new-");
    const updatedRequest = {
      ...activeRequest,
      id: isNew ? crypto.randomUUID() : activeRequest.id,
      updatedAt: Date.now(),
      name: activeRequest.name || "Untitled Request",
    };

    try {
      await saveRequest(updatedRequest);
      const exists = savedRequests.some((r) => r.id === updatedRequest.id);
      if (exists) {
        updateSavedRequest(updatedRequest);
      } else {
        addSavedRequest(updatedRequest);
      }
      setDirty(false); // Clear dirty state

      if (activeTabId) {
        updateTab(activeTabId, {
          title: updatedRequest.name,
          isDirty: false,
          requestId: updatedRequest.id, // Ensure the tab is linked to the new saved ID
        });
      }

      // If was completely new, load it into store so future saves update this record
      if (isNew) {
        useRequestStore.getState().loadRequest(updatedRequest);
      }
    } finally {
      setSaving(false);
    }
  };

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustHeight = () => {
    const target = textareaRef.current;
    if (target) {
      target.style.height = "2.5rem"; // h-10 reset equivalent
      target.style.height = `${Math.min(target.scrollHeight, 72)}px`; // Max 3 lines (~72px)
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [activeRequest.url]);

  return (
    <div className="flex items-center gap-2">
      <MethodSelector />
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={activeRequest.url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={adjustHeight}
          placeholder="e.g. https://api.example.com/endpoint"
          className="min-h-10 h-10 max-h-[72px] resize-none overflow-y-auto border-zinc-700 bg-zinc-900 pr-4 font-mono text-sm text-zinc-100 leading-tight placeholder:text-zinc-600 py-2.5 focus:ring-2 focus:ring-white/10 focus:border-zinc-500"
          style={{ height: activeRequest.url ? "auto" : "2.5rem" }}
        />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleSend}
            disabled={loading || !activeRequest.url}
            className="h-10 gap-2 bg-white text-zinc-900 hover:bg-zinc-100 font-medium shadow-none transition-all duration-200"
          >
            <Send className="h-4 w-4" />
            {loading ? "Sending..." : "Send"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Send Request (Enter)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            id="save-btn-trigger"
            onClick={handleSave}
            disabled={saving || !activeRequest.url}
            variant="outline"
            size="icon"
            className="h-10 w-10 bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <Save className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save Request</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onCodeExport}
            variant="outline"
            size="icon"
            className="h-10 w-10 bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <Code className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Generate Code Snippet</TooltipContent>
      </Tooltip>
    </div>
  );
}
