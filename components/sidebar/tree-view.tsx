"use client";

import { useMemo, useState, useEffect } from "react";
import { Folder, SavedRequest } from "@/types/request";
import { useRequestStore } from "@/store/request-store";
import { useTabStore } from "@/store/tab-store";
import { useResponseStore, restoreResponseFromCache } from "@/store/response-store";
import { TreeItem } from "./tree-item";
import { createDefaultRequest } from "@/store/request-store";
import { saveFolder, saveRequest } from "@/lib/storage/storage-helpers";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable
} from "@dnd-kit/core";

type TreeNode = {
  id: string;
  name: string;
  type: "folder" | "request";
  parentId?: string;
  request?: SavedRequest;
  folder?: Folder;
  children: TreeNode[];
};

function buildTree(folders: Folder[], requests: SavedRequest[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();

  folders.forEach((f) => {
    nodeMap.set(f.id, { id: f.id, name: f.name, type: "folder", folder: f, parentId: f.parentId, children: [] });
  });

  requests.forEach((r) => {
    nodeMap.set(r.id, { id: r.id, name: r.name, type: "request", request: r, parentId: r.parentId, children: [] });
  });

  const rootNodes: TreeNode[] = [];

  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(n => sortNodes(n.children));
  };

  sortNodes(rootNodes);
  return rootNodes;
}

export function TreeView() {
  const folders = useRequestStore((s) => s.folders);
  const requests = useRequestStore((s) => s.savedRequests);
  const addFolder = useRequestStore((s) => s.addFolder);
  const updateDBFolder = useRequestStore((s) => s.updateFolder);
  const addSavedRequest = useRequestStore((s) => s.addSavedRequest);
  const updateSavedRequest = useRequestStore((s) => s.updateSavedRequest);

  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const tree = useMemo(() => buildTree(folders, requests), [folders, requests]);

  const toggleFolder = (id: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNewFolder = async (parentId?: string) => {
    const folder: Folder = {
      id: crypto.randomUUID(),
      name: "New Folder",
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveFolder(folder);
    addFolder(folder);
    if (parentId) setOpenFolders(prev => new Set(prev).add(parentId));
  };

  const openTab = useTabStore((s) => s.openTab);
  const loadRequest = useRequestStore((s) => s.loadRequest);
  const clearResponse = useResponseStore((s) => s.clearResponse);

  const handleNewRequest = async (parentId?: string) => {
    const req = createDefaultRequest();
    req.parentId = parentId;
    await saveRequest(req);
    addSavedRequest(req);
    if (parentId) setOpenFolders(prev => new Set(prev).add(parentId));
    openTab(req.id, req.name);
    loadRequest(req);
    clearResponse();
  };

  useEffect(() => {
    const onNewFolder = (e: any) => handleNewFolder(e.detail === "root" ? undefined : e.detail);
    const onNewRequest = (e: any) => handleNewRequest(e.detail === "root" ? undefined : e.detail);
    const onCollapseAll = () => setOpenFolders(new Set());
    const onExpandAll = () => setOpenFolders(new Set(folders.map(f => f.id)));

    window.addEventListener("trigger-new-folder", onNewFolder);
    window.addEventListener("trigger-new-request", onNewRequest);
    window.addEventListener("trigger-collapse-all", onCollapseAll);
    window.addEventListener("trigger-expand-all", onExpandAll);

    return () => {
      window.removeEventListener("trigger-new-folder", onNewFolder);
      window.removeEventListener("trigger-new-request", onNewRequest);
      window.removeEventListener("trigger-collapse-all", onCollapseAll);
      window.removeEventListener("trigger-expand-all", onExpandAll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folders, openTab, loadRequest, clearResponse]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isOpen = openFolders.has(node.id);
    return (
      <div key={node.id}>
        <TreeItem
          item={node}
          depth={depth}
          isOpen={isOpen}
          onToggle={() => toggleFolder(node.id)}
          onNewFolder={handleNewFolder}
          onNewRequest={handleNewRequest}
        />
        {isOpen && node.children.length > 0 && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const targetId = over.id === "root" ? undefined : (over.id as string);
    const draggedId = active.id as string;

    const request = requests.find(r => r.id === draggedId);
    if (request) {
      if (request.parentId === targetId) return;
      const updated = { ...request, parentId: targetId, updatedAt: Date.now() };
      await saveRequest(updated);
      updateSavedRequest(updated);
      return;
    }

    const folder = folders.find(f => f.id === draggedId);
    if (folder) {
      if (folder.parentId === targetId) return;
      const updated = { ...folder, parentId: targetId, updatedAt: Date.now() };
      await saveFolder(updated);
      updateDBFolder(updated);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={(e) => { handleDragEnd(e); setActiveId(null); }}
    >
      <div className="flex flex-col text-sm">
        <div className="w-full group/tree pb-4">
          <TreeDroppableRoot id="root">
            {tree.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-foreground-subtle">
                No requests yet.<br />Create a new request or folder to begin.
              </div>
            ) : (
              tree.map(node => renderNode(node, 0))
            )}
          </TreeDroppableRoot>
        </div>
      </div>
      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeId ? (
          <div className="px-2 py-1 text-xs bg-raised text-foreground-muted border border-border-subtle rounded shadow-md backdrop-blur-sm truncate max-w-[200px]">
            Moving item...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function TreeDroppableRoot({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="min-h-[100px] w-full">
      {children}
    </div>
  );
}
