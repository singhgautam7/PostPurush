export const PRESET_COLORS: Record<string, { bg: string; text: string; ring: string; swatch: string; label: string }> = {
  gray:    { bg: "bg-zinc-500/15",    text: "text-zinc-400",    ring: "ring-zinc-400",    swatch: "bg-zinc-500",    label: "Gray" },
  blue:    { bg: "bg-blue-500/15",    text: "text-blue-400",    ring: "ring-blue-400",    swatch: "bg-blue-500",    label: "Blue" },
  emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400", ring: "ring-emerald-400", swatch: "bg-emerald-500", label: "Green" },
  orange:  { bg: "bg-orange-500/15",  text: "text-orange-400",  ring: "ring-orange-400",  swatch: "bg-orange-500",  label: "Orange" },
  red:     { bg: "bg-red-500/15",     text: "text-red-400",     ring: "ring-red-400",     swatch: "bg-red-500",     label: "Red" },
  purple:  { bg: "bg-purple-500/15",  text: "text-purple-400",  ring: "ring-purple-400",  swatch: "bg-purple-500",  label: "Purple" },
  pink:    { bg: "bg-pink-500/15",    text: "text-pink-400",    ring: "ring-pink-400",    swatch: "bg-pink-500",    label: "Pink" },
  yellow:  { bg: "bg-yellow-500/15",  text: "text-yellow-400",  ring: "ring-yellow-400",  swatch: "bg-yellow-500",  label: "Yellow" },
  cyan:    { bg: "bg-cyan-500/15",    text: "text-cyan-400",    ring: "ring-cyan-400",    swatch: "bg-cyan-500",    label: "Cyan" },
  rose:    { bg: "bg-rose-500/15",    text: "text-rose-400",    ring: "ring-rose-400",    swatch: "bg-rose-500",    label: "Rose" },
  indigo:  { bg: "bg-indigo-500/15",  text: "text-indigo-400",  ring: "ring-indigo-400",  swatch: "bg-indigo-500",  label: "Indigo" },
};

export const PRESET_ICONS = [
  "Globe",
  "Server",
  "Database",
  "Cloud",
  "Lock",
  "Zap",
  "FlaskConical",
  "Laptop",
  "Building2",
  "Rocket",
] as const;

export type EnvColor = keyof typeof PRESET_COLORS;
export type EnvIcon = (typeof PRESET_ICONS)[number];

export function getEnvColor(color?: string | null) {
  return PRESET_COLORS[color ?? "gray"] ?? PRESET_COLORS.gray;
}

export function getEnvIconName(iconName?: string | null): string {
  return iconName ?? "Globe";
}
