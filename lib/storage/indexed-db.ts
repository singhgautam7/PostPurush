import { openDB, DBSchema, IDBPDatabase } from "idb";
import { SavedRequest } from "@/types/request";
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
}

let dbPromise: Promise<IDBPDatabase<PostPurushDB>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<PostPurushDB>("postpurush-db", 1, {
            upgrade(db) {
                const requestStore = db.createObjectStore("requests", {
                    keyPath: "id",
                });
                requestStore.createIndex("by-updated", "updatedAt");

                db.createObjectStore("environments", {
                    keyPath: "id",
                });
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
