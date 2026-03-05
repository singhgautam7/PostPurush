"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Workspace } from "@/components/layout/workspace";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-border/50 overflow-hidden">
        <Sidebar />
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden">
        <Workspace />
      </main>
    </div>
  );
}
