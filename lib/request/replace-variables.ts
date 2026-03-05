import { EnvironmentVariable } from "@/types/environment";

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

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
