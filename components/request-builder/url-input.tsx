"use client";

import { useRequestStore } from "@/store/request-store";
import { useResponseStore } from "@/store/response-store";
import { useEnvironmentStore } from "@/store/environment-store";
import { sendRequest } from "@/lib/request/send-request";
import { saveRequest } from "@/lib/storage/storage-helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MethodSelector } from "./method-selector";
import { Send, Save, Code } from "lucide-react";
import { useState } from "react";

interface UrlInputProps {
  onCodeExport: () => void;
}

export function UrlInput({ onCodeExport }: UrlInputProps) {
  const activeRequest = useRequestStore((s) => s.activeRequest);
  const setUrl = useRequestStore((s) => s.setUrl);
  const addSavedRequest = useRequestStore((s) => s.addSavedRequest);
  const updateSavedRequest = useRequestStore((s) => s.updateSavedRequest);
  const savedRequests = useRequestStore((s) => s.savedRequests);
  const variables = useEnvironmentStore((s) => s.variables);
  const setResponse = useResponseStore((s) => s.setResponse);
  const setLoading = useResponseStore((s) => s.setLoading);
  const loading = useResponseStore((s) => s.loading);
  const [saving, setSaving] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    const response = await sendRequest(activeRequest, variables);
    setResponse(response);
  };

  const handleSave = async () => {
    setSaving(true);
    const updatedRequest = {
      ...activeRequest,
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
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <MethodSelector />
      <div className="relative flex-1">
        <Input
          value={activeRequest.url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter URL or paste text (e.g. https://api.example.com/endpoint)"
          className="h-10 border-border/50 bg-muted/50 pr-4 font-mono text-sm placeholder:text-muted-foreground/50"
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={loading || !activeRequest.url}
        className="h-10 gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-md shadow-indigo-500/20 transition-all duration-200"
      >
        <Send className="h-4 w-4" />
        {loading ? "Sending..." : "Send"}
      </Button>
      <Button
        onClick={handleSave}
        disabled={saving || !activeRequest.url}
        variant="outline"
        size="icon"
        className="h-10 w-10 border-border/50"
      >
        <Save className="h-4 w-4" />
      </Button>
      <Button
        onClick={onCodeExport}
        variant="outline"
        size="icon"
        className="h-10 w-10 border-border/50"
      >
        <Code className="h-4 w-4" />
      </Button>
    </div>
  );
}
