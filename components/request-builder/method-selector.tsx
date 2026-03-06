"use client";

import { HttpMethod } from "@/types/request";
import { useRequestStore } from "@/store/request-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const methods: { value: HttpMethod; color: string }[] = [
  { value: "GET", color: "text-emerald-400" },
  { value: "POST", color: "text-amber-400" },
  { value: "PUT", color: "text-blue-400" },
  { value: "PATCH", color: "text-purple-400" },
  { value: "DELETE", color: "text-red-400" },
];

export function MethodSelector() {
  const method = useRequestStore((s) => s.activeRequest.method);
  const setMethod = useRequestStore((s) => s.setMethod);

  const currentMethod = methods.find((m) => m.value === method);

  return (
    <Select value={method} onValueChange={(v) => setMethod(v as HttpMethod)}>
      <SelectTrigger className="w-[130px] h-10 border-border/50 bg-muted/50 font-mono font-semibold text-sm">
        <SelectValue>
          <span className={currentMethod?.color}>{method}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {methods.map((m) => (
          <SelectItem key={m.value} value={m.value}>
            <span className={`font-mono font-semibold ${m.color}`}>
              {m.value}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
