import { create } from "zustand";
import { EnvironmentVariable } from "@/types/environment";

interface EnvironmentState {
    variables: EnvironmentVariable[];
    setVariables: (variables: EnvironmentVariable[]) => void;
    addVariable: () => void;
    updateVariable: (index: number, variable: EnvironmentVariable) => void;
    removeVariable: (index: number) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
    variables: [{ key: "", value: "" }],

    setVariables: (variables) =>
        set({ variables }),

    addVariable: () =>
        set((state) => ({
            variables: [...state.variables, { key: "", value: "" }],
        })),

    updateVariable: (index, variable) =>
        set((state) => ({
            variables: state.variables.map((v, i) => (i === index ? variable : v)),
        })),

    removeVariable: (index) =>
        set((state) => ({
            variables: state.variables.filter((_, i) => i !== index),
        })),
}));
