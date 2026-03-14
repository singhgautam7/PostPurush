"use client";

import { ParamsTab } from "./params-tab";
import { HeadersTab } from "./headers-tab";
import { BodyTab } from "./body-tab";
import { useRequestStore } from "@/store/request-store";
import { cn } from "@/lib/utils";
import { useCollectionSize, TAB_SIZES } from "@/hooks/use-collection-size";
import { useState } from "react";

type TabValue = "params" | "headers" | "body";

export function RequestTabs() {
  const params = useRequestStore((s) => s.activeRequest.params);
  const headers = useRequestStore((s) => s.activeRequest.headers);
  const [activeTab, setActiveTab] = useState<TabValue>("params");

  const collectionSize = useCollectionSize();
  const activeParamCount = params.filter((p) => p.key).length;
  const activeHeaderCount = headers.filter((h) => h.key).length;

  const tabs: { value: TabValue; label: string; count?: number }[] = [
    { value: "params", label: "Params", count: activeParamCount },
    { value: "headers", label: "Headers", count: activeHeaderCount },
    { value: "body", label: "Body" },
  ];

  return (
    <div className="w-full flex flex-col h-full">
      {/* Level 1 — Pill/Segment toggle */}
      <div className="px-4 py-2">
        <div className="bg-panel border border-border rounded-md p-0.5 inline-flex">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                `px-3 py-1 ${TAB_SIZES[collectionSize] ?? "text-xs"} rounded-md font-medium transition-all flex items-center gap-1.5`,
                activeTab === tab.value
                  ? "bg-raised text-foreground shadow-sm"
                  : "text-foreground-subtle hover:bg-raised/50 hover:text-foreground-muted"
              )}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 bg-primary/15 text-primary text-[10px] font-semibold rounded-full px-1.5 py-px leading-none">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "params" && <ParamsTab />}
        {activeTab === "headers" && <HeadersTab />}
        {activeTab === "body" && <BodyTab />}
      </div>
    </div>
  );
}
