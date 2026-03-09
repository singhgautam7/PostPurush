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
