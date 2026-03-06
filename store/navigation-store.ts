"use client";

import { create } from "zustand";

export type NavigationSection = "collections" | "testing" | "docs" | "stress" | "analytics" | "env" | "help";

interface NavigationState {
    activeSection: NavigationSection;
    setActiveSection: (section: NavigationSection) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    activeSection: "collections",
    setActiveSection: (section) => set({ activeSection: section }),
}));
