"use client";

import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRequestStore } from "@/store/request-store";
import { saveFolder, saveRequest } from "@/lib/storage/storage-helpers";
import type { SavedRequest, Folder, HttpMethod } from "@/types/request";

const TESTING_FOLDER_NAME = "Testing APIs";

const TESTING_REQUESTS: {
  name: string;
  method: HttpMethod;
  url: string;
  description: string;
  body?: string;
  bodyType?: "json" | "raw" | "form";
}[] = [
  {
    name: "GET — List Users",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/users",
    description: "Fetch a list of all users",
  },
  {
    name: "POST — Create Post",
    method: "POST",
    url: "https://jsonplaceholder.typicode.com/posts",
    description: "Create a new post",
    body: JSON.stringify({ title: "Test Post", body: "Hello World", userId: 1 }, null, 2),
    bodyType: "json",
  },
  {
    name: "PUT — Replace Post",
    method: "PUT",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    description: "Replace an entire post by ID",
    body: JSON.stringify({ id: 1, title: "Updated Post", body: "Updated body", userId: 1 }, null, 2),
    bodyType: "json",
  },
  {
    name: "PATCH — Update Post",
    method: "PATCH",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    description: "Partially update a post by ID",
    body: JSON.stringify({ title: "Patched Title" }, null, 2),
    bodyType: "json",
  },
  {
    name: "DELETE — Remove Post",
    method: "DELETE",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    description: "Delete a post by ID",
  },
];

export function ExtrasPanel() {
  const folders = useRequestStore((s) => s.folders);
  const addFolder = useRequestStore((s) => s.addFolder);
  const addSavedRequest = useRequestStore((s) => s.addSavedRequest);

  const handleAddTestingRequests = async () => {
    const alreadyExists = folders.some(
      (f) => !f.parentId && f.name.trim().toLowerCase() === TESTING_FOLDER_NAME.toLowerCase()
    );

    if (alreadyExists) {
      toast.error("Testing folder already exists", {
        description: `A folder named "${TESTING_FOLDER_NAME}" is already in your collection.`,
        position: "top-right",
        duration: 4000,
      });
      return;
    }

    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: TESTING_FOLDER_NAME,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveFolder(newFolder);
    addFolder(newFolder);

    for (const req of TESTING_REQUESTS) {
      const savedReq: SavedRequest = {
        id: crypto.randomUUID(),
        name: req.name,
        description: req.description,
        method: req.method,
        url: req.url,
        params: [{ key: "", value: "" }],
        headers: [{ key: "", value: "" }],
        body: {
          type: req.bodyType ?? "json",
          content: req.body ?? "",
          formData: [{ key: "", value: "" }],
        },
        parentId: newFolder.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveRequest(savedReq);
      addSavedRequest(savedReq);
    }

    toast.success(`"${TESTING_FOLDER_NAME}" created`, {
      description: `${TESTING_REQUESTS.length} sample requests added — one per HTTP method.`,
      position: "top-right",
      duration: 4000,
    });
  };

  return (
    <div className="px-3 py-1.5">
      <button
        onClick={handleAddTestingRequests}
        className={cn(
          "w-full flex items-center gap-2 px-2.5 py-1.5",
          "rounded-md border border-border cursor-pointer",
          "bg-panel hover:bg-raised",
          "text-xs text-foreground-nav hover:text-foreground",
          "transition-colors duration-100",
          "text-left group"
        )}
      >
        <FlaskConical
          size={12}
          className="text-foreground-subtle group-hover:text-foreground transition-colors flex-shrink-0"
        />
        <span className="flex-1 truncate">Add Testing APIs</span>
      </button>
    </div>
  );
}
