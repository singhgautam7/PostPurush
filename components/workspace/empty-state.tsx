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
      <div className="w-12 h-12 rounded-full bg-zinc-800/60 flex items-center justify-center">
        <Rocket className="h-6 w-6 text-zinc-500" />
      </div>
      <div>
        <h2 className="text-base font-semibold tracking-tight mb-2 text-zinc-100">
          Start building requests
        </h2>
        <p className="text-sm text-zinc-500">
          Create a new request or organize your API calls in folders.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleNewRequest}
          className="bg-white text-zinc-900 hover:bg-zinc-100 font-medium px-6 shadow-none"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
        <Button onClick={handleNewFolder} variant="outline" className="px-6 bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </div>
    </div>
  );
}
