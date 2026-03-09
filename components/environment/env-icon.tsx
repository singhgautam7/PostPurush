"use client";

import * as LucideIcons from "lucide-react";
import { getEnvIconName } from "@/lib/env-presets";

interface EnvIconProps {
  name?: string | null;
  className?: string;
  size?: number;
}

export function EnvIcon({ name, className, size = 18 }: EnvIconProps) {
  const iconName = getEnvIconName(name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[iconName] ?? LucideIcons.Globe;
  return <Icon size={size} className={className} />;
}
