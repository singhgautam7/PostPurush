import { KeyValuePair } from "@/types/request";

export type AuthPresetName = "Bearer Token" | "Basic Auth" | "API Key" | "JWT";

export const AuthPresets: Record<AuthPresetName, KeyValuePair> = {
    "Bearer Token": { key: "Authorization", value: "Bearer <token>" },
    "Basic Auth": { key: "Authorization", value: "Basic <credentials>" },
    "API Key": { key: "x-api-key", value: "<your-api-key>" },
    "JWT": { key: "Authorization", value: "JWT <token>" },
};
