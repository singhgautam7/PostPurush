/**
 * Read the computed --primary color from the DOM at export time
 * and convert to hex for @react-pdf/renderer (which can't use CSS vars).
 *
 * Uses a temp element so the browser resolves oklch / hsl / etc. to rgb().
 */
export function getAccentColorForPdf(): string {
  if (typeof window === "undefined") return "#6366f1";

  const el = document.createElement("div");
  el.style.color = "var(--primary)";
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color; // "rgb(r, g, b)" or "rgba(…)"
  document.body.removeChild(el);

  const hex = rgbStringToHex(computed);
  return hex ?? "#6366f1";
}

/**
 * If the accent is too close to pure white or black,
 * it won't look good on a white PDF. Fall back to indigo.
 */
export function safeAccentForPdf(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Relative luminance (simplified)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Too bright (> 0.85) or too dark (< 0.15) → fallback
  if (lum > 0.85 || lum < 0.15) return "#6366f1";

  return hex;
}

function rgbStringToHex(rgb: string): string | null {
  const match = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return null;
  const [, r, g, b] = match;
  return (
    "#" +
    [r, g, b].map((c) => parseInt(c).toString(16).padStart(2, "0")).join("")
  );
}
