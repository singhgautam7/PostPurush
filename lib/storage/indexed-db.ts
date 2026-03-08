import { openDB, DBSchema, IDBPDatabase } from "idb";
import { SavedRequest, Folder } from "@/types/request";
import { Environment, EnvironmentVariable } from "@/types/environment";

interface PostPurushDB extends DBSchema {
    requests: {
        key: string;
        value: SavedRequest;
        indexes: { "by-updated": number };
    };
    environments: {
        key: string;
        value: Environment;
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
        dbPromise = openDB<PostPurushDB>("postpurush-db", 4, {
            upgrade(db, oldVersion, _newVersion, transaction) {
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

                // v4: Migration from old single-environment is handled post-open
                // (see migrateV3ToV4 below)
            },
        });
    }
    return dbPromise;
}

// v4 migration: convert old single "default" env to new multi-env format
let migrated = false;
async function migrateV3ToV4() {
    if (migrated) return;
    migrated = true;
    const db = await getDB();
    try {
        const oldEnv = await db.get("environments", "default" as any);
        if (oldEnv) {
            const oldData = oldEnv as unknown as { id: string; variables: EnvironmentVariable[] };
            await db.delete("environments", "default" as any);
            if (oldData.variables?.length) {
                const validVars = oldData.variables.filter((v) => v.key);
                if (validVars.length > 0) {
                    const now = Date.now();
                    const env: Environment = {
                        id: crypto.randomUUID(),
                        name: "Default",
                        variables: validVars.map((v) => ({
                            id: crypto.randomUUID(),
                            key: v.key,
                            value: v.value,
                            enabled: true,
                        })),
                        createdAt: now,
                        updatedAt: now,
                    };
                    await db.put("environments", env);
                }
            }
        }
    } catch {
        // Migration already done or not needed
    }
}

// === Requests ===

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

// === Environments (multi-environment) ===

export async function saveEnvironmentToDB(env: Environment): Promise<void> {
    const db = await getDB();
    await db.put("environments", env);
}

export async function loadEnvironmentsFromDB(): Promise<Environment[]> {
    await migrateV3ToV4();
    const db = await getDB();
    return db.getAll("environments");
}

export async function deleteEnvironmentFromDB(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("environments", id);
}

// === Folders ===

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
    await db.delete("folders", id);
}
