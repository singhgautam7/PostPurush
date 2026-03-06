import { create } from "zustand";

export interface Tab {
    id: string; // unique ID for the tab instance
    requestId: string; // ID of the saved request, or the draft request ID
    title: string;
    isDirty?: boolean;
}

interface TabState {
    tabs: Tab[];
    activeTabId: string | null;
    openTab: (requestId: string, title?: string) => void;
    closeTab: (tabId: string) => void;
    setActiveTab: (tabId: string) => void;
    updateTab: (tabId: string, updates: Partial<Tab>) => void;
    reorderTabs: (activeId: string, overId: string) => void;
}

export const useTabStore = create<TabState>((set, get) => ({
    tabs: [],
    activeTabId: null,

    openTab: (requestId, title = "Untitled Request") => {
        const { tabs } = get();
        // Check if a tab for this request already exists
        const existingTab = tabs.find((t) => t.requestId === requestId);

        if (existingTab) {
            set({ activeTabId: existingTab.id });
            return;
        }

        // Create new tab
        const newTab: Tab = {
            id: crypto.randomUUID(),
            requestId,
            title,
            isDirty: false,
        };

        set({
            tabs: [...tabs, newTab],
            activeTabId: newTab.id,
        });
    },

    closeTab: (tabId) => {
        const { tabs, activeTabId } = get();
        const newTabs = tabs.filter((t) => t.id !== tabId);

        let newActiveTabId = activeTabId;

        // If we closed the active tab, switch to another one (the previous one, or null)
        if (activeTabId === tabId) {
            if (newTabs.length > 0) {
                const closedIndex = tabs.findIndex((t) => t.id === tabId);
                const nextIndex = Math.max(0, closedIndex - 1);
                newActiveTabId = newTabs[nextIndex].id;
            } else {
                newActiveTabId = null;
            }
        }

        set({ tabs: newTabs, activeTabId: newActiveTabId });
    },

    setActiveTab: (tabId) => set({ activeTabId: tabId }),

    updateTab: (tabId, updates) =>
        set((state) => ({
            tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, ...updates } : t)),
        })),

    reorderTabs: (activeId, overId) =>
        set((state) => {
            const oldIndex = state.tabs.findIndex((t) => t.id === activeId);
            const newIndex = state.tabs.findIndex((t) => t.id === overId);
            if (oldIndex < 0 || newIndex < 0) return state;

            const newTabs = [...state.tabs];
            const [movedTab] = newTabs.splice(oldIndex, 1);
            newTabs.splice(newIndex, 0, movedTab);

            return { tabs: newTabs };
        }),
}));
