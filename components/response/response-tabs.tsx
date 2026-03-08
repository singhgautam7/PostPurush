"use client";

import { BodyView } from "./body-view";
import { HeadersView } from "./headers-view";
import { useResponseStore } from "@/store/response-store";
import { cn } from "@/lib/utils";
import { useState } from "react";

type TabValue = "body" | "headers";

export function ResponseTabs() {
  const response = useResponseStore((s) => s.response);
  const [activeTab, setActiveTab] = useState<TabValue>("body");

  const headerCount = response ? Object.keys(response.headers).length : 0;

  const tabs: { value: TabValue; label: string; count?: number }[] = [
    { value: "body", label: "Body" },
    { value: "headers", label: "Headers", count: headerCount },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Level 1 — Pill/Segment toggle */}
      <div className="px-4 py-2 shrink-0">
        <div className="bg-panel border border-border rounded-md p-0.5 inline-flex">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-3 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1.5",
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
        {activeTab === "body" && <BodyView />}
        {activeTab === "headers" && <HeadersView />}
      </div>
    </div>
  );
}
