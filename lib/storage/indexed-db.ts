import { openDB, DBSchema, IDBPDatabase } from "idb";
import { SavedRequest, Folder } from "@/types/request";
import { EnvironmentVariable } from "@/types/environment";

interface PostPurushDB extends DBSchema {
    requests: {
        key: string;
        value: SavedRequest;
        indexes: { "by-updated": number };
    };
    environments: {
        key: string;
        value: { id: string; variables: EnvironmentVariable[] };
    };
    folders: {
        key: string;
        value: Folder;
        indexes: { "by-updated": number };
    };
}

let dbPromise: Promise<IDBPDatabase<PostPurushDB>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<PostPurushDB>("postpurush-db", 3, {
            upgrade(db, oldVersion, newVersion, transaction) {
                if (oldVersion < 1) {
                    const requestStore = db.createObjectStore("requests", {
                        keyPath: "id",
                    });
                    requestStore.createIndex("by-updated", "updatedAt");

                    db.createObjectStore("environments", {
                        keyPath: "id",
                    });
                }

                if (oldVersion < 2) {
                    if (!db.objectStoreNames.contains("folders")) {
                        const folderStore = db.createObjectStore("folders", {
                            keyPath: "id",
                        });
                        folderStore.createIndex("by-updated", "updatedAt");
                    }
                }

                if (oldVersion < 3) {
                    if (db.objectStoreNames.contains("folders")) {
                        const folderStore = transaction.objectStore("folders");
                        if (!folderStore.indexNames.contains("by-updated")) {
                            folderStore.createIndex("by-updated", "updatedAt");
                        }
                    } else {
                        const folderStore = db.createObjectStore("folders", {
                            keyPath: "id",
                        });
                        folderStore.createIndex("by-updated", "updatedAt");
                    }
                }
            },
        });
    }
    return dbPromise;
}

export async function saveRequestToDB(request: SavedRequest): Promise<void> {
    const db = await getDB();
    await db.put("requests", request);
}

export async function loadRequestsFromDB(): Promise<SavedRequest[]> {
    const db = await getDB();
    const requests = await db.getAllFromIndex("requests", "by-updated");
    return requests.reverse();
}

export async function deleteRequestFromDB(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("requests", id);
}

export async function saveEnvironmentToDB(
    variables: EnvironmentVariable[]
): Promise<void> {
    const db = await getDB();
    await db.put("environments", { id: "default", variables });
}

export async function loadEnvironmentFromDB(): Promise<EnvironmentVariable[]> {
    const db = await getDB();
    const env = await db.get("environments", "default");
    return env?.variables ?? [{ key: "", value: "" }];
}

export async function saveFolderToDB(folder: Folder): Promise<void> {
    const db = await getDB();
    await db.put("folders", folder);
}

export async function loadFoldersFromDB(): Promise<Folder[]> {
    const db = await getDB();
    const folders = await db.getAllFromIndex("folders", "by-updated");
    return folders.reverse();
}

export async function deleteFolderFromDB(id: string): Promise<void> {
    const db = await getDB();
    // In a real app we might also want to delete child requests or delete child folders recursively,
    // but we can handle that logic in the store or helper.
    await db.delete("folders", id);
}
