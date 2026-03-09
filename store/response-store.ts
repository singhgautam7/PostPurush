import { create } from "zustand";
import { ApiResponse } from "@/types/response";
import { ResponseMetadata } from "@/types/response-metadata";

interface ResponseState {
    response: ApiResponse | null;
    loading: boolean;
    currentMeta: ResponseMetadata | null;
    setResponse: (response: ApiResponse) => void;
    clearResponse: () => void;
    setLoading: (loading: boolean) => void;
    setCurrentMeta: (meta: ResponseMetadata | null) => void;
}

export const useResponseStore = create<ResponseState>((set) => ({
    response: null,
    loading: false,
    currentMeta: null,

    setResponse: (response) =>
        set({ response, loading: false }),

    clearResponse: () =>
        set({ response: null, currentMeta: null }),

    setLoading: (loading) =>
        set({ loading }),

    setCurrentMeta: (currentMeta) =>
        set({ currentMeta }),
}));

// --- In-memory response cache per tab (not persisted across refreshes) ---

const responseCache = new Map<string, { response: ApiResponse; meta: ResponseMetadata | null }>();

/** Save the current active response into the cache for the given requestId. */
export function cacheCurrentResponse(requestId: string) {
    const { response, currentMeta } = useResponseStore.getState();
    if (response) {
        responseCache.set(requestId, { response, meta: currentMeta });
    }
}

/** Restore a cached response for requestId into the active store. Returns true if found. */
export function restoreResponseFromCache(requestId: string): boolean {
    const cached = responseCache.get(requestId);
    if (cached) {
        useResponseStore.setState({ response: cached.response, currentMeta: cached.meta });
        return true;
    }
    useResponseStore.setState({ response: null, currentMeta: null });
    return false;
}

/** Remove a cached response (e.g. when closing a tab). */
export function removeResponseFromCache(requestId: string) {
    responseCache.delete(requestId);
}
