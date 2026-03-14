import { openDB, DBSchema, IDBPDatabase } from "idb";
import { SavedRequest, Folder } from "@/types/request";
import { Environment, EnvironmentVariable } from "@/types/environment";
import { ResponseMetadata } from "@/types/response-metadata";
import { TestRun } from "@/types/testing";

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
    responses_metadata: {
        key: string;
        value: ResponseMetadata[];
    };
    test_runs: {
        key: string;
        value: TestRun;
        indexes: { "by-start-time": number };
    };
}

let dbPromise: Promise<IDBPDatabase<PostPurushDB>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<PostPurushDB>("postpurush-db", 6, {
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

                if (oldVersion < 5) {
                    if (!db.objectStoreNames.contains("responses_metadata")) {
                        db.createObjectStore("responses_metadata");
                    }
                }

                if (oldVersion < 6) {
                    if (!db.objectStoreNames.contains("test_runs")) {
                        const testRunStore = db.createObjectStore("test_runs", {
                            keyPath: "id",
                        });
                        testRunStore.createIndex("by-start-time", "startTime");
                    }
                }
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
        const oldEnv = await db.get("environments", "default");
        if (oldEnv) {
            const oldData = oldEnv as unknown as { id: string; variables: EnvironmentVariable[] };
            await db.delete("environments", "default");
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

function stripTransientFields(request: SavedRequest): SavedRequest {
    const stripRevealed = (pairs: typeof request.params) =>
        pairs.map(({ _revealed, ...rest }) => rest);
    return {
        ...request,
        params: stripRevealed(request.params),
        headers: stripRevealed(request.headers),
        body: {
            ...request.body,
            formData: stripRevealed(request.body.formData),
        },
    };
}

export async function saveRequestToDB(request: SavedRequest): Promise<void> {
    const db = await getDB();
    await db.put("requests", stripTransientFields(request));
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

// === Response Metadata ===

export async function saveResponseMetadataToDB(
    requestId: string,
    record: ResponseMetadata
): Promise<void> {
    const db = await getDB();
    const tx = db.transaction("responses_metadata", "readwrite");
    const existing: ResponseMetadata[] =
        (await tx.store.get(requestId)) ?? [];
    const updated = [...existing, record].slice(-100);
    await tx.store.put(updated, requestId);
    await tx.done;
}

export async function loadResponseMetadataFromDB(
    requestId: string
): Promise<ResponseMetadata[]> {
    const db = await getDB();
    return (await db.get("responses_metadata", requestId)) ?? [];
}

export async function clearAllResponseMetadataFromDB(): Promise<void> {
    const db = await getDB();
    await db.clear("responses_metadata");
}

export async function loadAllResponseMetadataFromDB(): Promise<
    (ResponseMetadata & { requestId: string })[]
> {
    const db = await getDB();
    const tx = db.transaction("responses_metadata", "readonly");
    const store = tx.store;
    let cursor = await store.openCursor();
    const flat: (ResponseMetadata & { requestId: string })[] = [];
    while (cursor) {
        const requestId = cursor.key as string;
        const records = cursor.value as ResponseMetadata[];
        for (const r of records) {
            flat.push({ ...r, requestId });
        }
        cursor = await cursor.continue();
    }
    flat.sort((a, b) => b.startTime - a.startTime);
    return flat;
}

// === Test Runs ===

export async function saveTestRunToDB(run: TestRun): Promise<void> {
    const db = await getDB();
    await db.put("test_runs", run);
}

export async function loadAllTestRunsFromDB(): Promise<TestRun[]> {
    const db = await getDB();
    const runs = await db.getAllFromIndex("test_runs", "by-start-time");
    return runs.reverse();
}

export async function deleteTestRunFromDB(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("test_runs", id);
}

export async function clearAllTestRunsFromDB(): Promise<void> {
    const db = await getDB();
    await db.clear("test_runs");
}

// === Import / Export helpers ===
export async function clearAndImportRequests(requests: SavedRequest[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction("requests", "readwrite");
    await tx.store.clear();
    for (const r of requests) {
        await tx.store.put(r);
    }
    await tx.done;
}

export async function clearAndImportFolders(folders: Folder[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction("folders", "readwrite");
    await tx.store.clear();
    for (const f of folders) {
        await tx.store.put(f);
    }
    await tx.done;
}

export async function clearAndImportEnvironments(envs: Environment[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction("environments", "readwrite");
    await tx.store.clear();
    for (const e of envs) {
        await tx.store.put(e);
    }
    await tx.done;
}

export async function loadAllResponseMetadataRawFromDB(): Promise<Map<string, ResponseMetadata[]>> {
    const db = await getDB();
    const tx = db.transaction("responses_metadata", "readonly");
    const store = tx.store;
    let cursor = await store.openCursor();
    const map = new Map<string, ResponseMetadata[]>();
    while (cursor) {
        map.set(cursor.key as string, cursor.value as ResponseMetadata[]);
        cursor = await cursor.continue();
    }
    return map;
}

export async function clearAndImportResponseMetadata(data: Map<string, ResponseMetadata[]>): Promise<void> {
    const db = await getDB();
    const tx = db.transaction("responses_metadata", "readwrite");
    await tx.store.clear();
    for (const [key, records] of data) {
        await tx.store.put(records, key);
    }
    await tx.done;
}

export async function clearAndImportTestRuns(runs: TestRun[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction("test_runs", "readwrite");
    await tx.store.clear();
    for (const r of runs) {
        await tx.store.put(r);
    }
    await tx.done;
}

export async function clearAllRequestsFromDB(): Promise<void> {
    const db = await getDB();
    await db.clear("requests");
}

export async function clearAllFoldersFromDB(): Promise<void> {
    const db = await getDB();
    await db.clear("folders");
}

export async function clearAllEnvironmentsFromDB(): Promise<void> {
    const db = await getDB();
    await db.clear("environments");
}

export async function clearAllStores(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(
        ["requests", "folders", "environments", "responses_metadata", "test_runs"],
        "readwrite"
    );
    await Promise.all([
        tx.objectStore("requests").clear(),
        tx.objectStore("folders").clear(),
        tx.objectStore("environments").clear(),
        tx.objectStore("responses_metadata").clear(),
        tx.objectStore("test_runs").clear(),
    ]);
    await tx.done;
}
