"use client";

import { useRequestStore } from "@/store/request-store";
import { useResponseStore } from "@/store/response-store";
import { useEnvironmentStore } from "@/store/environment-store";
import { sendRequest } from "@/lib/request/send-request";
import { EnvironmentVariable } from "@/types/environment";
import { saveRequest } from "@/lib/storage/storage-helpers";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MethodSelector } from "./method-selector";
import { Send, Save, Code } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTabStore } from "@/store/tab-store";
import { useVariableSuggestions } from "@/hooks/use-variable-suggestions";
import { hasInvalidVariables } from "@/lib/request/replace-variables";
import { toast } from "sonner";

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
  const activeEnv = useEnvironmentStore((s) => s.activeEnv);
  const currentEnv = activeEnv();
  const variables: EnvironmentVariable[] = currentEnv
    ? currentEnv.variables
        .filter((v) => v.enabled && v.key)
        .map((v) => ({ key: v.key, value: v.value }))
    : [];
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { isTriggered, suggestions, noEnvWarning, showNoEnvToast, highlightedHtml, currentEnv: hookEnv } =
    useVariableSuggestions(activeRequest.url, cursorPos);

  // Only render mirror when there are completed {{var}} tokens AND an env is active
  const hasVariableTokens = hookEnv && /\{\{[^}]+\}\}/.test(activeRequest.url);

  // Detect unresolvable {{variables}} across all request fields
  const hasAnyInvalidVar = useMemo(() => {
    const env = hookEnv;
    return (
      hasInvalidVariables(activeRequest.url, env) ||
      activeRequest.params.some((p) => hasInvalidVariables(p.value, env)) ||
      activeRequest.headers.some((h) => hasInvalidVariables(h.value, env)) ||
      hasInvalidVariables(activeRequest.body.content, env)
    );
  }, [activeRequest.url, activeRequest.params, activeRequest.headers, activeRequest.body.content, hookEnv]);

  // Show/hide suggestions based on hook state
  useEffect(() => {
    if (isTriggered && suggestions.length > 0) {
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [isTriggered, suggestions.length]);

  // Show toast when no env
  useEffect(() => {
    if (noEnvWarning) showNoEnvToast();
  }, [noEnvWarning, showNoEnvToast]);

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
    const resolvedRequest = {
      ...activeRequest,
      url: activeRequest.url,
    };
    setLoading(true);
    const response = await sendRequest(resolvedRequest, variables);
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

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "36px";
    const capped = Math.min(el.scrollHeight, 88);
    el.style.height = capped + "px";
    el.style.overflowY = el.scrollHeight > 88 ? "auto" : "hidden";
  };

  const syncScroll = () => {
    if (textareaRef.current && mirrorRef.current) {
      mirrorRef.current.scrollTop = textareaRef.current.scrollTop;
      mirrorRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const applySuggestion = useCallback(
    (key: string) => {
      const url = activeRequest.url;
      const before = url.slice(0, cursorPos).replace(/\{\{[^}]*$/, `{{${key}}}`);
      const after = url.slice(cursorPos);
      setUrl(before + after);
      setShowSuggestions(false);
      textareaRef.current?.focus();
    },
    [activeRequest.url, cursorPos, setUrl]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setUrl(val);
    setCursorPos(e.target.selectionStart ?? val.length);
    autoResize(e.target);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        applySuggestion(suggestions[selectedIndex].key);
        return;
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (hasAnyInvalidVar) {
        toast.error("Unresolved variables", {
          description: "Fix invalid {{variable}} references before sending.",
          duration: 4000,
        });
      } else {
        handleSend();
      }
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        textareaRef.current &&
        !textareaRef.current.parentElement?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (textareaRef.current) autoResize(textareaRef.current);
  }, [activeRequest.url]);

  return (
    <div className="flex items-start gap-2 overflow-hidden">
      <div className="shrink-0">
        <MethodSelector />
      </div>
      <div className="relative flex-1 min-w-0">
        {/* Mirror div — underneath textarea, renders {{var}} tokens in color */}
        {hasVariableTokens && (
          <div
            ref={mirrorRef}
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none min-h-9 max-h-[88px] overflow-hidden px-3 font-mono text-sm text-foreground leading-[22px] py-[7px] border border-transparent rounded-md whitespace-pre-wrap"
            style={{ wordBreak: "break-all" }}
            dangerouslySetInnerHTML={{ __html: highlightedHtml + "\u200b" }}
          />
        )}
        {/* Textarea — bg-transparent when mirror is active so colored spans show through */}
        <textarea
          ref={textareaRef}
          value={activeRequest.url}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={(e) => setCursorPos((e.target as HTMLTextAreaElement).selectionStart ?? 0)}
          onClick={(e) => setCursorPos((e.target as HTMLTextAreaElement).selectionStart ?? 0)}
          onScroll={syncScroll}
          placeholder="e.g. https://api.example.com/endpoint"
          rows={1}
          className={`relative w-full min-h-9 max-h-[88px] resize-none rounded-md border border-border-subtle px-3 font-mono text-sm leading-[22px] py-[7px] focus:outline-none focus:ring-2 focus:ring-border focus:border-border overflow-hidden placeholder:text-foreground-subtle ${
            hasVariableTokens ? "bg-transparent text-transparent caret-foreground" : "bg-panel text-foreground"
          }`}
          spellCheck={false}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-panel border border-border rounded-lg shadow-xl overflow-hidden">
            {suggestions.map((v, i) => (
              <button
                key={v.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applySuggestion(v.key);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs text-left transition-colors ${
                  i === selectedIndex ? "bg-raised" : "hover:bg-raised/50"
                }`}
              >
                <span className="font-mono text-blue-400">
                  {v.key}
                </span>
                <span className="text-foreground-subtle truncate">
                  {v.value}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                onClick={handleSend}
                disabled={loading || !activeRequest.url || hasAnyInvalidVar}
                className="h-9 gap-2 bg-primary-action text-primary-action-fg hover:bg-primary-action/85 font-medium shadow-none transition-all duration-200"
              >
                <Send className="h-4 w-4" />
                {loading ? "Sending..." : "Send"}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {hasAnyInvalidVar
              ? "Fix unresolved variable references before sending"
              : "Send Request (Enter)"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              id="save-btn-trigger"
              onClick={handleSave}
              disabled={saving || !activeRequest.url}
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-panel border-border-subtle text-foreground-muted hover:text-foreground hover:bg-raised"
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
              className="h-9 w-9 bg-panel border-border-subtle text-foreground-muted hover:text-foreground hover:bg-raised"
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
