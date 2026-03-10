import { KeyValuePair } from "@/types/request";

interface DocParamSectionProps {
  title: string;
  rows: KeyValuePair[];
}

export function DocParamSection({ title, rows }: DocParamSectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle border-b border-border pb-1.5">
        {title}
      </h4>
      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={`${row.key}-${i}`} className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold font-mono text-accent">
                {row.key}
              </span>
              <span className="text-xs text-foreground-subtle">
                {row.type ?? "string"}
              </span>
              {row.value && !row.sensitive && (
                <code className="text-xs text-foreground-subtle font-mono">
                  {row.value}
                </code>
              )}
              {row.sensitive && (
                <span className="text-xs text-foreground-subtle italic font-mono">
                  ●●●●● (sensitive)
                </span>
              )}
              <span
                className={`ml-auto text-xs font-medium ${
                  row.deprecated
                    ? "text-amber-400"
                    : row.required
                      ? "text-accent"
                      : "text-foreground-subtle"
                }`}
              >
                {row.deprecated
                  ? "Deprecated"
                  : row.required
                    ? "Required"
                    : "Optional"}
              </span>
            </div>
            {row.description && (
              <p className="text-xs text-foreground-muted leading-relaxed">
                {row.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
