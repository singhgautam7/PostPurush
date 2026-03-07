"use client";

import { useRequestStore } from "@/store/request-store";
import { useTabStore } from "@/store/tab-store";
import { useEffect, useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";

export function RequestMeta() {
  const activeRequest = useRequestStore((s) => s.activeRequest);
  const updateActiveRequest = useRequestStore((s) => s.updateActiveRequest);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const updateTab = useTabStore((s) => s.updateTab);

  const [title, setTitle] = useState(activeRequest.name);
  const [description, setDescription] = useState(activeRequest.description || "");

  useEffect(() => {
    setTitle(activeRequest.name);
    setDescription(activeRequest.description || "");
  }, [activeRequest.id, activeRequest.name, activeRequest.description]);

  const handleTitleBlur = () => {
    const newTitle = title.trim() || "Untitled Request";
    setTitle(newTitle);
    updateActiveRequest({ name: newTitle });
    if (activeTabId) {
      updateTab(activeTabId, { title: newTitle, isDirty: true });
    }
  };

  const handleDescriptionBlur = () => {
    const newDesc = description.trim();
    setDescription(newDesc);
    updateActiveRequest({ description: newDesc });
    if (activeTabId && newDesc !== activeRequest.description) {
      updateTab(activeTabId, { isDirty: true });
    }
  };

  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="text-base font-semibold bg-transparent border-none outline-none focus:ring-0 text-foreground placeholder:text-foreground-subtle w-full"
        placeholder="Untitled Request"
      />
      <ReactTextareaAutosize
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={handleDescriptionBlur}
        minRows={1}
        className="text-sm text-foreground-muted resize-none bg-transparent border-none outline-none focus:ring-0 placeholder:text-foreground-subtle w-full leading-relaxed"
        placeholder="Add a description..."
      />
    </div>
  );
}
