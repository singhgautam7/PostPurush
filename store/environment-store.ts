import { create } from "zustand";
import { Environment, EnvVariable } from "@/types/environment";
import {
  saveEnvironmentRecord,
  loadEnvironments,
  deleteEnvironmentRecord,
} from "@/lib/storage/storage-helpers";
import { toast } from "sonner";

interface EnvironmentState {
  environments: Environment[];
  activeEnvId: string | null;
  initialized: boolean;

  // Computed
  activeEnv: () => Environment | undefined;

  // Init
  init: () => Promise<void>;

  // Environment CRUD
  createEnvironment: (name: string, description?: string) => Promise<Environment>;
  updateEnvironment: (id: string, updates: Partial<Pick<Environment, "name" | "description">>) => Promise<void>;
  deleteEnvironment: (id: string) => Promise<void>;
  duplicateEnvironment: (id: string) => Promise<Environment | undefined>;

  // Active env
  setActiveEnvId: (id: string | null) => void;

  // Variable CRUD
  upsertVariable: (envId: string, variable: EnvVariable) => Promise<void>;
  deleteVariable: (envId: string, variableId: string) => Promise<void>;
  setVariables: (envId: string, variables: EnvVariable[]) => Promise<void>;

  // Variable resolution
  resolveValue: (raw: string) => string;
}

const ACTIVE_ENV_KEY = "postpurush-active-env-id";

export const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  environments: [],
  activeEnvId: null,
  initialized: false,

  activeEnv: () => {
    const { environments, activeEnvId } = get();
    return environments.find((e) => e.id === activeEnvId);
  },

  init: async () => {
    if (get().initialized) return;
    try {
      const envs = await loadEnvironments();
      const storedActiveId = localStorage.getItem(ACTIVE_ENV_KEY);
      const activeId = envs.some((e) => e.id === storedActiveId) ? storedActiveId : null;
      set({ environments: envs, activeEnvId: activeId, initialized: true });
    } catch {
      set({ initialized: true });
    }
  },

  createEnvironment: async (name: string, description?: string) => {
    const now = Date.now();
    const env: Environment = {
      id: crypto.randomUUID(),
      name,
      ...(description ? { description } : {}),
      variables: [],
      createdAt: now,
      updatedAt: now,
    };
    await saveEnvironmentRecord(env);
    set((s) => ({ environments: [...s.environments, env] }));
    return env;
  },

  updateEnvironment: async (id, updates) => {
    const envs = get().environments;
    const env = envs.find((e) => e.id === id);
    if (!env) return;
    const updated = { ...env, ...updates, updatedAt: Date.now() };
    await saveEnvironmentRecord(updated);
    set((s) => ({
      environments: s.environments.map((e) => (e.id === id ? updated : e)),
    }));
  },

  deleteEnvironment: async (id) => {
    await deleteEnvironmentRecord(id);
    const wasActive = get().activeEnvId === id;
    set((s) => ({
      environments: s.environments.filter((e) => e.id !== id),
      activeEnvId: wasActive ? null : s.activeEnvId,
    }));
    if (wasActive) {
      localStorage.removeItem(ACTIVE_ENV_KEY);
      toast.warning("Environment deactivated", {
        description: "The active environment was deleted. Select a new one from the dropdown.",
      });
    }
  },

  duplicateEnvironment: async (id) => {
    const env = get().environments.find((e) => e.id === id);
    if (!env) return;
    const now = Date.now();
    const dup: Environment = {
      id: crypto.randomUUID(),
      name: `${env.name} (copy)`,
      ...(env.description ? { description: env.description } : {}),
      variables: env.variables.map((v) => ({ ...v, id: crypto.randomUUID() })),
      createdAt: now,
      updatedAt: now,
    };
    await saveEnvironmentRecord(dup);
    set((s) => ({ environments: [...s.environments, dup] }));
    return dup;
  },

  setActiveEnvId: (id) => {
    set({ activeEnvId: id });
    if (id) {
      localStorage.setItem(ACTIVE_ENV_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_ENV_KEY);
    }
  },

  upsertVariable: async (envId, variable) => {
    const envs = get().environments;
    const env = envs.find((e) => e.id === envId);
    if (!env) return;
    const exists = env.variables.some((v) => v.id === variable.id);
    const newVars = exists
      ? env.variables.map((v) => (v.id === variable.id ? variable : v))
      : [...env.variables, variable];
    const updated = { ...env, variables: newVars, updatedAt: Date.now() };
    await saveEnvironmentRecord(updated);
    set((s) => ({
      environments: s.environments.map((e) => (e.id === envId ? updated : e)),
    }));
  },

  deleteVariable: async (envId, variableId) => {
    const envs = get().environments;
    const env = envs.find((e) => e.id === envId);
    if (!env) return;
    const updated = {
      ...env,
      variables: env.variables.filter((v) => v.id !== variableId),
      updatedAt: Date.now(),
    };
    await saveEnvironmentRecord(updated);
    set((s) => ({
      environments: s.environments.map((e) => (e.id === envId ? updated : e)),
    }));
  },

  setVariables: async (envId, variables) => {
    const envs = get().environments;
    const env = envs.find((e) => e.id === envId);
    if (!env) return;
    const updated = { ...env, variables, updatedAt: Date.now() };
    await saveEnvironmentRecord(updated);
    set((s) => ({
      environments: s.environments.map((e) => (e.id === envId ? updated : e)),
    }));
  },

  resolveValue: (raw: string) => {
    if (!raw) return raw;
    const env = get().activeEnv();
    if (!env) return raw;
    return raw.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const variable = env.variables.find(
        (v) => v.enabled && v.key === key.trim()
      );
      return variable ? variable.value : match;
    });
  },
}));
