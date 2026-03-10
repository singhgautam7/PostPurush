import { SavedRequest, Folder } from "@/types/request";

const METHOD_ORDER = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"];

export type DocsGroup = {
  folderName: string;
  folderId: string | null;
  requests: SavedRequest[];
};

function sortRequests(requests: SavedRequest[]): SavedRequest[] {
  return [...requests].sort((a, b) => {
    const urlCmp = a.url.localeCompare(b.url);
    if (urlCmp !== 0) return urlCmp;
    return METHOD_ORDER.indexOf(a.method) - METHOD_ORDER.indexOf(b.method);
  });
}

export function buildDocsGroups(
  requests: SavedRequest[],
  folders: Folder[]
): DocsGroup[] {
  const folderMap = new Map(folders.map((f) => [f.id, f]));

  const grouped = new Map<string | null, SavedRequest[]>();
  requests.forEach((r) => {
    const key = r.parentId ?? null;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  });

  const groups: DocsGroup[] = [];

  // Ungrouped first (if any)
  if (grouped.has(null)) {
    groups.push({
      folderName: "General",
      folderId: null,
      requests: sortRequests(grouped.get(null)!),
    });
  }

  // Folders — sorted alphabetically
  [...grouped.entries()]
    .filter(([key]) => key !== null)
    .sort(([a], [b]) => {
      const nameA = folderMap.get(a!)?.name ?? "";
      const nameB = folderMap.get(b!)?.name ?? "";
      return nameA.localeCompare(nameB);
    })
    .forEach(([folderId, reqs]) => {
      groups.push({
        folderName: folderMap.get(folderId!)?.name ?? "Unknown",
        folderId,
        requests: sortRequests(reqs),
      });
    });

  return groups;
}

/** Get all request IDs recursively inside a folder */
export function getAllRequestIdsInFolder(
  folderId: string,
  requests: SavedRequest[],
  folders: Folder[]
): string[] {
  const ids: string[] = [];
  // Direct children requests
  for (const r of requests) {
    if (r.parentId === folderId) ids.push(r.id);
  }
  // Recurse into child folders
  for (const f of folders) {
    if (f.parentId === folderId) {
      ids.push(...getAllRequestIdsInFolder(f.id, requests, folders));
    }
  }
  return ids;
}
