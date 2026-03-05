import { create } from "zustand";
import { ApiResponse } from "@/types/response";

interface ResponseState {
    response: ApiResponse | null;
    loading: boolean;
    setResponse: (response: ApiResponse) => void;
    clearResponse: () => void;
    setLoading: (loading: boolean) => void;
}

export const useResponseStore = create<ResponseState>((set) => ({
    response: null,
    loading: false,

    setResponse: (response) =>
        set({ response, loading: false }),

    clearResponse: () =>
        set({ response: null }),

    setLoading: (loading) =>
        set({ loading }),
}));
