"use client";

import { MasterHeader } from "@/components/layout/master-header";
import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { CollectionsView } from "@/features/collections/collections-view";
import { EnvList } from "@/components/environment/env-list";
import { WipPlaceholder } from "@/features/wip-placeholder";
import { useNavigationStore } from "@/store/navigation-store";

const sectionTitles: Record<string, string> = {
  testing: "Testing",
  docs: "API Docs",
  analytics: "Analytics",
  env: "Environments",
  help: "Help",
  settings: "Settings",
};

export default function Home() {
  const activeSection = useNavigationStore((s) => s.activeSection);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <MasterHeader />
      <div className="flex flex-1 overflow-hidden">
        <NavigationSidebar />
        <main className="flex-1 overflow-hidden">
          {activeSection === "collections" ? (
            <CollectionsView />
          ) : activeSection === "env" ? (
            <EnvList />
          ) : (
            <WipPlaceholder title={sectionTitles[activeSection] ?? activeSection} />
          )}
        </main>
      </div>
    </div>
  );
}
