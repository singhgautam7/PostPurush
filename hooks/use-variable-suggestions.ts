import { useMemo, useRef, useCallback } from "react";
import { useEnvironmentStore } from "@/store/environment-store";
import { Environment } from "@/types/environment";
import { toast } from "sonner";
import { Globe } from "lucide-react";
import React from "react";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Build highlighted HTML for text containing {{variable}} tokens.
 * Plain text is rendered in `color: var(--color-foreground)` (same as textarea)
 * so it overlaps perfectly. Only {{...}} tokens get a different color.
 */
export function highlightVariables(
  text: string,
  env: Environment | undefined
): string {
  const escaped = escapeHtml(text || "");
  if (!escaped) return "";
  return escaped.replace(
    /\{\{([^}]*)\}\}/g,
    (match, key) => {
      const trimmed = key.trim();
      if (!env) {
        // No env selected — render tokens in normal text color (no highlight)
        return match;
      }
      const exists = env.variables.some(
        (v) => v.enabled && v.key === trimmed
      );
      const color = exists ? "var(--var-valid)" : "var(--var-missing)";
      return `<span style="color:${color};font-weight:500">${match}</span>`;
    }
  );
}

export function useVariableSuggestions(value: string, cursorPos: number) {
  const activeEnvFn = useEnvironmentStore((s) => s.activeEnv);
  // Subscribe to reactive data so we re-render when env changes
  const _activeEnvId = useEnvironmentStore((s) => s.activeEnvId);
  const _envVariables = useEnvironmentStore((s) => {
    const env = s.environments.find((e) => e.id === s.activeEnvId);
    return env?.variables;
  });
  const currentEnv = activeEnvFn();
  const toastShownRef = useRef(false);

  const textBeforeCursor = value.slice(0, cursorPos);
  const match = textBeforeCursor.match(/\{\{([^}]*)$/);

  const isTriggered = !!match;
  const query = match?.[1] ?? "";

  const suggestions = useMemo(() => {
    if (!isTriggered || !currentEnv) return [];
    return currentEnv.variables.filter(
      (v) =>
        v.enabled &&
        v.key &&
        v.key.toLowerCase().startsWith(query.toLowerCase())
    );
  }, [isTriggered, query, currentEnv]);

  const noEnvWarning = isTriggered && !currentEnv;

  const showNoEnvToast = useCallback(() => {
    if (!noEnvWarning) return;
    if (toastShownRef.current) return;
    toastShownRef.current = true;
    toast("Select an environment first", {
      description: "Choose an environment from the dropdown to use variables.",
      icon: React.createElement(Globe, { size: 14 }),
      duration: 3000,
    });
    setTimeout(() => {
      toastShownRef.current = false;
    }, 3000);
  }, [noEnvWarning]);

  const highlightedHtml = useMemo(
    () => highlightVariables(value, currentEnv),
    [value, currentEnv]
  );

  return {
    isTriggered,
    suggestions,
    query,
    noEnvWarning,
    showNoEnvToast,
    highlightedHtml,
    currentEnv,
  };
}
