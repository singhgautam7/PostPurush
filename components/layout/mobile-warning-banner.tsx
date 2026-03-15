"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "postpurush-mobile-warning-dismissed";

export function MobileWarningBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!wasDismissed) setDismissed(false);
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="flex md:hidden items-center gap-2 bg-accent/15 border-b border-accent/30 text-foreground-muted text-xs px-4 py-2">
      <span className="flex-1">
        PostPurush is optimized for desktop. Some features may be limited on mobile.
      </span>
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded-sm p-0.5 hover:bg-accent/20 transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
