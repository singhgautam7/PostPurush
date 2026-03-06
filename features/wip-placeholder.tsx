"use client";

import { Construction } from "lucide-react";

interface WipPlaceholderProps {
  title: string;
}

export function WipPlaceholder({ title }: WipPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-background gap-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 border border-border/30">
        <Construction className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <div className="text-center space-y-1.5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">This feature is under development.</p>
      </div>
    </div>
  );
}
