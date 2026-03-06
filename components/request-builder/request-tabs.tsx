"use client";

import { ParamsTab } from "./params-tab";
import { HeadersTab } from "./headers-tab";
import { BodyTab } from "./body-tab";
import { useRequestStore } from "@/store/request-store";
import { cn } from "@/lib/utils";
import { useState } from "react";

type TabValue = "params" | "headers" | "body";

export function RequestTabs() {
  const params = useRequestStore((s) => s.activeRequest.params);
  const headers = useRequestStore((s) => s.activeRequest.headers);
  const [activeTab, setActiveTab] = useState<TabValue>("params");

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
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-1 inline-flex">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-4 py-1.5 text-sm rounded-md transition-all flex items-center gap-1.5",
                activeTab === tab.value
                  ? "bg-zinc-700 text-zinc-100 font-medium"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-zinc-600 text-zinc-300 text-xs rounded-full px-1.5 py-0.5 leading-none">
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
