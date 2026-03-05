import { SavedRequest } from "@/types/request";
import { generateCurl } from "./curl";
import { generatePython } from "./python";
import { generateJavascript } from "./javascript";
import { generateGo } from "./go";

export type CodeLanguage = "curl" | "python" | "javascript" | "go";

const generators: Record<CodeLanguage, (request: SavedRequest) => string> = {
    curl: generateCurl,
    python: generatePython,
    javascript: generateJavascript,
    go: generateGo,
};

export function generateCode(
    request: SavedRequest,
    language: CodeLanguage
): string {
    const generator = generators[language];
    if (!generator) {
        throw new Error(`Unsupported language: ${language}`);
    }
    return generator(request);
}

export const supportedLanguages: { value: CodeLanguage; label: string }[] = [
    { value: "curl", label: "cURL" },
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "go", label: "Go" },
];
