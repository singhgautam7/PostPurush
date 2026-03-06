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
      setDirty(false);
      if (activeTabId) {
        updateTab(activeTabId, {
          title: updatedRequest.name,
          isDirty: false,
          requestId: updatedRequest.id,
        });
      }
      if (isNew) {
        useRequestStore.getState().loadRequest(updatedRequest);
      }
    } finally {
      setSaving(false);
    }
  };

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    const lineHeight = 24;
    const maxHeight = lineHeight * 3 + 16;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    el.style.overflowY = el.scrollHeight > maxHeight ? "scroll" : "hidden";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) autoResize(textareaRef.current);
  }, [activeRequest.url]);

  return (
    <div className="flex items-start gap-2">
      <div className="mt-1">
        <MethodSelector />
      </div>
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={activeRequest.url}
          onChange={(e) => {
            setUrl(e.target.value);
            autoResize(e.target);
          }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. https://api.example.com/endpoint"
          rows={1}
          className="min-h-10 resize-none border-border-subtle bg-panel pr-4 font-mono text-sm text-foreground leading-6 placeholder:text-foreground-subtle py-2 focus:ring-2 focus:ring-border focus:border-border"
          spellCheck={false}
        />
      </div>

      <div className="flex items-center gap-2 mt-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleSend}
              disabled={loading || !activeRequest.url}
              className="h-10 gap-2 bg-primary-action text-primary-action-fg hover:bg-primary-action/85 font-medium shadow-none transition-all duration-200"
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
              className="h-10 w-10 bg-panel border-border-subtle text-foreground-muted hover:text-foreground hover:bg-raised"
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
              className="h-10 w-10 bg-panel border-border-subtle text-foreground-muted hover:text-foreground hover:bg-raised"
            >
              <Code className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Generate Code Snippet</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
