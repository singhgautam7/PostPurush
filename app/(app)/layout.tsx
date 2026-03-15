"use client";

import { useEffect } from "react";
import { MasterHeader } from "@/components/layout/master-header";
import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileWarningBanner } from "@/components/layout/mobile-warning-banner";
import { useRequestStore } from "@/store/request-store";
import { useEnvironmentStore } from "@/store/environment-store";
import { loadRequests, loadFolders } from "@/lib/storage/storage-helpers";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const setSavedRequests = useRequestStore((s) => s.setSavedRequests);
  const setFolders = useRequestStore((s) => s.setFolders);
  const initEnv = useEnvironmentStore((s) => s.init);

  useEffect(() => {
    const init = async () => {
      const folders = await loadFolders();
      setFolders(folders);
      const requests = await loadRequests();
      setSavedRequests(requests);
      await initEnv();
    };
    init();
  }, [setSavedRequests, setFolders, initEnv]);
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <MasterHeader />
      <MobileWarningBanner />
      <div className="flex flex-1 overflow-hidden">
        <NavigationSidebar />
        <main className="flex-1 overflow-hidden pb-14 md:pb-0">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
