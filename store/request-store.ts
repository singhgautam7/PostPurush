import { create } from "zustand";
import { HttpMethod, KeyValuePair, RequestBody, SavedRequest, Folder } from "@/types/request";
import { extractQueryParams, applyQueryParamsToUrl } from "@/lib/request/sync-query";

interface RequestState {
    activeRequest: SavedRequest;
    savedRequests: SavedRequest[];
    folders: Folder[];
    setMethod: (method: HttpMethod) => void;
    setUrl: (url: string) => void;
    setName: (name: string) => void;
    setParams: (params: KeyValuePair[]) => void;
    setHeaders: (headers: KeyValuePair[]) => void;
    setBody: (body: RequestBody) => void;
    updateActiveRequest: (updates: Partial<SavedRequest>) => void;
    loadRequest: (request: SavedRequest) => void;
    resetRequest: () => void;
    setSavedRequests: (requests: SavedRequest[]) => void;
    addSavedRequest: (request: SavedRequest) => void;
    updateSavedRequest: (request: SavedRequest) => void;
    removeSavedRequest: (id: string) => void;
    setFolders: (folders: Folder[]) => void;
    addFolder: (folder: Folder) => void;
    updateFolder: (folder: Folder) => void;
    removeFolder: (id: string) => void;
    isDirty: boolean;
    setDirty: (dirty: boolean) => void;
}

export const createDefaultRequest = (): SavedRequest => {
    let timeout: number | undefined;
    let defaultHeaders: KeyValuePair[] = [];

    if (typeof window !== "undefined") {
        try {
            const raw = localStorage.getItem("postpurush-request-defaults");
            if (raw) {
                const defaults = JSON.parse(raw);
                if (typeof defaults.timeout === "number") timeout = defaults.timeout;
                if (Array.isArray(defaults.headers)) {
                    defaultHeaders = defaults.headers.filter(
                        (h: KeyValuePair) => h.key
                    );
                }
            }
        } catch {
            // ignore malformed JSON
        }
    }

    return {
        id: crypto.randomUUID(),
        name: "Untitled Request",
        description: "",
        method: "GET",
        url: "",
        params: [{ key: "", value: "" }],
        headers: [...defaultHeaders, { key: "", value: "" }],
        body: { type: "json", content: "", formData: [{ key: "", value: "" }] },
        timeout,
        parentId: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
};

export const useRequestStore = create<RequestState>((set) => ({
    activeRequest: createDefaultRequest(),
    savedRequests: [],
    isDirty: false,

    setDirty: (dirty) => set({ isDirty: dirty }),

    setMethod: (method) =>
        set((state) => ({
            activeRequest: { ...state.activeRequest, method, updatedAt: Date.now() },
            isDirty: true,
        })),

    setUrl: (url) =>
        set((state) => {
            const params = extractQueryParams(url);
            return {
                activeRequest: { ...state.activeRequest, url, params, updatedAt: Date.now() },
                isDirty: true,
            };
        }),

    updateActiveRequest: (updates) => {
        set((state) => ({
            activeRequest: {
                ...state.activeRequest,
                ...updates,
                updatedAt: Date.now(),
            },
            isDirty: true,
        }));
    },

    setName: (name) =>
        set((state) => ({
            activeRequest: { ...state.activeRequest, name, updatedAt: Date.now() },
            isDirty: true,
        })),

    setParams: (params) =>
        set((state) => {
            const url = applyQueryParamsToUrl(state.activeRequest.url, params);
            return {
                activeRequest: { ...state.activeRequest, params, url, updatedAt: Date.now() },
                isDirty: true,
            };
        }),

    setHeaders: (headers) =>
        set((state) => ({
            activeRequest: { ...state.activeRequest, headers, updatedAt: Date.now() },
            isDirty: true,
        })),

    setBody: (body) =>
        set((state) => ({
            activeRequest: { ...state.activeRequest, body, updatedAt: Date.now() },
            isDirty: true,
        })),

    loadRequest: (request) =>
        set({ activeRequest: { ...request }, isDirty: false }),

    resetRequest: () =>
        set({ activeRequest: createDefaultRequest(), isDirty: false }),

    setSavedRequests: (requests) =>
        set({ savedRequests: requests }),

    addSavedRequest: (request) =>
        set((state) => ({
            savedRequests: [request, ...state.savedRequests],
        })),

    updateSavedRequest: (request) =>
        set((state) => ({
            savedRequests: state.savedRequests.map((r) =>
                r.id === request.id ? request : r
            ),
        })),

    removeSavedRequest: (id) =>
        set((state) => ({
            savedRequests: state.savedRequests.filter((r) => r.id !== id),
        })),

    folders: [],

    setFolders: (folders) =>
        set({ folders }),

    addFolder: (folder) =>
        set((state) => ({
            folders: [folder, ...state.folders],
        })),

    updateFolder: (folder) =>
        set((state) => ({
            folders: state.folders.map((f) =>
                f.id === folder.id ? folder : f
            ),
        })),

    removeFolder: (id) =>
        set((state) => ({
            folders: state.folders.filter((f) => f.id !== id),
        })),
}));
