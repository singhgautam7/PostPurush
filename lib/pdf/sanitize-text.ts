export function sanitizePdfText(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/\u2014/g, "--") // em dash
    .replace(/\u2013/g, "-") // en dash
    .replace(/\u2026/g, "...") // ellipsis
    .replace(/[^\x00-\x7F]/g, ""); // strip remaining non-ASCII
}
