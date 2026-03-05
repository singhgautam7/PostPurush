import { create } from "zustand";
import { HttpMethod, KeyValuePair, RequestBody, SavedRequest } from "@/types/request";

interface RequestState {
    activeRequest: SavedRequest;
    savedRequests: SavedRequest[];
    setMethod: (method: HttpMethod) => void;
    setUrl: (url: string) => void;
    setName: (name: string) => void;
    setParams: (params: KeyValuePair[]) => void;
    setHeaders: (headers: KeyValuePair[]) => void;
    setBody: (body: RequestBody) => void;
    loadRequest: (request: SavedRequest) => void;
    resetRequest: () => void;
    setSavedRequests: (requests: SavedRequest[]) => void;
    addSavedRequest: (request: SavedRequest) => void;
    updateSavedRequest: (request: SavedRequest) => void;
    removeSavedRequest: (id: string) => void;
}

const createDefaultRequest = (): SavedRequest => ({
    id: crypto.randomUUID(),
    name: "Untitled Request",
    method: "GET",
    url: "",
    params: [{ key: "", value: "" }],
    headers: [{ key: "", value: "" }],
    body: { type: "json", content: "" },
    createdAt: Date.now(),
    updatedAt: Date.now(),
});

export const useRequestStore = create<RequestState>((set) => ({
    activeRequest: createDefaultRequest(),
    savedRequests: [],

    setMethod: (method) =>
        set((state) => ({
            activeRequest: { ...state.activeRequest, method, updatedAt: Date.now() },
        })),

    setUrl: (url) =>
        set((state) => ({
            activeRequest: { ...state.activeRequest, url, updatedAt: Date.now() },
        })),

    setName: (name) =>
        set((state) => ({
            activeRequest: { ...state.activeRequest, name, updatedAt: Date.now() },
        })),

    setParams: (params) =>
        set((state) => ({
            activeRequest: { ...state.activeRequest, params, updatedAt: Date.now() },
        })),

    setHeaders: (headers) =>
        set((state) => ({
            activeRequest: { ...state.activeRequest, headers, updatedAt: Date.now() },
        })),

    setBody: (body) =>
        set((state) => ({
            activeRequest: { ...state.activeRequest, body, updatedAt: Date.now() },
        })),

    loadRequest: (request) =>
        set({ activeRequest: { ...request } }),

    resetRequest: () =>
        set({ activeRequest: createDefaultRequest() }),

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
}));
