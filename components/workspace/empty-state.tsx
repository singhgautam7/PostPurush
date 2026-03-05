"use client";

import { Button } from "@/components/ui/button";
import { Plus, FolderPlus, Rocket } from "lucide-react";

export function EmptyState() {
  const handleNewRequest = () => {
    window.dispatchEvent(new CustomEvent("trigger-new-request", { detail: "root" }));
  };

  const handleNewFolder = () => {
    window.dispatchEvent(new CustomEvent("trigger-new-folder", { detail: "root" }));
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto text-center space-y-6">
      <div className="h-20 w-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-2 shadow-inner shadow-indigo-500/20">
        <Rocket className="h-10 w-10 text-indigo-500" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2 text-foreground">
          Start building requests
        </h2>
        <p className="text-sm text-muted-foreground/80">
          Create a new request or organize your API calls in folders.
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          onClick={handleNewRequest}
          className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-md shadow-indigo-500/20 px-6"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
        <Button onClick={handleNewFolder} variant="outline" className="px-6 border-border/50">
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </div>
    </div>
  );
}
