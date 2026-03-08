import { EnvironmentVariable } from "@/types/environment";
import { Environment } from "@/types/environment";

export function replaceVariables(
    text: string,
    variables: EnvironmentVariable[]
): string {
    if (!text) return text;

    let result = text;
    for (const { key, value } of variables) {
        if (key) {
            const pattern = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, "g");
            result = result.replace(pattern, value);
        }
    }
    return result;
}

/**
 * Returns true if `text` contains any {{variable}} tokens that cannot be
 * resolved against the active environment.
 */
export function hasInvalidVariables(
    text: string,
    activeEnv: Environment | undefined
): boolean {
    if (!text) return false;
    const matches = [...text.matchAll(/\{\{([^}]+)\}\}/g)];
    if (matches.length === 0) return false;
    if (!activeEnv) return true;
    return matches.some(
        (m) => !activeEnv.variables.some((v) => v.enabled && v.key === m[1].trim())
    );
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
