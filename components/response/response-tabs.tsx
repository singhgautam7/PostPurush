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
        {activeTab === "body" && <BodyView />}
        {activeTab === "headers" && <HeadersView />}
      </div>
    </div>
  );
}
