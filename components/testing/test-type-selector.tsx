"use client";

import { CheckCircle2, Zap, Gauge, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { TestType } from "@/types/testing";

const testTypes: {
  type: TestType;
  icon: typeof CheckCircle2;
  title: string;
  description: string;
}[] = [
  {
    type: "assertion",
    icon: CheckCircle2,
    title: "Assertion Test",
    description: "Validate response correctness",
  },
  {
    type: "load",
    icon: Zap,
    title: "Load Test",
    description: "Measure performance under load",
  },
  {
    type: "rate-limit",
    icon: Gauge,
    title: "Rate Limit Detection",
    description: "Discover request limits",
  },
  {
    type: "uptime",
    icon: Activity,
    title: "Uptime Monitor",
    description: "Detect endpoint flakiness",
  },
];

interface TestTypeSelectorProps {
  selected: TestType;
  onSelect: (type: TestType) => void;
  disabled?: boolean;
}

export function TestTypeSelector({
  selected,
  onSelect,
  disabled,
}: TestTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {testTypes.map(({ type, icon: Icon, title, description }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          disabled={disabled}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
            "bg-panel border-border hover:bg-raised",
            selected === type &&
              "border-primary-action/50 ring-1 ring-primary-action/20 bg-raised",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Icon
            size={18}
            className={cn(
              "mt-0.5 shrink-0",
              selected === type
                ? "text-primary-action"
                : "text-foreground-subtle"
            )}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-foreground-subtle mt-0.5">
              {description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
